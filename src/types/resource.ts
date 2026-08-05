export type ResourceStatusType = 'maintaining' | 'translating' | 'stopped' | string

export interface ResourceItem {
  author: string
  date?: number
  description?: string
  displayDate?: string
  featured?: boolean
  icon: string
  image?: string
  link: string
  name: string
  originalName?: string
  status?: {
    type: ResourceStatusType
  }
  versions?: {
    loader?: string
    mc?: string
    pack?: string
  }
}
