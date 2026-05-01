import fs from 'node:fs'
import path from 'node:path'

export interface MarkdownPage {
  body: string
  fileName: string
  fullPath: string
  relativePath: string
  route: string
  yamlRaw: string
}

const PAGES_DIR = path.resolve(process.cwd(), 'src/pages')

let cachedPages: MarkdownPage[] | null = null

function normalizePath(value: string) {
  return value.replace(/\\/g, '/')
}

function routeFromRelativePath(relativePath: string) {
  let route = normalizePath(relativePath).replace(/\.md$/, '')
  route = route.endsWith('/index') ? route.replace(/\/index$/, '') : route
  return route.startsWith('/') ? route : `/${route}`
}

function splitFrontmatter(content: string) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)

  return {
    yamlRaw: match?.[1] || '',
    body: match ? content.slice(match[0].length) : content,
  }
}

function walkMarkdownPages(dir: string, pages: MarkdownPage[]) {
  if (!fs.existsSync(dir)) return

  for (const fileName of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, fileName)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      if (!fileName.startsWith('.')) walkMarkdownPages(fullPath, pages)
      continue
    }

    if (!fileName.endsWith('.md')) continue

    const relativePath = normalizePath(path.relative(PAGES_DIR, fullPath))
    const content = fs.readFileSync(fullPath, 'utf-8')
    const { yamlRaw, body } = splitFrontmatter(content)

    pages.push({
      body,
      fileName,
      fullPath,
      relativePath,
      route: routeFromRelativePath(relativePath),
      yamlRaw,
    })
  }
}

export function getMarkdownPages() {
  if (cachedPages) return cachedPages

  const pages: MarkdownPage[] = []
  walkMarkdownPages(PAGES_DIR, pages)
  cachedPages = pages
  return pages
}

export function getMarkdownRoutes() {
  return getMarkdownPages().map((page) => page.route)
}

export function invalidateMarkdownPages() {
  cachedPages = null
}

export function isMarkdownPage(file: string) {
  const normalized = normalizePath(file)
  return normalized.endsWith('.md') && normalized.includes('/src/pages/')
}
