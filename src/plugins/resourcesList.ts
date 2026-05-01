import {
  getMarkdownPages,
  invalidateMarkdownPages,
  isMarkdownPage,
  type MarkdownPage,
} from './contentScanner'

const VIRTUAL_MODULE_ID = 'virtual:resources'
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID

export function resourcesPlugin() {
  function getYamlVal(yamlRaw: string, key: string) {
    const m = yamlRaw.match(new RegExp(`^${key}:\\s*(.*)`, 'm'))
    return m && m[1] ? m[1].trim().replace(/^['"]|['"]$/g, '') : ''
  }

  function toResourceItem(page: MarkdownPage) {
    const yamlRaw = page.yamlRaw
    if (!yamlRaw) return undefined

    // 1. 提取状态（仅保留 type，文本在前端按 i18n 动态生成）
    const statusBlock = yamlRaw.match(/status:\s*\n([\s\S]*?)(?=\n\S|$)/)?.[1] || ''
    const statusType = statusBlock.match(/^\s*type:\s*['"]?([^'"\n]+)['"]?/m)?.[1]?.trim() || ''

    // 2. 提取版本信息
    const mcVersion = yamlRaw.match(/minecraft:\s*['"]?([^'"\n]+)['"]?/)?.[1] || ''
    const packVersion = yamlRaw.match(/pack:\s*['"]?([^'"\n]+)['"]?/)?.[1] || ''

    // 日期处理
    const dateStr = getYamlVal(yamlRaw, 'updateDate')
    const cleanDate = dateStr
      .replace(/[年月]/g, '-')
      .replace('日', '')
      .trim()
    const date = isNaN(Date.parse(cleanDate)) ? new Date(0) : new Date(cleanDate)

    // 作者处理
    const authorMatch = yamlRaw.match(/authors:\s*\n\s*-\s*['"]?([^(\n'"]+)/)
    const author =
      authorMatch && authorMatch[1] ? authorMatch[1].trim() : getYamlVal(yamlRaw, 'author')

    // 描述处理
    const descMatch = yamlRaw.match(/description:\s*(?:\||>|-)?\s*(.*?)(?=\n\S+:|$)/s)
    const description = descMatch && descMatch[1] ? descMatch[1].replace(/\r?\n/g, ' ').trim() : ''

    return {
      name: getYamlVal(yamlRaw, 'title').replace('汉化下载', '').trim() || page.fileName,
      icon: getYamlVal(yamlRaw, 'icon'),
      author,
      description,
      link: page.route,
      date: date.getTime(),
      displayDate: dateStr,
      status: statusType ? { type: statusType } : undefined,
      versions: {
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
