import { ConverterFactory } from 'opencc-js/core'
import { from, to } from 'opencc-js/preset'
import { getMarkdownPages, invalidateMarkdownPages, isMarkdownPage } from './contentScanner'

const convertToTW = ConverterFactory(from.cn, to.twp)

const VIRTUAL_MODULE_ID = 'virtual:search-index'
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID

export function searchIndexPlugin() {
  function getSearchIndex() {
    const items: any[] = []

    for (const page of getMarkdownPages()) {
      const titleMatch = page.yamlRaw.match(/^title:\s*(.*)$/m)
      const h1Match = page.body.match(/^#\s+(.+)$/m)

      const titleRaw = ((titleMatch ? titleMatch[1] : h1Match ? h1Match[1] : '') ?? '')
        .replace(/['"]/g, '')
        .trim()

      const textRaw = page.body
        .replace(/```[\s\S]*?```/g, '') // 去代码块（防止误伤代码里的链接）
        .replace(/:::[\s\S]*?:::/g, '') // 去 Container
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 将 [文字](链接) 替换为 "文字"
        .replace(/<[^>]+>/g, '') // 去 HTML
        .replace(/[#*`>_\-]/g, '') // 去掉剩余的 MD 符号
        .replace(/\s+/g, ' ') // 合并多余空格
        .trim()
        .slice(0, 500)

      if (titleRaw || textRaw) {
        items.push({
          url: page.route,
          title: titleRaw,
          titleTW: convertToTW(titleRaw),
          text: textRaw,
          textTW: convertToTW(textRaw),
        })
      }
    }

    return items
  }

  return {
    name: 'vite-plugin-search-index',
    resolveId(id: string) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_VIRTUAL_MODULE_ID
    },
    load(id: string) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        return `export const searchIndex = ${JSON.stringify(getSearchIndex())};`
      }
    },
    handleHotUpdate({ file, server }: any) {
      if (isMarkdownPage(file)) {
        invalidateMarkdownPages()
        const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID)
        if (mod) {
          server.moduleGraph.invalidateModule(mod)
        }
      }
    },
  }
}
