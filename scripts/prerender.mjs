import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const distDir = path.resolve(root, 'dist')
const clientTemplatePath = path.join(distDir, 'index.html')
const serverEntryPath = path.join(distDir, 'server', 'entry-server.js')
const routesPath = path.join(distDir, 'prerender-routes.json')
const warn = console.warn.bind(console)

console.warn = (...args) => {
  if (args.some((arg) => String(arg).includes('[intlify] Not found parent scope'))) return
  warn(...args)
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
const routes = JSON.parse(fs.readFileSync(routesPath, 'utf-8'))

if (!Array.isArray(routes) || routes.some((route) => typeof route !== 'string')) {
  throw new TypeError(`Invalid pre-render route manifest: ${routesPath}`)
}

const { render } = await import(pathToFileURL(serverEntryPath).href)

for (const route of routes) {
  const rendered = await render(route)
  const html = renderTemplate(template, rendered)
  const filePath = filePathForRoute(route)

  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, html)
}

fs.rmSync(path.join(distDir, 'server'), { recursive: true, force: true })
fs.rmSync(routesPath, { force: true })

console.log(`Pre-rendered ${routes.length} routes.`)
