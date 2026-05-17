import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const distDir = path.resolve(root, 'dist')
const htmlFiles = []
const missing = []
const htmlLikeAssets = []

function normalizeReference(value) {
  if (!value) return null
  if (/^(https?:|data:|mailto:|tel:|#)/i.test(value)) return null

  const clean = value.split('#')[0].split('?')[0]
  if (!clean || clean === '/') return null

  return clean
}

function distPathForReference(reference, htmlFile) {
  if (reference.startsWith('/')) {
    return path.join(distDir, reference.slice(1))
  }

  return path.resolve(path.dirname(htmlFile), reference)
}

function hasFileExtension(reference) {
  return Boolean(path.extname(reference.replace(/\/$/, '')))
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      walk(fullPath)
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      htmlFiles.push(fullPath)
    }
  }
}

if (!fs.existsSync(distDir)) {
  throw new Error('dist directory does not exist. Run pnpm run build first.')
}

walk(distDir)

for (const htmlFile of htmlFiles) {
  const html = fs.readFileSync(htmlFile, 'utf-8')
  const attrPattern = /\b(?:src|href)=["']([^"']+)["']/g

  for (const match of html.matchAll(attrPattern)) {
    const reference = normalizeReference(match[1])
    if (!reference || !hasFileExtension(reference)) continue

    const filePath = distPathForReference(reference, htmlFile)
    if (!filePath.startsWith(distDir)) continue

    if (!fs.existsSync(filePath)) {
      missing.push(`${path.relative(distDir, htmlFile)} -> ${reference}`)
      continue
    }

    if (/\.(?:js|css)$/i.test(reference)) {
      const start = fs.readFileSync(filePath, 'utf-8').slice(0, 64).trimStart().toLowerCase()
      if (start.startsWith('<!doctype html') || start.startsWith('<html')) {
        htmlLikeAssets.push(`${path.relative(distDir, htmlFile)} -> ${reference}`)
      }
    }
  }
}

if (missing.length || htmlLikeAssets.length) {
  if (missing.length) {
    console.error('Missing dist asset references:')
    for (const item of missing) console.error(`  - ${item}`)
  }

  if (htmlLikeAssets.length) {
    console.error('JS/CSS references resolve to HTML content:')
    for (const item of htmlLikeAssets) console.error(`  - ${item}`)
  }

  process.exitCode = 1
} else {
  console.log(`Verified asset references in ${htmlFiles.length} HTML files.`)
}
