export type ResourceStatusType = 'maintaining' | 'stopped' | string

export interface ResourceItem {
  author: string
  date?: number
  description?: string
  displayDate?: string
  icon: string
  link: string
  name: string
  status?: {
    type: ResourceStatusType
  }
  versions?: {
    loader?: string
    mc?: string
    pack?: string
  }
}

export interface ResourceOverviewCard {
  description: string
  icon: string
  link: string
  title: string
  value: string
}

export interface ResourceBrowseCard extends ResourceOverviewCard {
  badge: string
}
