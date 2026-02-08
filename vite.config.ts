import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import gitCommitPlugin from './src/plugins/git-commit'
import Markdown from 'unplugin-vue-markdown/vite'
import Components from 'unplugin-vue-components/vite'
import { container } from '@mdit/plugin-container'
import { imgSize } from "@mdit/plugin-img-size";
import Shiki from '@shikijs/markdown-it'
import anchor from 'markdown-it-anchor'
import toc from 'markdown-it-table-of-contents'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    gitCommitPlugin(),
    Markdown({
      async markdownItSetup(md) {

        const defaultLinkOpen = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
          return self.renderToken(tokens, idx, options)
        }
        md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
          const token = tokens[idx]
          const href = token.attrGet('href')
          if (href && /^https?:\/\//.test(href)) {
            token.attrSet('target', '_blank')
            token.attrSet('rel', 'noopener')
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
    includeLevel: [2, 3], // 包含 h2, h3
    containerClass: 'markdown-toc', // 目录的 CSS 类名
  })
        md.use(await Shiki({
          themes: {
            light: 'github-light',
            dark: 'github-dark',
          },
          defaultColor: false,
        }))
        md.use(imgSize)
        // Custom containers using @mdit/plugin-container
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
            closeRender: (tokens: any, index: number) => {
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
    vueDevTools(),
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
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('@vue')) {
              return 'vue-vendor'
            }
            if (id.includes('sweetalert2')) {
              return 'sweetalert2'
            }
            return 'vendor'
          }
        }
      }
    }
  },
})
