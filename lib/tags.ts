export interface Tag {
  type: string
  value: string
}

export interface TagCategory {
  type: string
  tags: string[]
}

export const TAG_CATEGORIES: TagCategory[] = [
  {
    type: 'Channel',
    tags: ['Channel 1', 'Channel 2']
  },
  {
    type: 'Format',
    tags: ['Music', 'Talks', 'Interview', 'Experimental', 'Educational', 'Archival', 'Docu']
  },
  {
    type: 'Genre',
    tags: [
      'Techno',
      'House',
      'UK Dance',
      'Footwork',
      'Ambient',
      'Disco',
      'Blues',
      'Rock',
      'Folk',
      'Jazz',
      'Funk',
      'R&B',
      'Hip Hop',
      'Reggae',
      'Dancehall',
      'Afrobeat',
      'Eclectic'
    ]
  },
  {
    type: 'Topic',
    tags: ['Outdoor Recreation', 'Design', 'Art', 'Music', 'History', 'Natural Science']
  }
]

