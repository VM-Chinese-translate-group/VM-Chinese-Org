import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import gitCommitPlugin from './src/plugins/git-commit'
import Markdown from 'unplugin-vue-markdown/vite'
import { container } from '@mdit/plugin-container'
import { imgSize } from "@mdit/plugin-img-size";
import Shiki from '@shikijs/markdown-it'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    gitCommitPlugin(),
    Markdown({
      async markdownItSetup(md) {
        md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
          const token = tokens[idx]
          const title = tokens[idx + 1].content
          const slug = encodeURIComponent(String(title).trim().toLowerCase().replace(/\s+/g, '-'))
          token.attrSet('id', slug)
          
          return self.renderToken(tokens, idx, options)
        }

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

        md.use(await Shiki({
          themes: {
            light: 'github-light',
            dark: 'github-dark',
          }
        }))
        md.use(imgSize)
        // Custom containers using @mdit/plugin-container
        const containers = ['tip', 'warning', 'info', 'danger', 'details']
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
})
