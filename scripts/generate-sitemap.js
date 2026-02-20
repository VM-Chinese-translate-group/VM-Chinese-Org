import fs from 'fs/promises'
import path from 'path'

const SITE_URL = 'https://v4.vmct-cn.top'
const pagesDir = path.resolve('src/pages')
const mode = process.argv[2] || 'dev'
const outDir = path.resolve(mode === 'build' ? 'dist' : 'public')

function normalizeSite(url) {
  return url.replace(/\/$/, '')
}

const site = normalizeSite(SITE_URL)

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const res = path.join(dir, e.name)
    if (e.isDirectory()) {
      files.push(...await walk(res))
    } else if (e.isFile() && res.endsWith('.md')) {
      files.push(res)
    }
  }
  return files
}

function fileToRoutePath(file) {
  let p = file
    .replace(pagesDir, '')
    .replace(/\.md$/, '')
    .replace(/\\/g, '/')

  if (p.endsWith('/index')) {
    p = p.replace(/\/index$/, '')
  }

  if (!p) return '/'
  return p.startsWith('/') ? p : `/${p}`
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return { data: {}, body: content }

  const raw = match[1]
  const body = content.slice(match[0].length)

  const data = {}
  raw.split('\n').forEach(line => {
    const m = line.match(/^(\w+):\s*(.+)$/)
    if (m) {
      data[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  })

  return { data, body }
}

function stripMarkdown(md) {
  return md
    // 删除 script/style 块
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')

    // 删除代码块
    .replace(/```[\s\S]*?```/g, '')

    // 删除行内代码
    .replace(/`.+?`/g, '')

    // 删除图片
    .replace(/!\[.*?\]\(.*?\)/g, '')

    // 替换 Markdown 链接为文本
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

    // 删除所有 HTML / Vue 标签
    .replace(/<[^>]+>/g, '')

    // 删除常见 Markdown 标记符
    .replace(/[>#*_`~-]/g, '')

    // 合并空行
    .replace(/\n{2,}/g, '\n')

    .trim()
}

function extractTitle(frontmatterData, body) {
  if (frontmatterData.title) return frontmatterData.title

  const h1 = body.match(/^#\s+(.+)$/m)
  if (h1) return h1[1].trim()

  return ''
}

async function main() {
  const exists = await fs.stat(pagesDir).then(() => true).catch(() => false)

  if (!exists) {
    console.warn('未找到 src/pages，跳过生成')
    return
  }

  const files = await walk(pagesDir)
  const items = []

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8')
    const { data, body } = parseFrontmatter(content)

    // 跳过 search:false 页面
    if (data.search === 'false') continue

    const route = fileToRoutePath(file)
    const url = `${site}${route}`

    const stat = await fs.stat(file)
    const lastmod = stat.mtime.toISOString()

    const title = extractTitle(data, body)
    const text = stripMarkdown(body).slice(0, 300)

    if (!title && !text) continue

    items.push({
      url,
      title,
      text,
      lastmod
    })
  }

  // 生成 sitemap.xml
  const sitemap =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    items.map(i =>
      `  <url>\n    <loc>${i.url}</loc>\n    <lastmod>${i.lastmod}</lastmod>\n  </url>`
    ).join('\n') +
    `\n</urlset>\n`

  await fs.mkdir(outDir, { recursive: true })
  await fs.writeFile(path.join(outDir, 'sitemap.xml'), sitemap, 'utf-8')
  await fs.writeFile(
    path.join(outDir, 'search-index.json'),
    JSON.stringify(items, null, 2),
    'utf-8'
  )

  console.log(`✔ 生成完成：${items.length} 个页面`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})