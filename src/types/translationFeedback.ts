export type FeedbackCategory = 'modpack' | 'map' | 'other'

export type FeedbackStatus = 'candidate' | 'planned' | 'translating' | 'completed'

export interface FeedbackSource {
  platform: string
  url: string
}

export interface FeedbackItem {
  id: string
  category: FeedbackCategory
  subtypes: string[]
  displayName: string
  coverUrl: string | null
  coverPlatform: string | null
  voteCount: number
  rank: number
  status: FeedbackStatus
  sources: FeedbackSource[]
  votedByCurrentVisitor: boolean
}

export interface FeedbackListResponse {
  items: FeedbackItem[]
  nextCursor: string | null
}

export interface FeedbackCandidate {
  id: string
  displayName: string
  category: FeedbackCategory
  subtypes: string[]
  confidence: number
  reason: 'platform-id' | 'same-url' | 'same-name' | 'similar-name'
  sources: FeedbackSource[]
}

export interface FeedbackSuggestionResponse {
  candidates: FeedbackCandidate[]
}

export interface FeedbackSubmissionInput {
  category: FeedbackCategory
  subtypes: string[]
  originalName: string
  urls: string[]
  note?: string
}

export interface FeedbackSubmissionResponse {
  item: FeedbackItem
  result: 'created' | 'merged'
}
