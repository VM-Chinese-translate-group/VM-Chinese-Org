export interface ContentLink {
  id: string
  text: string
  link: string
  icon: string
}

export interface ContentMetadata {
  title: string
  originalName: string
  description: string
  icon: string
  updateDate: string
  featured: boolean
  search: boolean
  sidebar: boolean
  statusType: string
  loader: string
  minecraft: string
  pack: string
  authors: string[]
  links: ContentLink[]
}

export const emptyMetadata = (): ContentMetadata => ({
  title: '',
  originalName: '',
  description: '',
  icon: '',
  updateDate: '',
  featured: false,
  search: true,
  sidebar: false,
  statusType: '',
  loader: '',
  minecraft: '',
  pack: '',
  authors: [],
  links: [],
})

function value(source: string, key: string) {
  return (
    source
      .match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]
      ?.trim()
      .replace(/^['"]|['"]$/g, '') || ''
  )
}
function bool(source: string, key: string, fallback: boolean) {
  const raw = value(source, key)
  return raw ? raw === 'true' : fallback
}
function nested(source: string, parent: string, key: string) {
  return (
    source
      .match(new RegExp(`^${parent}:\\s*\\n(?:  .*\\n)*?  ${key}:\\s*(.+)$`, 'm'))?.[1]
      ?.trim()
      .replace(/^['"]|['"]$/g, '') || ''
  )
}
function listBlock(source: string, key: string) {
  return source.match(new RegExp(`^${key}:\\s*\\n((?:  - .*\\n?)+)`, 'm'))?.[1] || ''
}

export function parseMetadata(source: string): ContentMetadata {
  const meta = emptyMetadata()
  meta.title = value(source, 'title')
  meta.originalName = value(source, 'originalName')
  meta.icon = value(source, 'icon')
  meta.updateDate = value(source, 'updateDate')
  meta.featured = bool(source, 'featured', false)
  meta.search = bool(source, 'search', true)
  meta.sidebar = bool(source, 'sidebar', false)
  meta.statusType = nested(source, 'status', 'type')
  meta.loader = nested(source, 'compatibility', 'loader')
  meta.minecraft = nested(source, 'compatibility', 'minecraft')
  meta.pack = nested(source, 'compatibility', 'pack')
  const description = source.match(/^description:\s*\|\s*\n((?:  .*\n?)*)/m)?.[1]
  meta.description = description
    ? description.replace(/^  /gm, '').trim()
    : value(source, 'description')
  meta.authors = [...listBlock(source, 'authors').matchAll(/^  -\s*['"]?(.*?)['"]?\s*$/gm)]
    .map((item) => item[1])
    .filter(Boolean)
  const links = listBlock(source, 'links')
    .split(/^  -\s*/m)
    .filter(Boolean)
  meta.links = links
    .map((item) => ({
      id: value(item, 'id'),
      text: value(item, 'text'),
      link: value(item, 'link'),
      icon: value(item, 'icon'),
    }))
    .filter((item) => item.id || item.link)
  return meta
}

function quote(value: string) {
  return JSON.stringify(value)
}
export function stringifyMetadata(meta: ContentMetadata) {
  const lines: string[] = []
  const scalar = (key: string, value: string) => {
    if (value.trim()) lines.push(`${key}: ${quote(value.trim())}`)
  }
  scalar('title', meta.title)
  scalar('originalName', meta.originalName)
  scalar('icon', meta.icon)
  if (meta.description.trim())
    lines.push(
      'description: |',
      ...meta.description
        .trim()
        .split('\n')
        .map((line) => `  ${line}`),
    )
  scalar('updateDate', meta.updateDate)
  lines.push(`featured: ${meta.featured}`, `search: ${meta.search}`, `sidebar: ${meta.sidebar}`)
  if (meta.statusType) lines.push('status:', `  type: ${quote(meta.statusType)}`)
  if (meta.loader || meta.minecraft || meta.pack) {
    lines.push('compatibility:')
    scalarNested(lines, 'loader', meta.loader)
    scalarNested(lines, 'minecraft', meta.minecraft)
    scalarNested(lines, 'pack', meta.pack)
  }
  if (meta.authors.filter(Boolean).length)
    lines.push('authors:', ...meta.authors.filter(Boolean).map((author) => `  - ${quote(author)}`))
  if (meta.links.length)
    for (const [index, link] of meta.links.entries()) {
      lines.push(index === 0 ? 'links:' : '', `  - id: ${quote(link.id)}`)
      if (link.text) lines.push(`    text: ${quote(link.text)}`)
      if (link.link) lines.push(`    link: ${quote(link.link)}`)
      if (link.icon) lines.push(`    icon: ${quote(link.icon)}`)
    }
  return lines.filter((line, index) => line || lines[index - 1] !== '').join('\n')
}
function scalarNested(lines: string[], key: string, value: string) {
  if (value.trim()) lines.push(`  ${key}: ${quote(value.trim())}`)
}
