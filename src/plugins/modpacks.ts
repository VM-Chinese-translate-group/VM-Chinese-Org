import fs from 'node:fs'
import path from 'node:path'

const INPUT_DIR = path.resolve(process.cwd(), 'src/pages/modpacks')
const VIRTUAL_MODULE_ID = 'virtual:modpacks'
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID

export function modpacksPlugin() {
  function getModpacksData() {
    const results: any[] = []
    
    const scanDir = (dir: string) => {
      if (!fs.existsSync(dir)) return
      const files = fs.readdirSync(dir)
      
      for (const file of files) {
        const fullPath = path.join(dir, file)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          if (file !== 'fc5-wiki') scanDir(fullPath)
          continue
        }
        
        if (!file.endsWith('.md') || ['secret.md', 'example.md'].includes(file)) continue

        const content = fs.readFileSync(fullPath, 'utf-8')
        const parts = content.split(/^---\s*$/m)
        
        // 1. 确保 parts 长度足够，并提取变量
        if (parts.length < 3) continue
        const yamlRaw = parts[1] || ''
        const body = parts[2] || ''

        // 2. 修改 getYamlVal 以处理可能的 undefined
        const getYamlVal = (key: string) => {
          const m = yamlRaw.match(new RegExp(`^${key}:\\s*(.*)`, 'm'))
          // 使用可选链 ?. 或逻辑判断确保 m[1] 存在
          return (m && m[1]) ? m[1].trim().replace(/^['"]|['"]$/g, '') : ''
        }

        const dateStr = getYamlVal('updateDate')
        const cleanDate = dateStr.replace(/[年月]/g, '-').replace('日', '').trim()
        const date = isNaN(Date.parse(cleanDate)) ? new Date(0) : new Date(cleanDate)

        // 3. 这里的 match 结果也需要安全访问
        const authorMatch = yamlRaw.match(/authors:\s*\n\s*-\s*['"]?([^(\n'"]+)/)
        const author = (authorMatch && authorMatch[1]) ? authorMatch[1].trim() : getYamlVal('author')

        const descMatch = yamlRaw.match(/description:\s*(?:\||>|-)?\s*(.*?)(?=\n\S+:|$)/s)
        const description = (descMatch && descMatch[1]) ? descMatch[1].replace(/\r?\n/g, ' ').trim() : ''

        const sources = []
        // 4. 对 body 和 yamlRaw 的 match 结果进行安全检查
        const cfMatch = body.match(/\[CurseForge\]\((https:\/\/www\.curseforge\.com\/[^\)]+)\)/)
        const ghMatch = yamlRaw.match(/id: github\s+text:.*?\s+link: (https:\/\/github\.com\/[^\s\n]+)/s)
        
        if (cfMatch && cfMatch[1]) sources.push({ icon: 'curseforge', link: cfMatch[1] })
        if (ghMatch && ghMatch[1]) sources.push({ icon: 'github', link: ghMatch[1] })

        const relPath = path.relative(INPUT_DIR, fullPath)
        const link = '/modpacks/' + relPath.replace(/\.md$/, '').replace(/\\/g, '/').replace(/\/index$/, '')

        results.push({
          name: getYamlVal('title').replace('汉化下载', '').trim() || file,
          icon: getYamlVal('icon'),
          author,
          description,
          link,
          sources,
          date: date.getTime()
        })
      }
    }

    scanDir(INPUT_DIR)
    return results.sort((a, b) => b.date - a.date)
  }

  return {
    name: 'vite-plugin-modpacks',
    
    resolveId(id: string) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_VIRTUAL_MODULE_ID
    },

    load(id: string) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        const data = getModpacksData()
        return `export const modpacks = ${JSON.stringify(data)};`
      }
    },

    handleHotUpdate({ file, server }: any) {
      if (file.includes('/pages/modpacks/') && file.endsWith('.md')) {
        const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID)
        if (mod) {
          server.moduleGraph.invalidateModule(mod)
          server.ws.send({ type: 'full-reload' })
        }
      }
    }
  }
}