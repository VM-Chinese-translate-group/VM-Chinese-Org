import fs from 'node:fs'
import path from 'node:path'
import { ConverterFactory } from 'opencc-js/core'
import { from, to } from 'opencc-js/preset'

const convertToTW = ConverterFactory(from.cn, to.twp)

const PAGES_DIR = path.resolve(process.cwd(), 'src/pages')
const VIRTUAL_MODULE_ID = 'virtual:search-index'
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID

export function searchIndexPlugin() {
  function getSearchIndex() {
    const items: any[] = []
    const walk = (dir: string) => {
      if (!fs.existsSync(dir)) return
      const files = fs.readdirSync(dir)
      for (const file of files) {
        const fullPath = path.join(dir, file)
        if (fs.statSync(fullPath).isDirectory()) {
          if (!file.startsWith('.')) walk(fullPath)
          continue
        }
        if (!file.endsWith('.md')) continue

        const content = fs.readFileSync(fullPath, 'utf-8')
        const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
        const yamlRaw = match && match[1] ? match[1] : ''
        const body = match ? content.slice(match[0].length) : content

        const titleMatch = yamlRaw.match(/^title:\s*(.*)$/m)
        const h1Match = body.match(/^#\s+(.+)$/m)

        const titleRaw = ((titleMatch ? titleMatch[1] : h1Match ? h1Match[1] : '') ?? '')
          .replace(/['"]/g, '')
          .trim()

        let route = path.relative(PAGES_DIR, fullPath).replace(/\\/g, '/').replace(/\.md$/, '')
        route = route.endsWith('/index') ? route.replace(/\/index$/, '') : route
        route = route.startsWith('/') ? route : '/' + route

        const textRaw = body
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
            url: route,
            title: titleRaw,
            titleTW: convertToTW(titleRaw),
            text: textRaw,
            textTW: convertToTW(textRaw),
          })
        }
      }
    }
    walk(PAGES_DIR)
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
      if (file.endsWith('.md') && file.includes('/src/pages/')) {
        const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID)
        if (mod) {
          server.moduleGraph.invalidateModule(mod)
        }
      }
    },
  }
}
