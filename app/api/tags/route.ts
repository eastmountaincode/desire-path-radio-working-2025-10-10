import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

type TagType = 'CHANNEL' | 'FORMAT' | 'GENRE' | 'TOPIC'

interface Tag {
  id: number
  name: string
  slug: string
  type: TagType
}

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const { data: tags, error } = await supabase
      .from('tags')
      .select('id, name, slug, type')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching tags:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tags' },
        { status: 500 }
      )
    }

    const typedTags = tags as Tag[] | null

    // Group tags by type
    const groupedTags = {
      CHANNEL: typedTags?.filter(tag => tag.type === 'CHANNEL') || [],
      FORMAT: typedTags?.filter(tag => tag.type === 'FORMAT') || [],
      GENRE: typedTags?.filter(tag => tag.type === 'GENRE') || [],
      TOPIC: typedTags?.filter(tag => tag.type === 'TOPIC') || []
    }

    return NextResponse.json(groupedTags)
  } catch (error) {
    console.error('Unexpected error fetching tags:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

