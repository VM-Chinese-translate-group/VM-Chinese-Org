<template>
  <div class="pack-page-container">
    <header class="pack-header">
      <div class="header-content">
        <div class="pack-icon-wrapper">
          <img v-if="meta.icon" v-lazy="meta.icon" :alt="meta.title" class="pack-icon" />
          <div v-else class="pack-icon-placeholder"></div>
        </div>

        <div class="pack-title-area">
          <h1>{{ meta.title || t('pack.defaultTitle') }}</h1>

          <p class="pack-description" v-if="meta.description" style="white-space: pre-wrap">
            {{ meta.description }}
          </p>

          <div class="pack-status-tags" v-if="meta.status">
            <span :class="['status-tag', meta.status.type || 'info']">
              {{ meta.status.text }}
            </span>
          </div>
        </div>

        <div class="download-button-wrapper">
          <a href="#download-section" class="btn-download-main" @click.prevent="scrollToDownload">
            <i class="icon-download"></i> {{ t('pack.downloadPatch') }}
          </a>
          <span class="update-date" v-if="meta.updateDate">{{
            t('pack.updateDate', { date: meta.updateDate })
          }}</span>
        </div>
      </div>
    </header>

    <main class="pack-main">
      <section class="pack-content-body markdown-body">
        <div id="download-section"></div>
        <slot />
      </section>

      <aside class="pack-sidebar">
        <div class="sidebar-card" v-if="meta.compatibility">
          <h3>{{ t('pack.compatibilityTitle') }}</h3>

          <div class="info-group" v-if="meta.compatibility.minecraft">
            <span class="label">{{ t('pack.minecraftVersion') }}</span>
            <div class="tag-list">
              <span>
                {{ meta.compatibility.minecraft }}
              </span>
            </div>
          </div>

          <div class="info-group" v-if="meta.compatibility.loader">
            <span class="label">{{ t('pack.loader') }}</span>
            <div class="tag-list">
              <span :class="['version-tag', 'loader', getLoaderClass(meta.compatibility.loader)]">
                <img
                  v-if="getLoaderIcon(meta.compatibility.loader)"
                  v-lazy="getLoaderIcon(meta.compatibility.loader)"
                  class="loader-icon"
                  alt=""
                />
                {{ getLoaderText(meta.compatibility.loader) }}
              </span>
            </div>
          </div>

          <div class="info-group" v-if="meta.compatibility.pack">
            <span class="label">{{ t('pack.packVersion') }}</span>
            <div class="tag-list">
              <span class="version-tag">
                {{ meta.compatibility.pack }}
              </span>
            </div>
          </div>
        </div>

        <div class="sidebar-card" v-if="meta.authors && meta.authors.length">
          <h3>{{ t('pack.authorsTitle') }}</h3>
          <div class="info-group">
            <p class="author-names" v-for="author in meta.authors" :key="author">
              {{ author }}
            </p>
          </div>
        </div>

        <div class="sidebar-card" v-if="meta.links && meta.links.length">
          <h3>{{ t('pack.relatedLinks') }}</h3>
          <div class="link-list">
            <a
              v-for="(item, index) in meta.links"
              :key="index"
              :href="item.link"
              class="sidebar-link"
              target="_blank"
            >
              <img v-if="getIcon(item.id)" v-lazy="getIcon(item.id)" class="link-icon" alt="" />
              <span class="link-text">
                {{ item.text }}
              </span>
            </a>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
defineProps({
  meta: { type: Object, default: () => ({}) },
})

interface IconMap {
  [key: string]: string
}

const iconMap: IconMap = {
  bilibili: '/imgs/svg/bilibili.svg',
  curseforge: '/imgs/svg/curseforge.svg',
  github: '/imgs/svg/github.svg',
  paratranz: '/imgs/svg/paratranz.svg',
  modrinth: '/imgs/svg/modrinth.svg',
}

const getIcon = (id: string): string | undefined => iconMap[id?.toLowerCase()]

const loaderIconMap: IconMap = {
  neoforge: '/imgs/svg/neoforge.svg',
  fabric: '/imgs/svg/fabric.svg',
  forge: '/imgs/svg/forge.svg',
  vanilla: '/imgs/svg/vanilla.svg',
}

const getLoaderIcon = (loader: string): string | undefined => loaderIconMap[loader?.toLowerCase()]

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const getLoaderText = (loader: string): string => t(`loader.${loader?.toLowerCase()}`)

const getLoaderClass = (loader: string): string => `loader-${loader?.toLowerCase()}`

const scrollToDownload = (): void => {
  const el = document.getElementById('download-section')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
@import '@/styles/PackLayout.css';
</style>
