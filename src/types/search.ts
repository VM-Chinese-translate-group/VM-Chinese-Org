export interface SearchIndexItem {
  originalName?: string
  text: string
  textTW: string
  title: string
  titleTW: string
  url: string
}

export interface RankedSearchItem {
  item: SearchIndexItem
  score: number
}
