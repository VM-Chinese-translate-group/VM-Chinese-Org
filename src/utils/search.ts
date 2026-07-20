import type { RankedSearchItem, SearchIndexItem } from '@/types/search'

const MAX_RESULTS = 15

export function normalizeSearchText(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim()
}

export function getSearchTerms(query: string) {
  return [...new Set(normalizeSearchText(query).split(' ').filter(Boolean))]
}

function scoreField(value: string, query: string, terms: string[], weight: number) {
  const normalized = normalizeSearchText(value)
  if (!normalized) return 0

  let score = 0

  if (normalized === query) score += weight * 8
  else if (normalized.startsWith(query)) score += weight * 6
  else if (normalized.includes(query)) score += weight * 4

  for (const term of terms) {
    if (normalized === term) score += weight * 3
    else if (normalized.startsWith(term)) score += weight * 2
    else if (normalized.includes(term)) score += weight
  }

  return score
}

function getLocalizedFields(item: SearchIndexItem, locale: string) {
  if (locale === 'en-US' && item.originalName) {
    return {
      primaryText: item.text,
      primaryTitle: item.originalName,
      secondaryTitles: [item.title, item.titleTW],
    }
  }

  if (locale === 'zh-TW') {
    return {
      primaryText: item.textTW,
      primaryTitle: item.titleTW,
      secondaryTitles: [item.title, item.originalName || ''],
    }
  }

  return {
    primaryText: item.text,
    primaryTitle: item.title,
    secondaryTitles: [item.originalName || '', item.titleTW],
  }
}

export function rankSearchIndex(
  items: SearchIndexItem[],
  rawQuery: string,
  locale: string,
  limit = MAX_RESULTS,
): RankedSearchItem[] {
  const query = normalizeSearchText(rawQuery)
  const terms = getSearchTerms(query)
  if (!query || !terms.length) return []

  const queryLength = Array.from(query.replace(/\s/g, '')).length
  const searchContent = queryLength >= 2

  return items
    .map((item) => {
      const { primaryText, primaryTitle, secondaryTitles } = getLocalizedFields(item, locale)
      const titleFields = [primaryTitle, ...secondaryTitles]
      const searchableFields = [
        ...titleFields,
        item.url.replace(/[\/_-]+/g, ' '),
        ...(searchContent ? [primaryText, item.text, item.textTW] : []),
      ].map(normalizeSearchText)

      if (!terms.every((term) => searchableFields.some((field) => field.includes(term)))) {
        return { item, score: 0 }
      }

      let score = scoreField(primaryTitle, query, terms, 120)
      score += scoreField(secondaryTitles[0] || '', query, terms, 80)
      score += scoreField(secondaryTitles[1] || '', query, terms, 60)
      score += scoreField(item.url.replace(/[\/_-]+/g, ' '), query, terms, 35)

      if (searchContent) {
        score += scoreField(primaryText, query, terms, 8)

        if (primaryText !== item.text) score += scoreField(item.text, query, terms, 3)
        if (primaryText !== item.textTW) score += scoreField(item.textTW, query, terms, 3)
      }

      return { item, score }
    })
    .filter((result) => result.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.item.title.localeCompare(right.item.title, locale, { sensitivity: 'base' }),
    )
    .slice(0, limit)
}

export function createSearchSnippet(text: string, rawQuery: string, maxLength = 100) {
  const compactText = text.replace(/\s+/g, ' ').trim()
  if (compactText.length <= maxLength) return compactText

  const normalizedText = normalizeSearchText(compactText)
  const candidates = [normalizeSearchText(rawQuery), ...getSearchTerms(rawQuery)]
  const matchPositions = candidates
    .map((term) => normalizedText.indexOf(term))
    .filter((position) => position >= 0)
  const matchPosition = matchPositions.length ? Math.min(...matchPositions) : 0
  const start = Math.max(0, matchPosition - Math.floor(maxLength * 0.35))
  const end = Math.min(compactText.length, start + maxLength)

  return `${start > 0 ? '…' : ''}${compactText.slice(start, end).trim()}${
    end < compactText.length ? '…' : ''
  }`
}
