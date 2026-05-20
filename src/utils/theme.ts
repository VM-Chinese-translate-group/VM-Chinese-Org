import githubMarkdownDarkHref from 'github-markdown-css/github-markdown-dark.css?url'
import githubMarkdownLightHref from 'github-markdown-css/github-markdown-light.css?url'

type ThemeMode = 'light' | 'dark'

const THEME_STORAGE_KEY = 'theme'
const MARKDOWN_THEME_LINK_ID = 'github-markdown-theme'

const MARKDOWN_THEME_HREF: Record<ThemeMode, string> = {
  light: githubMarkdownLightHref,
  dark: githubMarkdownDarkHref,
}

const isThemeMode = (value: unknown): value is ThemeMode => value === 'light' || value === 'dark'

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined'

const getStoredTheme = (): ThemeMode | null => {
  if (typeof window === 'undefined') return null

  const theme = window.localStorage.getItem(THEME_STORAGE_KEY)
  return isThemeMode(theme) ? theme : null
}

const getSystemTheme = (): ThemeMode =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'

const getMarkdownThemeLink = (): HTMLLinkElement => {
  const existing = document.getElementById(MARKDOWN_THEME_LINK_ID)

  if (existing instanceof HTMLLinkElement) {
    return existing
  }

  const link = document.createElement('link')
  link.id = MARKDOWN_THEME_LINK_ID
  link.rel = 'stylesheet'

  document.head.insertBefore(link, document.head.querySelector('link[rel="stylesheet"], style'))

  return link
}

const syncMarkdownTheme = (theme: ThemeMode) => {
  if (!isBrowser()) return

  const link = getMarkdownThemeLink()
  const href = MARKDOWN_THEME_HREF[theme]

  if (link.getAttribute('href') !== href) {
    link.href = href
  }
}

export const getPreferredTheme = (): ThemeMode => getStoredTheme() ?? getSystemTheme()

export const applyTheme = (theme: ThemeMode, persist = true) => {
  if (!isBrowser()) return

  const root = document.documentElement

  root.classList.toggle('dark', theme === 'dark')
  root.dataset.theme = theme

  syncMarkdownTheme(theme)

  if (persist) {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }
}
