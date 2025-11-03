import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'

// Database schema to provide as context to LLM
const DATABASE_SCHEMA = `
-- enums
CREATE TYPE test_type_enum AS ENUM ('none', 'jest', 'manual');
CREATE TYPE episode_status_enum AS ENUM ('draft', 'published');
CREATE TYPE tag_type_enum AS ENUM ('CHANNEL', 'FORMAT', 'GENRE', 'TOPIC');

-- tables
CREATE TABLE episodes (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    aired_on DATE NOT NULL,
    audio_url TEXT NOT NULL,
    image_url TEXT,
    duration_seconds INTEGER,
    test_type test_type_enum NOT NULL DEFAULT 'none',
    status episode_status_enum NOT NULL DEFAULT 'published',
    location TEXT,
    play_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE hosts (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    organization TEXT
);

CREATE TABLE episode_hosts (
    episode_id INTEGER NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
    host_id INTEGER NOT NULL REFERENCES hosts(id) ON DELETE CASCADE,
    PRIMARY KEY (episode_id, host_id)
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type tag_type_enum NOT NULL
);

CREATE TABLE episode_tags (
    episode_id INTEGER NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (episode_id, tag_id)
);

CREATE TABLE episode_highlights (
    id INTEGER PRIMARY KEY,
    episode_id INTEGER NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE coming_up_text (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL
);

CREATE TABLE schedule_image (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    image_key TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE admin_logs (
    id BIGINT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
`

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

async function generateSQLFromNaturalLanguage(userQuery: string): Promise<string> {
  const prompt = `You are an assistant that writes PostgreSQL queries for Supabase.

Database schema:
${DATABASE_SCHEMA}

Rules:
- Output ONLY SQL. No backticks, no explanation.
- Only SELECT queries.
- Use the table and column names exactly as shown.
- If user asks for "top" or "most recent", add ORDER BY and LIMIT.
- If date is needed, assume now().

User question: "${userQuery}"`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Extract the SQL from the response
    const content = message.content[0]
    if (content.type === 'text') {
      let sql = content.text.trim()
      // Remove any markdown code blocks if present
      sql = sql.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim()
      // Remove trailing semicolon if present (causes issues with our RPC function)
      sql = sql.replace(/;+\s*$/g, '')
      return sql
    }

    throw new Error('Unexpected response format from Claude')
  } catch (error) {
    console.error('Error calling Claude API:', error)
    throw new Error('Failed to generate SQL from natural language')
  }
}

// Execute raw SQL query against Supabase
async function executeRawSQL(supabase: Awaited<ReturnType<typeof createServerSupabase>>, sqlQuery: string) {
  try {
    // For security, validate it's a SELECT query only
    const normalizedSQL = sqlQuery.trim().toLowerCase()
    if (!normalizedSQL.startsWith('select')) {
      throw new Error('Only SELECT queries are allowed for security')
    }

    // Use Supabase RPC to execute raw SQL
    // You'll need to create this function in your Supabase database first:
    // 
    // CREATE OR REPLACE FUNCTION execute_raw_sql(sql_query text)
    // RETURNS json AS $$
    // DECLARE
    //   result json;
    // BEGIN
    //   EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || sql_query || ') t' INTO result;
    //   RETURN COALESCE(result, '[]'::json);
    // END;
    // $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    const { data, error } = await supabase.rpc('execute_raw_sql', { sql_query: sqlQuery } as never)

    if (error) {
      throw error
    }

    return { data: data || [], error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const isAuthenticated = cookieStore.get('admin_authenticated')?.value === 'true'

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { query } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Step 1: Generate SQL from natural language using LLM
    let generatedSQL: string
    try {
      generatedSQL = await generateSQLFromNaturalLanguage(query)
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Failed to generate SQL' },
        { status: 500 }
      )
    }

    // Step 2: Execute the SQL against Supabase
    const supabase = await createServerSupabase()
    const { data, error } = await executeRawSQL(supabase, generatedSQL)

    if (error) {
      console.error('Failed to execute query:', error)
      return NextResponse.json(
        { error: 'Failed to execute query: ' + (error instanceof Error ? error.message : 'Unknown error') },
        { status: 500 }
      )
    }

    // Step 3: Format and return results
    const rows = Array.isArray(data) ? data : []
    const columns = rows.length > 0 ? Object.keys(rows[0]) : []

    return NextResponse.json({
      columns,
      rows,
      rowCount: rows.length,
      query: generatedSQL,
    })

  } catch (error) {
    console.error('AI Query API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Optional: GET endpoint to retrieve database schema for reference
export async function GET() {
  try {
    const cookieStore = await cookies()
    const isAuthenticated = cookieStore.get('admin_authenticated')?.value === 'true'

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      schema: DATABASE_SCHEMA,
      note: 'Use this schema as context when generating SQL queries',
    })
  } catch (error) {
    console.error('Schema API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
