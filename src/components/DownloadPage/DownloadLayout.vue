<template>
  <div class="pack-page-container">
    <header class="pack-header">
      <div class="header-content">
        <div class="pack-icon-wrapper">
          <img v-if="meta.icon" v-lazy="meta.icon" :alt="meta.title" class="pack-icon" />
          <div v-else class="pack-icon-placeholder"></div>
        </div>

        <div class="pack-title-area">
          <div class="title-row">
            <h1>{{ meta.title || t('pack.defaultTitle') }}</h1>
            <div class="pack-status-tags" v-if="meta.status">
              <span :class="['status-tag', meta.status.type || 'info']">
                {{ meta.status.text }}
              </span>
            </div>
          </div>

          <p class="pack-description" v-if="meta.description">
            {{ meta.description }}
          </p>

          <div class="author-row" v-if="meta.authors">
            <span class="by-text">by</span>
            <span class="author-name" v-for="author in meta.authors" :key="author">
              {{ author }}
            </span>
          </div>
        </div>

        <div class="download-button-wrapper">
          <a href="#download-section" class="btn-download-main" @click.prevent="scrollToDownload">
            <Icon icon="lucide:download" />
            {{ t('pack.downloadPatch') }}
          </a>
          <span class="update-date" v-if="meta.updateDate">
            <Icon icon="lucide:calendar-clock" />
            {{ t('pack.updateDate', { date: meta.updateDate }) }}
          </span>
        </div>
      </div>
    </header>

    <main class="pack-main">
      <section class="pack-content-body markdown-body" ref="contentRef">
        <div id="download-section"></div>
        <slot />
      </section>

      <aside class="pack-sidebar">
        <div class="sidebar-card">
          <h3 class="sidebar-title">{{ t('pack.compatibilityTitle') }}</h3>

          <div class="info-item" v-if="meta.compatibility?.minecraft">
            <div class="info-label">
              <Icon icon="mdi:microsoft-minecraft" />
              {{ t('pack.minecraftVersion') }}
            </div>
            <div class="info-value">{{ meta.compatibility.minecraft }}</div>
          </div>

          <div class="info-item" v-if="meta.compatibility?.loader">
            <div class="info-label">
              <Icon icon="lucide:layers" />
              {{ t('pack.loader') }}
            </div>
            <div class="info-value">
              <span :class="['loader-pill', getLoaderClass(meta.compatibility.loader)]">
                <span
                  v-if="getLoaderIcon(meta.compatibility.loader)"
                  class="loader-icon"
                  :style="{
                    WebkitMaskImage: `url(${getLoaderIcon(meta.compatibility.loader)})`,
                    maskImage: `url(${getLoaderIcon(meta.compatibility.loader)})`,
                  }"
                />
                {{ getLoaderText(meta.compatibility.loader) }}
              </span>
            </div>
          </div>

          <div class="info-item" v-if="meta.compatibility?.pack">
            <div class="info-label">
              <Icon icon="lucide:tag" />
              {{ t('pack.packVersion') }}
            </div>
            <div class="info-value">{{ meta.compatibility.pack }}</div>
          </div>
        </div>

        <div class="sidebar-card" v-if="meta.links && meta.links.length">
          <h3 class="sidebar-title">{{ t('pack.relatedLinks') }}</h3>
          <div class="external-links">
            <a
              v-for="(item, index) in meta.links"
              :key="index"
              :href="item.link"
              class="link-pill"
              target="_blank"
            >
              <img v-if="getIcon(item.id)" v-lazy="getIcon(item.id)" class="link-icon" />
              <span>{{ item.text }}</span>
              <Icon icon="lucide:external-link" class="external-icon" />
            </a>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { convertMarkdownContainers } from '@/utils/zhconv'

const props = defineProps({
  meta: { type: Object, default: () => ({}) },
})

const { t, locale } = useI18n()
const contentRef = ref<HTMLElement | null>(null)

const handleConvert = async () => {
  await nextTick()
  if (!contentRef.value) return
  await convertMarkdownContainers(locale.value, contentRef.value)
}

onMounted(() => handleConvert())
watch(
  () => props.meta,
  () => handleConvert(),
  { deep: true },
)
watch(locale, () => handleConvert())

// 图标映射
const iconMap: Record<string, string> = {
  bilibili: '/imgs/svg/bilibili.svg',
  curseforge: '/imgs/svg/curseforge.svg',
  github: '/imgs/svg/github.svg',
  paratranz: '/imgs/svg/paratranz.svg',
  modrinth: '/imgs/svg/modrinth.svg',
}

const loaderIconMap: Record<string, string> = {
  neoforge: '/imgs/svg/neoforge.svg',
  fabric: '/imgs/svg/fabric.svg',
  forge: '/imgs/svg/forge.svg',
  vanilla: '/imgs/svg/vanilla.svg',
}

const getIcon = (id: string) => iconMap[id?.toLowerCase()]
const getLoaderIcon = (loader: string) => loaderIconMap[loader?.toLowerCase()]
const getLoaderText = (loader: string) => t(`loader.${loader?.toLowerCase()}`)
const getLoaderClass = (loader: string) => `loader-${loader?.toLowerCase()}`

const scrollToDownload = () => {
  const el = document.getElementById('download-section')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
@import '@/styles/DownloadLayout.css';
</style>
