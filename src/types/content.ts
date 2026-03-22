export type ContentCategory =
  | 'anime'
  | 'manga'
  | 'game'
  | 'web'
  | 'tv'
  | 'movie'
  | 'music'
  | 'sns'

export type ContentItem = {
  readonly id: string
  readonly title: string
  readonly category: ContentCategory
  readonly startYear: number
  readonly startMonth?: number
  readonly endYear?: number
  readonly endMonth?: number
  readonly ongoing?: boolean
  readonly description?: string
  readonly url?: string
}

export type TimelineRange = {
  readonly startYear: number
  readonly endYear: number
}

export const CATEGORY_LABELS: Record<ContentCategory, string> = {
  anime: 'アニメ',
  manga: 'マンガ',
  game: 'ゲーム',
  web: 'Webサービス',
  tv: 'テレビ',
  movie: '映画',
  music: '音楽',
  sns: 'SNS',
}

export const CATEGORY_COLORS: Record<ContentCategory, string> = {
  anime: '#e74c3c',
  manga: '#3498db',
  game: '#2ecc71',
  web: '#9b59b6',
  tv: '#f39c12',
  movie: '#e67e22',
  music: '#1abc9c',
  sns: '#34495e',
}
