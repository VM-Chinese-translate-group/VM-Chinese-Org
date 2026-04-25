import { defineConfig } from 'vite'
import path from 'node:path'
import fs from 'node:fs'

import vue from '@vitejs/plugin-vue'
import Markdown from 'unplugin-vue-markdown/vite'
import Components from 'unplugin-vue-components/vite'

import Sitemap from 'vite-plugin-sitemap'
import compression from 'vite-plugin-compression2'

import { imgSize } from '@mdit/plugin-img-size'
import { container } from '@mdit/plugin-container'

import anchor from 'markdown-it-anchor'
import toc from 'markdown-it-table-of-contents'
import Shiki from '@shikijs/markdown-it'

import Card from './src/components/Card/card.js'

import { getGitBranch, getGitCommitHash, getGitEnv, getGitCommitDate } from './src/plugins/git'
import { resourcesPlugin } from './src/plugins/resourcesList'
import { searchIndexPlugin } from './src/plugins/searchIndex'

const gitEnv = getGitEnv()

const repoPath =
  gitEnv.owner && gitEnv.name
    ? `${gitEnv.owner}/${gitEnv.name}`
    : 'VM-Chinese-translate-group/VM-Chinese-Org'

// 自动获取所有 md 路由
const getMdRoutes = () => {
  const pagesDir = path.resolve(__dirname, 'src/pages')
  if (!fs.existsSync(pagesDir)) return []
  return fs.readdirSync(pagesDir, { recursive: true })
    .filter(f => f.endsWith('.md'))
    .map(f => `/${f.replace(/\.md$/, '').replace(/index$/, '')}`)
}

export default defineConfig({
  define: {
    'import.meta.env.VITE_GIT_COMMIT': JSON.stringify(getGitCommitHash()),
    'import.meta.env.VITE_GIT_BRANCH': JSON.stringify(getGitBranch()),
    'import.meta.env.VITE_GIT_REPO': JSON.stringify(repoPath),
    'import.meta.env.VITE_GIT_DATE': JSON.stringify(getGitCommitDate()),
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  plugins: [
    Markdown({
      async markdownItSetup(md) {
        // 链接优化
        md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
          const token = tokens[idx]
          const aIndex = token.attrIndex('href')

          if (aIndex >= 0 && token.attrs) {
            const href = token.attrs[aIndex]?.[1]

            if (href && /^https?:\/\//.test(href)) {
              token.attrSet('target', '_blank')
              token.attrSet('rel', 'noopener')
            }
          }

          return self.renderToken(tokens, idx, options)
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

        md.use(
          await Shiki({
            themes: {
              light: 'github-light',
              dark: 'github-dark',
            },
            defaultColor: false,
            langs: ['json', 'toml'],
          }),
        )

        md.use(Card)
        md.use(imgSize)

        const types = ['tip', 'warning', 'info', 'details']

        types.forEach((type) => {
          md.use(container, {
            name: type,

            openRender: (tokens, index) => {
              const info = tokens[index].info
              const title =
                info.length > type.length
                  ? info.slice(type.length + 1)
                  : type.toUpperCase()

              if (type === 'details') {
                return `<details class="custom-block details" open><summary>${title}</summary>\n`
              }

              return `<div class="custom-block ${type}"><p class="custom-block-title">${title}</p>\n`
            },

            closeRender: () =>
              type === 'details' ? '</details>\n' : '</div>\n',
          })
        })
      },
    }),

    vue({
      include: [/\.vue$/, /\.md$/],
    }),

    Components({
      dirs: ['src/components', 'src/layout'], 
      extensions: ['vue', 'md'],
      include: [/\.vue$/, /\.md$/],
      dts: false,
    }),

    resourcesPlugin(),

    searchIndexPlugin(),

    Sitemap({
      hostname: 'https://v4.vmct-cn.top',
      dynamicRoutes: getMdRoutes(),
    }),

    compression({
      threshold: 10240,
    }),
  ],

  build: {
    rolldownOptions: {
      devtools: {
        enabled: true,
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/vue')) return 'vue'
          if (id.includes('markdown-it')) return 'markdown'
          if (id.includes('@shikijs')) return 'shiki'
          if (id.includes('opencc')) return 'opencc'
        }
      },
    },
  },
})