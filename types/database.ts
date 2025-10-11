export type TagType = 'CHANNEL' | 'FORMAT' | 'GENRE' | 'TOPIC'

export interface Episode {
  id: number
  title: string
  slug: string
  description: string | null
  aired_on: string
  audio_url: string
  image_url: string | null
  duration_seconds: number | null
  created_at: string
}

export interface Guest {
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

export interface EpisodeGuest {
  episode_id: number
  guest_id: number
}

export interface EpisodeTag {
  episode_id: number
  tag_id: number
}

export interface Database {
  public: {
    Tables: {
      episodes: {
        Row: Episode
        Insert: Omit<Episode, 'id' | 'created_at'>
        Update: Partial<Omit<Episode, 'id' | 'created_at'>>
      }
      guests: {
        Row: Guest
        Insert: Omit<Guest, 'id'>
        Update: Partial<Omit<Guest, 'id'>>
      }
      tags: {
        Row: Tag
        Insert: Omit<Tag, 'id'>
        Update: Partial<Omit<Tag, 'id'>>
      }
      episode_guests: {
        Row: EpisodeGuest
        Insert: EpisodeGuest
        Update: Partial<EpisodeGuest>
      }
      episode_tags: {
        Row: EpisodeTag
        Insert: EpisodeTag
        Update: Partial<EpisodeTag>
      }
    }
  }
}

