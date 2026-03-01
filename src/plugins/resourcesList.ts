import fs from 'node:fs'
import path from 'node:path'

const MODPACKS_DIR = path.resolve(process.cwd(), 'src/pages/modpacks')
const MAPS_DIR = path.resolve(process.cwd(), 'src/pages/map')

const VIRTUAL_MODULE_ID = 'virtual:resources'
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID

export function resourcesPlugin() {
  function scanDirectory(baseDir: string, rootDir: string) {
    const results: any[] = []
    
    const scan = (dir: string) => {
      if (!fs.existsSync(dir)) return
      const files = fs.readdirSync(dir)

      for (const file of files) {
        const fullPath = path.join(dir, file)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
          if (file !== 'fc5-wiki') scan(fullPath)
          continue
        }

        if (!file.endsWith('.md') || ['secret.md', 'example.md'].includes(file)) continue

        const content = fs.readFileSync(fullPath, 'utf-8')
        const parts = content.split(/^---\s*$/m)
        if (parts.length < 3) continue

        const yamlRaw = parts[1] || ''
        const body = parts[2] || ''

        const getYamlVal = (key: string) => {
          const m = yamlRaw.match(new RegExp(`^${key}:\\s*(.*)`, 'm'))
          return m && m[1] ? m[1].trim().replace(/^['"]|['"]$/g, '') : ''
        }

        // 日期处理
        const dateStr = getYamlVal('updateDate')
        const cleanDate = dateStr.replace(/[年月]/g, '-').replace('日', '').trim()
        const date = isNaN(Date.parse(cleanDate)) ? new Date(0) : new Date(cleanDate)

        // 作者处理
        const authorMatch = yamlRaw.match(/authors:\s*\n\s*-\s*['"]?([^(\n'"]+)/)
        const author = authorMatch && authorMatch[1] ? authorMatch[1].trim() : getYamlVal('author')

        // 描述处理
        const descMatch = yamlRaw.match(/description:\s*(?:\||>|-)?\s*(.*?)(?=\n\S+:|$)/s)
        const description = descMatch && descMatch[1] ? descMatch[1].replace(/\r?\n/g, ' ').trim() : ''

        // 来源链接
        const sources = []
        const cfMatch = body.match(/\[CurseForge\]\((https:\/\/www\.curseforge\.com\/[^\)]+)\)/)
        const ghMatch = yamlRaw.match(/id: github\s+text:.*?\s+link: (https:\/\/github\.com\/[^\s\n]+)/s)
        if (cfMatch) sources.push({ icon: 'curseforge', link: cfMatch[1] })
        if (ghMatch) sources.push({ icon: 'github', link: ghMatch[1] })

        const relPath = path.relative(rootDir, fullPath)
        const routePrefix = rootDir.endsWith('map') ? '/map/' : '/modpacks/'
        
        const link = routePrefix + relPath
            .replace(/\.md$/, '')
            .replace(/\\/g, '/')
            .replace(/\/index$/, '')

        results.push({
          name: getYamlVal('title').replace('汉化下载', '').trim() || file,
          icon: getYamlVal('icon'),
          author,
          description,
          link,
          sources,
          date: date.getTime(),
        })
      }
    }

    scan(baseDir)
    return results.sort((a, b) => b.date - a.date)
  }

  return {
    name: 'vite-plugin-modpacks',

    resolveId(id: string) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_VIRTUAL_MODULE_ID
    },

    load(id: string) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        const modpacks = scanDirectory(MODPACKS_DIR, MODPACKS_DIR)
        const maps = scanDirectory(MAPS_DIR, MAPS_DIR)

        return `
          export const modpacks = ${JSON.stringify(modpacks)};
          export const maps = ${JSON.stringify(maps)};
        `
      }
    },

    handleHotUpdate({ file, server }: any) {
      if ((file.includes('/pages/modpacks/') || file.includes('/pages/map/')) && file.endsWith('.md')) {
        const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID)
        if (mod) {
          server.moduleGraph.invalidateModule(mod)
          server.ws.send({ type: 'full-reload' })
        }
      }
    },
  }
}