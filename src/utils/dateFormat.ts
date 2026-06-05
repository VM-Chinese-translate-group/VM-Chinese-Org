const CHINESE_DATE_PATTERN = /^(\d{4})年(\d{1,2})月(\d{1,2})日$/
const DASH_DATE_PATTERN = /^(\d{4})-(\d{1,2})-(\d{1,2})$/

const englishDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function parseUpdateDate(date: string) {
  const match = date.trim().match(DASH_DATE_PATTERN) || date.trim().match(CHINESE_DATE_PATTERN)

  if (!match) return undefined

  const [, year, month, day] = match

  return {
    date: new Date(Number(year), Number(month) - 1, Number(day)),
    day,
    month,
    year,
  }
}

export function formatUpdateDate(date: string | undefined, locale: string) {
  if (!date) return ''

  const parsed = parseUpdateDate(date)
  if (!parsed) return date

  if (locale === 'en-US') return englishDateFormatter.format(parsed.date)

  return `${parsed.year}年${Number(parsed.month)}月${Number(parsed.day)}日`
}
