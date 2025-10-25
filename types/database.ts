export type TagType = 'CHANNEL' | 'FORMAT' | 'GENRE' | 'TOPIC'

export type TestType = 'none' | 'jest' | 'manual'

export interface Episode {
  id: number
  title: string
  slug: string
  description: string | null
  aired_on: string
  audio_url: string
  image_url: string | null
  duration_seconds: number | null
  location: string | null
  test_type: TestType
  created_at: string
}

export interface Host {
  id: number
  name: string
  organization: string | null
}

export interface Tag {
  id: number
  name: string
  slug: string
  type: TagType
}

export interface EpisodeHost {
  episode_id: number
  host_id: number
}

export interface EpisodeTag {
  episode_id: number
  tag_id: number
}

export interface ComingUpText {
  id: number
  content: string
}

export interface EpisodeHighlight {
  id: number
  episode_id: number
  display_order: number
  created_at: string
}

export interface ScheduleImage {
  id: number
  image_url: string
  image_key: string
  uploaded_at: string
}

export interface Database {
  public: {
    Tables: {
      episodes: {
        Row: Episode
        Insert: Omit<Episode, 'id' | 'created_at'> & { test_type?: TestType }
        Update: Partial<Omit<Episode, 'id' | 'created_at'>>
      }
      hosts: {
        Row: Host
        Insert: Omit<Host, 'id'>
        Update: Partial<Omit<Host, 'id'>>
      }
      tags: {
        Row: Tag
        Insert: Omit<Tag, 'id'>
        Update: Partial<Omit<Tag, 'id'>>
      }
      episode_hosts: {
        Row: EpisodeHost
        Insert: EpisodeHost
        Update: Partial<EpisodeHost>
      }
      episode_tags: {
        Row: EpisodeTag
        Insert: EpisodeTag
        Update: Partial<EpisodeTag>
      }
      coming_up_text: {
        Row: ComingUpText
        Insert: Omit<ComingUpText, 'id'>
        Update: Partial<Omit<ComingUpText, 'id'>>
      }
      episode_highlights: {
        Row: EpisodeHighlight
        Insert: Omit<EpisodeHighlight, 'id' | 'created_at'>
        Update: Partial<Omit<EpisodeHighlight, 'id' | 'created_at'>>
      }
      schedule_image: {
        Row: ScheduleImage
        Insert: Omit<ScheduleImage, 'id' | 'uploaded_at'>
        Update: Partial<Omit<ScheduleImage, 'id' | 'uploaded_at'>>
      }
    }
  }
}

