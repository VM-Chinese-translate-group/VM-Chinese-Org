import fs from 'fs/promises'
import path from 'path'

/**
 * 运行方式：
 * dev  : node generate-search.js dev
 * build: node generate-search.js build
 */

const pagesDir = path.resolve('src/pages')
const mode = process.argv[2] || 'dev'
const outDir = path.resolve(mode === 'build' ? 'dist' : 'public')

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    // 忽略隐藏文件夹
    if (entry.name.startsWith('.')) continue

    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...await walk(fullPath))
    } else if (entry.isFile() && fullPath.endsWith('.md')) {
      files.push(fullPath)
    }
  }

  return files
}

function fileToRoutePath(file) {
  let relative = path.relative(pagesDir, file)

  relative = relative
    .replace(/\\/g, '/')
    .replace(/\.md$/, '')

  if (relative.endsWith('/index')) {
    relative = relative.replace(/\/index$/, '')
  }

  if (!relative) return '/'

  return relative.startsWith('/') ? relative : `/${relative}`
}

/**
 * 解析 frontmatter
 * 支持多行 | 写法
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) {
    return { data: {}, body: content }
  }

  const raw = match[1]
  const body = content.slice(match[0].length)

  const data = {}
  const lines = raw.split('\n')

  let currentKey = null
  let collectingBlock = false
  let buffer = []

  for (let line of lines) {
    const keyMatch = line.match(/^(\w+):\s*(.*)$/)

    if (keyMatch) {
      if (collectingBlock && currentKey) {
        data[currentKey] = buffer.join('\n').trim()
        buffer = []
        collectingBlock = false
      }

      const key = keyMatch[1]
      let value = keyMatch[2]

      if (value === '|') {
        currentKey = key
        collectingBlock = true
        buffer = []
      } else {
        data[key] = value.replace(/^["']|["']$/g, '')
      }
    } else if (collectingBlock) {
      buffer.push(line)
    }
  }

  if (collectingBlock && currentKey) {
    data[currentKey] = buffer.join('\n').trim()
  }

  return { data, body }
}

function stripMarkdown(md) {
  return md
    // script/style
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')

    // ::: container
    .replace(/:::[\s\S]*?:::/g, '')

    // code blocks
    .replace(/```[\s\S]*?```/g, '')

    // inline code
    .replace(/`.+?`/g, '')

    // images
    .replace(/!\[.*?\]\(.*?\)/g, '')

    // links -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

    // toc
    .replace(/\[\[toc\]\]/gi, '')

    // html/vue
    .replace(/<[^>]+>/g, '')

    // markdown symbols
    .replace(/[>#*_~\-]/g, '')

    // collapse empty lines
    .replace(/\n{2,}/g, '\n')

    .trim()
}

function extractTitle(frontmatter, body) {
  if (frontmatter.title) return frontmatter.title

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

    // 跳过 search: false
    if (data.search === false || data.search === 'false') {
      continue
    }

    const route = fileToRoutePath(file)
    const title = extractTitle(data, body)
    const text = stripMarkdown(body)

    if (!title && !text) continue

    items.push({
      url: route,
      title,
      text: text.slice(0, 500)
    })
  }

  await fs.mkdir(outDir, { recursive: true })

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