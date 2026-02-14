<template>
  <div class="pack-page-container">
    <header class="pack-header">
      <div class="header-content">
        <div class="pack-icon-wrapper">
          <img v-if="meta.icon" :src="meta.icon" :alt="meta.title" class="pack-icon" />
          <div v-else class="pack-icon-placeholder"></div>
        </div>

        <div class="pack-title-area">
          <h1>{{ meta.title || '未命名整合包' }}</h1>
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
            <i class="icon-download"></i> 下载汉化补丁
          </a>
          <span class="update-date" v-if="meta.updateDate"> 更新日期：{{ meta.updateDate }} </span>
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
          <h3>版本兼容性</h3>
          <div class="info-group" v-if="meta.compatibility.minecraft">
            <span class="label">Minecraft 版本</span>
            <div class="tag-list">
              <span class="version-tag">{{ meta.compatibility.minecraft }}</span>
            </div>
          </div>
          <div class="info-group" v-if="meta.compatibility.loader">
            <span class="label">加载器</span>
            <div class="tag-list">
              <span class="version-tag loader">{{ meta.compatibility.loader }}</span>
            </div>
          </div>
          <div class="info-group" v-if="meta.compatibility.pack">
            <span class="label">整合包版本</span>
            <div class="tag-list">
              <span class="version-tag">{{ meta.compatibility.pack }}</span>
            </div>
          </div>
        </div>

        <div class="sidebar-card" v-if="meta.authors && meta.authors.length">
          <h3>作者</h3>
          <div class="info-group">
            <p class="author-names" v-for="author in meta.authors" :key="author">{{ author }}</p>
          </div>
        </div>

        <div class="sidebar-card" v-if="meta.links && meta.links.length">
          <h3>相关链接</h3>
          <div class="link-list">
            <a
              v-for="(item, index) in meta.links"
              :key="index"
              :href="item.link"
              class="sidebar-link"
              target="_blank"
            >
              <span
                v-if="getIcon(item.id)"
                class="link-icon"
                :style="{
                  maskImage: `url(${getIcon(item.id)})`,
                  webkitMaskImage: `url(${getIcon(item.id)})`,
                }"
              ></span>
              <span class="link-text">{{ item.text }}</span>
            </a>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
defineProps({
  meta: { type: Object, default: () => ({}) },
})

const iconMap = {
  bilibili: '/imgs/svg/bilibili.svg',
  curseforge: '/imgs/svg/curseforge.svg',
  github: '/imgs/svg/github.svg',
  paratranz: '/imgs/logo/paratranz.png',
  modrinth: '/imgs/svg/modrinth.svg',
}

const getIcon = (id) => iconMap[id?.toLowerCase()] || null

const scrollToDownload = () => {
  const el = document.getElementById('download-section')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
@import '@/styles/PackLayout.css';
</style>
