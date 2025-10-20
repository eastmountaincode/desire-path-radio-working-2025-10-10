import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

interface EpisodeWithRelations {
  id: number
  title: string
  slug: string
  description: string | null
  aired_on: string
  audio_url: string
  image_url: string | null
  duration_seconds: number | null
  hosts: Array<{
    id: number
    name: string
    organization: string | null
  }>
  tags: Array<{
    id: number
    name: string
    slug: string
    type: string
  }>
  created_at: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { searchParams } = new URL(request.url)

    // Get pagination parameters
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Get ordering parameters
    const orderBy = searchParams.get('orderBy') || 'aired_on'
    const order = searchParams.get('order') || 'desc'
    
    // Get filter parameters
    const tagsParam = searchParams.get('tags') // Comma-separated tag slugs
    const tagSlugs = tagsParam ? tagsParam.split(',').map(t => t.trim()).filter(Boolean) : []
    const includeTest = searchParams.get('includeTest') === 'true' // Default to false (production only)
    const testTypes = searchParams.get('testTypes') ? searchParams.get('testTypes')!.split(',').map(t => t.trim()).filter(Boolean) : ['none']

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      )
    }

    if (offset < 0) {
      return NextResponse.json(
        { error: 'Offset must be non-negative' },
        { status: 400 }
      )
    }

    // Validate orderBy field
    const validOrderFields = ['aired_on', 'created_at', 'title', 'id']
    if (!validOrderFields.includes(orderBy)) {
      return NextResponse.json(
        { error: `Invalid orderBy field. Must be one of: ${validOrderFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate order direction
    if (order !== 'asc' && order !== 'desc') {
      return NextResponse.json(
        { error: 'Order must be either "asc" or "desc"' },
        { status: 400 }
      )
    }

    // If filtering by tags, we need to get matching episode IDs first
    let episodeIds: number[] | null = null
    
    if (tagSlugs.length > 0) {
      // Get tag IDs from slugs
      const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select('id')
        .in('slug', tagSlugs)
      
      if (tagsError) {
        console.error('Tags query error:', tagsError)
        return NextResponse.json(
          { error: 'Failed to fetch tags' },
          { status: 500 }
        )
      }
      
      if (!tags || tags.length === 0) {
        // No matching tags found, return empty result
        return NextResponse.json({
          episodes: [],
          pagination: {
            limit,
            offset,
            total: 0,
            hasMore: false,
            orderBy,
            order,
            tags: tagSlugs
          }
        })
      }
      
      const tagIds = tags.map((t: any) => t.id)
      
      // Get episode IDs that have ALL of these tags (AND logic)
      const { data: episodeTags, error: episodeTagsError } = await supabase
        .from('episode_tags')
        .select('episode_id, tag_id')
        .in('tag_id', tagIds)

      if (episodeTagsError) {
        console.error('Episode tags query error:', episodeTagsError)
        return NextResponse.json(
          { error: 'Failed to fetch episode tags' },
          { status: 500 }
        )
      }

      // Group by episode_id and count tags per episode
      const episodeTagCounts = new Map<number, Set<number>>()
      episodeTags?.forEach((et: any) => {
        if (!episodeTagCounts.has(et.episode_id)) {
          episodeTagCounts.set(et.episode_id, new Set())
        }
        episodeTagCounts.get(et.episode_id)!.add(et.tag_id)
      })

      // Only include episodes that have ALL requested tags
      episodeIds = Array.from(episodeTagCounts.entries())
        .filter(([_, tagSet]) => tagSet.size === tagIds.length)
        .map(([episodeId, _]) => episodeId)

      if (episodeIds.length === 0) {
        // No episodes with ALL these tags
        return NextResponse.json({
          episodes: [],
          pagination: {
            limit,
            offset,
            total: 0,
            hasMore: false,
            orderBy,
            order,
            tags: tagSlugs
          }
        })
      }
    }

    // Build the query with joins
    let query = supabase
      .from('episodes')
      .select(`
        id,
        title,
        slug,
        description,
        aired_on,
        audio_url,
        image_url,
        duration_seconds,
        created_at,
        episode_hosts (
          hosts (
            id,
            name,
            organization
          )
        ),
        episode_tags (
          tags (
            id,
            name,
            slug,
            type
          )
        )
      `)
    
    // Apply filters
    if (!includeTest) {
      query = query.in('test_type', testTypes) // Only show production episodes by default
    }
    
    if (episodeIds !== null) {
      query = query.in('id', episodeIds)
    }
    
    // first sort by aired_on, the by id
    // if multiple epidoes have the same data, break ties by id
    query = query
      .order(orderBy, { ascending: order === 'asc' })
      .order('id', { ascending: order === 'asc' })
      .range(offset, offset + limit - 1)

    const { data: episodes, error } = await query

    // console.log('API RESULT', {
    //     offset,
    //     limit,
    //     orderBy,
    //     order,
    //     ids: (episodes || []).map((e: any) => e.id),
    //   })

    if (error) {
      console.error('Database query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch episodes' },
        { status: 500 }
      )
    }

    // Transform the data to flatten the nested structure
    const transformedEpisodes: EpisodeWithRelations[] = (episodes || []).map((episode: any) => ({
      id: episode.id,
      title: episode.title,
      slug: episode.slug,
      description: episode.description,
      aired_on: episode.aired_on,
      audio_url: episode.audio_url,
      image_url: episode.image_url,
      duration_seconds: episode.duration_seconds,
      created_at: episode.created_at,
      hosts: episode.episode_hosts?.map((eh: any) => eh.hosts) || [],
      tags: episode.episode_tags?.map((et: any) => et.tags) || []
    }))

    // Get total count for pagination info (with filters)
    let countQuery = supabase
      .from('episodes')
      .select('*', { count: 'exact', head: true })

    if (!includeTest) {
      countQuery = countQuery.in('test_type', testTypes)
    }
    
    if (episodeIds !== null) {
      countQuery = countQuery.in('id', episodeIds)
    }
    
    const { count } = await countQuery

    return NextResponse.json({
      episodes: transformedEpisodes,
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
        orderBy,
        order,
        includeTest,
        testTypes,
        ...(tagSlugs.length > 0 && { tags: tagSlugs })
      }
    })

  } catch (error) {
    console.error('Episodes API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

