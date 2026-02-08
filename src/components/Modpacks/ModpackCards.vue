<template>
  <div v-if="mods" class="ModpackCards">
    <div class="controls-bar">
      <div class="items-per-page">
        <span>{{ $t('modpackCards.itemsPerPage') }}:</span>
        <select
          :value="itemsPerPage"
          @change="handlePageSizeChange($event)"
          class="page-size-select"
        >
          <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
        </select>
      </div>

      <div class="search-field">
        <input
          v-model="searchQuery"
          @input="currentPage = 1"
          class="search-input"
          :placeholder="$t('modpackCards.searchPlaceholder')"
        />
        <button v-if="searchQuery" @click="clearSearch" class="search-clear">×</button>
      </div>

      <div class="results-info">
        {{
          $t('modpackCards.resultsInfo', {
            total: filteredMods.length,
            start: startIndex + 1,
            end: endIndex,
          })
        }}
      </div>
    </div>

    <div class="container">
      <div v-if="filteredMods.length === 0" class="no-results">
        <p>{{ $t('modpackCards.noResults', { query: searchQuery }) }}</p>
        <button @click="clearSearch" class="clear-search-btn">
          {{ $t('modpackCards.resetSearch') }}
        </button>
      </div>

      <div class="grid-layout">
        <div v-for="mod in paginatedMods" :key="mod.name" class="card-item">
          <div class="card-box">
            <figure class="card-icon">
              <img :src="mod.icon" :alt="mod.name" loading="lazy" />
            </figure>
            <div class="card-content">
              <div class="card-header">
                <span class="card-name">{{ mod.name }}</span>
                <span class="card-author">{{
                  $t('modpackCards.byAuthor', { author: mod.author })
                }}</span>
                <span
                  v-if="mod.message"
                  class="card-msg"
                  v-html="renderMarkdown(mod.message)"
                ></span>
              </div>
              <p class="card-desc">{{ mod.description }}</p>
              <div class="card-links">
                <a
                  v-for="source in mod.sources"
                  :key="source.link"
                  :href="source.link"
                  target="_blank"
                  :aria-label="source.ariaLabel || getSourceName(source.icon)"
                  class="social-link"
                >
                  <span
                    v-if="isLocalSvg(source.icon)"
                    class="icon-svg"
                    :style="{
                      mask: `url(${getIconSrc(source.icon)}) center/contain no-repeat`,
                      WebkitMask: `url(${getIconSrc(source.icon)}) center/contain no-repeat`,
                    }"
                  >
                  </span>
                  <Icon v-else :icon="source.icon" class="icon-component" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination-controls">
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="pagination-btn"
        :aria-label="$t('modpackCards.previousPage')"
      >
        ←
      </button>

      <!-- 第一页按钮 -->
      <template v-if="pageNumbers.length > 0 && pageNumbers[0] > 1">
        <button @click="goToPage(1)" class="pagination-btn">1</button>
        <span v-if="pageNumbers[0] > 2" class="pagination-ellipsis">...</span>
      </template>

      <!-- 中间页码 -->
      <button
        v-for="page in pageNumbers"
        :key="page"
        @click="goToPage(page)"
        :class="['pagination-btn', { active: page === currentPage }]"
        :aria-label="$t('modpackCards.goToPage', { page })"
        :aria-current="page === currentPage ? 'page' : null"
      >
        {{ page }}
      </button>

      <!-- 最后页按钮 -->
      <template v-if="pageNumbers.length > 0 && pageNumbers[pageNumbers.length - 1] < totalPages">
        <span
          v-if="pageNumbers[pageNumbers.length - 1] < totalPages - 1"
          class="pagination-ellipsis"
          >...</span
        >
        <button @click="goToPage(totalPages)" class="pagination-btn">
          {{ totalPages }}
        </button>
      </template>

      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
        :aria-label="$t('modpackCards.nextPage')"
      >
        →
      </button>

      <div class="page-navigation">
        <input
          type="number"
          v-model="pageInputValue"
          @keydown.enter="handlePageInput"
          :placeholder="$t('modpackCards.goToPagePlaceholder')"
          class="page-input"
          :aria-label="$t('modpackCards.goToPageInput')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { renderMarkdown } from '@/utils/markdown'

interface SocialLink {
  icon: string
  link: string
  ariaLabel?: string
}

export interface ModCard {
  icon: string
  name: string
  author: string
  description?: string
  message?: string
  sources: SocialLink[]
}

const props = defineProps<{
  mods: ModCard[]
}>()

const ICON_PATHS: Record<string, string> = {
  modrinth: '/imgs/svg/modrinth.svg',
  curseforge: '/imgs/svg/curseforge.svg',
  github: '/imgs/svg/github.svg',
}

const ICON_NAMES: Record<string, string> = {
  modrinth: 'Modrinth',
  curseforge: 'CurseForge',
  github: 'GitHub',
}

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(12)
const pageInputValue = ref('')
const pageSizeOptions = [6, 12, 18, 24]

const getIconSrc = (icon: string) => ICON_PATHS[icon] || icon
const getSourceName = (icon: string) => ICON_NAMES[icon] || icon

const isLocalSvg = (icon: any) => {
  if (typeof icon === 'object' && icon.svg) return true
  if (typeof icon === 'string') return icon in ICON_PATHS || icon.endsWith('.svg')
  return false
}

const fuzzySearch = (query: string, mod: ModCard) => {
  if (!query.trim()) return { match: true, score: 0 }
  const term = query.toLowerCase().trim()
  const name = mod.name.toLowerCase()
  const author = mod.author.toLowerCase()
  const desc = (mod.description || '').toLowerCase()

  let score = 0
  let match = false

  if (name.includes(term)) {
    match = true
    score += name === term ? 1000 : name.startsWith(term) ? 800 : 600
  }
  if (author.includes(term)) {
    match = true
    score += author === term ? 400 : author.startsWith(term) ? 300 : 200
  }
  if (desc.includes(term)) {
    match = true
    score += desc.startsWith(term) ? 150 : 100
  }

  if (match) {
    const totalLen = name.length + author.length + desc.length
    score += Math.max(0, 1000 - totalLen * 2)
  }
  return { match, score }
}

const filteredMods = computed(() => {
  if (!searchQuery.value.trim()) return props.mods
  return props.mods
    .map((mod) => ({ mod, ...fuzzySearch(searchQuery.value, mod) }))
    .filter((res) => res.match)
    .sort((a, b) => b.score - a.score)
    .map((res) => res.mod)
})

const totalPages = computed(() => Math.ceil(filteredMods.value.length / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() =>
  Math.min(startIndex.value + itemsPerPage.value, filteredMods.value.length),
)
const paginatedMods = computed(() => filteredMods.value.slice(startIndex.value, endIndex.value))

const pageNumbers = computed(() => {
  if (totalPages.value <= 0) return []
  const pages = []
  const max = 5
  let start = Math.max(1, currentPage.value - 2)
  let end = Math.min(totalPages.value, start + max - 1)
  if (end - start < max - 1) start = Math.max(1, end - max + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    document.querySelector('.ModpackCards')?.scrollIntoView({ behavior: 'smooth' })
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

const handlePageInput = (e: any) => {
  const val = parseInt(e.target.value)
  if (val >= 1 && val <= totalPages.value) {
    goToPage(val)
    pageInputValue.value = ''
  }
}

const handlePageSizeChange = (event: Event) => {
  itemsPerPage.value = Number((event.target as HTMLSelectElement).value)
  currentPage.value = 1
}
</script>

<style scoped>
@import '@/styles/ModpackCards.css';
</style>
