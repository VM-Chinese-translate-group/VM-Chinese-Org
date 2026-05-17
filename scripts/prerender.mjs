import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const distDir = path.resolve(root, 'dist')
const clientTemplatePath = path.join(distDir, 'index.html')
const serverEntryPath = path.join(distDir, 'server', 'entry-server.js')
const pagesDir = path.join(root, 'src', 'pages')
const warn = console.warn.bind(console)

console.warn = (...args) => {
  if (args.some((arg) => String(arg).includes('[intlify] Not found parent scope'))) return
  warn(...args)
}

function normalizePath(value) {
  return value.replace(/\\/g, '/')
}

function routeFromPage(file) {
  let route = normalizePath(path.relative(pagesDir, file)).replace(/\.md$/, '')
  if (route.endsWith('/index')) route = route.replace(/\/index$/, '')
  return route ? `/${route}` : '/'
}

function collectMarkdownRoutes(dir, routes = []) {
  if (!fs.existsSync(dir)) return routes

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue

    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      collectMarkdownRoutes(fullPath, routes)
      continue
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      const route = routeFromPage(fullPath)
      if (!['/', '/modpacks', '/map'].includes(route)) routes.push(route)
    }
  }

  return routes
}

function filePathForRoute(route) {
  if (route === '/') return path.join(distDir, 'index.html')
  return path.join(distDir, route.replace(/^\//, ''), 'index.html')
}

function renderTemplate(template, { appHtml, head, htmlAttrs }) {
  return template
    .replace('<html lang="zh-CN">', `<html ${htmlAttrs}>`)
    .replace('<!--seo-head-->', head)
    .replace('<!--app-html-->', appHtml)
}

const template = fs.readFileSync(clientTemplatePath, 'utf-8')
const { render } = await import(pathToFileURL(serverEntryPath).href)

const routes = [...new Set(['/', '/modpacks', '/map', '/credits', ...collectMarkdownRoutes(pagesDir)])]

for (const route of routes) {
  const rendered = await render(route)
  const html = renderTemplate(template, rendered)
  const filePath = filePathForRoute(route)

  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, html)
}

const notFoundRendered = await render('/404')
const notFoundHtml = renderTemplate(template, notFoundRendered)
fs.writeFileSync(path.join(distDir, '404.html'), notFoundHtml)

fs.rmSync(path.join(distDir, 'server'), { recursive: true, force: true })

console.log(`Pre-rendered ${routes.length} routes and 404.html.`)
