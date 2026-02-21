import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

import Markdown from 'unplugin-vue-markdown/vite'
import Components from 'unplugin-vue-components/vite'

import { imgSize } from '@mdit/plugin-img-size'
import { container } from '@mdit/plugin-container'
import anchor from 'markdown-it-anchor'
import toc from 'markdown-it-table-of-contents'
import Shiki from '@shikijs/markdown-it'

import Sitemap from 'vite-plugin-sitemap'
import vueDevTools from 'vite-plugin-vue-devtools'
import compression from 'vite-plugin-compression2'

import { getGitBranch, getGitCommitHash, getGitEnv } from './src/plugins/git'

const branch = getGitBranch()
const commit = getGitCommitHash()
const gitEnv = getGitEnv()

const repoPath = (gitEnv.owner && gitEnv.name) 
  ? `${gitEnv.owner}/${gitEnv.name}` 
  : 'VM-Chinese-translate-group/VM-Chinese-Org'


// 自动获取所有 md 路由
const getMdRoutes = () => {
  const pagesDir = path.resolve(__dirname, 'src/pages')
  const files = fs.readdirSync(pagesDir, { recursive: true }) as string[]
  return files
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const route = f.replace(/\.md$/, '').replace(/index$/, '')
      return route.startsWith('/') ? route : `/${route}`
    })
}

export default defineConfig({
  define: {
    'import.meta.env.VITE_GIT_COMMIT': JSON.stringify(commit),
    'import.meta.env.VITE_GIT_BRANCH': JSON.stringify(branch),
    'import.meta.env.VITE_GIT_REPO': JSON.stringify(repoPath),
  },
  plugins: [
    Markdown({
      async markdownItSetup(md) {
        const defaultLinkOpen = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
          return self.renderToken(tokens, idx, options)
        }

        md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
          const token = tokens[idx]
          if (token) {
            const href = token.attrGet('href')
            if (href && /^https?:\/\//.test(href)) {
              token.attrSet('target', '_blank')
              token.attrSet('rel', 'noopener')
            }
          }
          return defaultLinkOpen(tokens, idx, options, env, self)
        }

        md.use(anchor, {
          permalink: anchor.permalink.ariaHidden({
            placement: 'before',
            symbol: '#',
            class: 'header-anchor',
          }),
        })

        md.use(toc, {
          includeLevel: [2, 3],
          containerClass: 'markdown-toc',
        })

        md.use(await Shiki({
          themes: {
            light: 'github-light',
            dark: 'github-dark',
          },
          defaultColor: false,
          langs: ['json', 'toml'],
        }))

        md.use(imgSize)

        const containers = ['tip', 'warning', 'info', 'details']
        containers.forEach(type => {
          md.use(container, {
            name: type,
            openRender: (tokens: any, index: number) => {
              const info = tokens[index].info.trim().slice(type.length).trim()
              const title = info || type.toUpperCase()
              if (type === 'details') {
                return `<details class="custom-block ${type}"><summary>${title}</summary>\n`
              }
              return `<div class="custom-block ${type}"><p class="custom-block-title">${title}</p>\n`
            },
            closeRender: () => {
              if (type === 'details') {
                return `</details>\n`
              }
              return `</div>\n`
            }
          })
        })
      }
    }),
    Components({
      dirs: ['src/components'],
      extensions: ['vue', 'md'],
      include: [/\.vue$/, /\.md$/],
      dts: false,
    }),
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    Sitemap({
      hostname: 'https://v4.vmct-cn.top',
      dynamicRoutes: getMdRoutes(),
    }),
    vueDevTools(),
    compression({
      algorithms: ['gzip', 'brotliCompress'],
      threshold: 10240,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('vue')) return 'vue'
          if (id.includes('shiki')) return 'shiki'
          if (id.includes('sweetalert2')) return 'sweetalert2'
          if (id.includes('markdown-it')) return 'markdown'
          return 'vendor'
        }
      }
    }
  },
})
