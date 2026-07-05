export type ResourceStatusType = 'maintaining' | 'stopped' | string

export interface ResourceItem {
  author: string
  date?: number
  description?: string
  displayDate?: string
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
