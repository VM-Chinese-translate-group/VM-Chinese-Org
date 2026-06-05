import {
  getFrontmatterBlock,
  getFrontmatterBlockValue,
  getFrontmatterFirstListValue,
  getFrontmatterText,
  getFrontmatterValue,
  getMarkdownPages,
  invalidateMarkdownPages,
  isMarkdownPage,
  type MarkdownPage,
} from './contentScanner'

const VIRTUAL_MODULE_ID = 'virtual:resources'
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID
const UPDATE_DATE_PATTERN = /^(\d{4})(?:年|-)(\d{1,2})(?:月|-)(\d{1,2})日?$/

function parseUpdateDate(date: string) {
  const match = date.trim().match(UPDATE_DATE_PATTERN)
  if (!match) return new Date(0)

  const [, year, month, day] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

export function resourcesPlugin() {
  function toResourceItem(page: MarkdownPage) {
    const yamlRaw = page.yamlRaw
    if (!yamlRaw) return undefined

    const statusBlock = getFrontmatterBlock(yamlRaw, 'status')
    const statusType = statusBlock.match(/^\s*type:\s*['"]?([^'"\n]+)['"]?/m)?.[1]?.trim() || ''

    const loader = getFrontmatterBlockValue(yamlRaw, 'compatibility', 'loader')
    const mcVersion = getFrontmatterBlockValue(yamlRaw, 'compatibility', 'minecraft')
    const packVersion = getFrontmatterBlockValue(yamlRaw, 'compatibility', 'pack')

    const dateStr = getFrontmatterValue(yamlRaw, 'updateDate')
    const date = parseUpdateDate(dateStr)

    const author =
      getFrontmatterFirstListValue(yamlRaw, 'authors') || getFrontmatterValue(yamlRaw, 'author')
    const description = getFrontmatterText(yamlRaw, 'description')

    return {
      name: getFrontmatterText(yamlRaw, 'title').replace('汉化下载', '').trim() || page.fileName,
      icon: getFrontmatterValue(yamlRaw, 'icon'),
      author,
      description,
      link: page.route,
      date: date.getTime(),
      displayDate: dateStr,
      status: statusType ? { type: statusType } : undefined,
      versions: {
        loader,
        mc: mcVersion,
        pack: packVersion,
      },
    }
  }

  function getResources(type: 'map' | 'modpack') {
    const root = type === 'map' ? 'map/' : 'modpacks/'
    const results: any[] = []

    for (const page of getMarkdownPages()) {
      if (!page.relativePath.startsWith(root)) continue
      if (page.relativePath.includes('/fc5-wiki/')) continue
      if (['secret.md', 'example.md'].includes(page.fileName)) continue

      const item = toResourceItem(page)
      if (item) results.push(item)
    }

    return results.sort((a, b) => b.date - a.date)
  }

  return {
    name: 'vite-plugin-modpacks',

    resolveId(id: string) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_VIRTUAL_MODULE_ID
    },

    load(id: string) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        const modpacks = getResources('modpack')
        const maps = getResources('map')

        return `
          export const modpacks = ${JSON.stringify(modpacks)};
          export const maps = ${JSON.stringify(maps)};
        `
      }
    },

    handleHotUpdate({ file, server }: any) {
      if (isMarkdownPage(file)) {
        invalidateMarkdownPages()
        const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID)
        if (mod) {
          server.moduleGraph.invalidateModule(mod)
          server.ws.send({ type: 'full-reload' })
        }
      }
    },
  }
}
