<script setup lang="ts">
import { computed } from 'vue'
import { renderMarkdown } from '@/utils/markdown'

const ICON_PATHS: Record<string, string> = {
  modrinth: '/imgs/svg/modrinth.svg',
  curseforge: '/imgs/svg/curseforge.svg',
  github: '/imgs/svg/github.svg',
}

interface SocialLink {
  icon: string
  link: string
  ariaLabel?: string
}

const props = defineProps<{
  icon: string
  name: string
  author: string
  description?: string
  message?: string
  sources: SocialLink[]
}>()

const parsedMessage = computed(() => (props.message ? renderMarkdown(props.message) : ''))

// 判断是否为本地注册的 key，如果是则返回路径，否则返回原字符串
const getIconSrc = (icon: string) => ICON_PATHS[icon] || icon

// 简单的判断逻辑：如果是本地路径或包含 .svg 则视为本地图标
const isLocalSvg = (icon: string) => icon in ICON_PATHS || icon.endsWith('.svg')
</script>

<template>
  <div class="SCModCard">
    <div class="box">
      <figure class="icon">
        <img class="avatar" :src="icon" :alt="name" loading="lazy" />
      </figure>
      <div class="content">
        <div class="title">
          <span class="name">{{ name }}</span>
          by
          <span class="author">{{ author }}</span>
          <span class="me" v-if="message" v-html="parsedMessage"></span>
        </div>
        <div class="description">{{ description }}</div>
        <div class="links">
          <a
            v-for="source in sources"
            :key="source.link"
            :href="source.link"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="source.ariaLabel"
            class="social-link"
          >
            <span
              v-if="isLocalSvg(source.icon)"
              class="icon-svg"
              :style="{
                backgroundColor: 'currentColor',
                mask: `url(${getIconSrc(source.icon)}) no-repeat center / contain`,
                webkitMask: `url(${getIconSrc(source.icon)}) no-repeat center / contain`,
              }"
            ></span>
            <Icon v-else :icon="source.icon" class="icon-component" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 保持原有 CSS 不变 */
.SCModCard {
  display: block;
  border: 1px solid var(--vp-c-bg-soft);
  border-radius: 12px;
  height: 100%;
  background-color: var(--vp-c-bg-soft);
  transition:
    border-color 0.25s,
    background-color 0.25s;
}

.box {
  display: flex;
  padding: 8px;
  height: 100%;
}

.title {
  display: inline-flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
}

.name {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  word-break: break-all;
}

.author {
  text-decoration: underline;
  word-break: break-all;
}

.me {
  display: inline-flex;
  gap: 6px;
  word-break: break-all;
  color: var(--vp-c-text-2);
  font-style: italic;
}

.links {
  display: inline-flex;
  margin-left: -8px;
  margin-bottom: -8px;
  margin-top: auto;
}

.social-link {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  color: var(--vp-c-text-2);
  transition: color 0.25s;
}

.social-link:hover {
  color: var(--vp-c-brand-1);
}

.icon-svg,
.icon-component {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

:deep(svg) {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.content {
  margin-inline: 12px;
  display: inline-grid;
}

.icon {
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  width: 96px;
  height: 96px;
  background-color: var(--vp-c-default-soft);
  overflow: hidden;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
