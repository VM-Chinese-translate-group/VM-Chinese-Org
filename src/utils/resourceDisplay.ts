type ResourceNameSource = {
  name?: string
  originalName?: string
  title?: string
}

export function isEnglishLocale(locale: string) {
  return locale.toLowerCase().startsWith('en')
}

export function getLocalizedResourceName(item: ResourceNameSource, locale: string, fallback = '') {
  if (isEnglishLocale(locale) && item.originalName) return item.originalName
  return item.name || item.title || fallback
}
