<template>
  <div v-if="mods" class="DownloadCards">
    <div class="controls-bar">
      <div class="items-per-page">
        <span>{{ $t('DownloadCards.itemsPerPage') }}:</span>
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
          @input="handleSearchInput"
          class="search-input"
          :placeholder="$t('DownloadCards.searchPlaceholder')"
        />
        <button v-if="searchQuery" @click="clearSearch" class="search-clear">×</button>
      </div>

      <div class="results-info">
        {{
          $t('DownloadCards.resultsInfo', {
            total: filteredMods.length,
            start: filteredMods.length > 0 ? startIndex + 1 : 0,
            end: endIndex,
          })
        }}
      </div>
    </div>

    <div class="container">
      <div class="grid-layout">
        <div
          v-for="mod in paginatedMods"
          :key="mod.name"
          class="card-item"
          :class="{ 'is-clickable': mod.link }"
          @click="handleCardClick(mod.link)"
        >
          <div class="card-box">
            <figure class="card-icon">
              <img v-lazy="mod.icon" :alt="mod.name" />
            </figure>
            <div class="card-content">
              <div class="card-top">
                <div class="card-header">
                  <span class="card-name">{{ mod.name }}</span>
                </div>
                <p class="card-desc">{{ mod.description }}</p>
              </div>

              <div class="card-footer">
                <div class="tag-group">
                  <span v-if="mod.status?.text" :class="['status-badge', mod.status.type]">
                    {{ mod.status.text }}
                  </span>
                  <span v-if="mod.versions?.mc" class="version-badge mc"
                    >MC {{ mod.versions.mc }}</span
                  >
                  <span v-if="mod.versions?.pack" class="version-badge pack"
                    >整合包 {{ mod.versions.pack }}</span
                  >
                </div>

                <div class="update-info" v-if="mod.displayDate">
                  <span>{{ $t('pack.updateDate', { date: mod.displayDate }) }}</span>
                </div>
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
      >
        <el-icon><ArrowLeft /></el-icon>
      </button>
      <button
        v-for="page in pageNumbers"
        :key="page"
        @click="goToPage(page)"
        :class="['pagination-btn', { active: page === currentPage }]"
      >
        {{ page }}
      </button>
      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
      >
        <el-icon><ArrowRight /></el-icon>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, Calendar, ArrowLeft, ArrowRight, PriceTag } from '@element-plus/icons-vue'
import { ref, computed, watch, reactive, onMounted } from 'vue'
import { renderMarkdown, renderMarkdownSync } from '@/utils/markdown'
import i18n from '@/plugins/i18n'

export interface ModCard {
  icon: string
  name: string
  author: string
  description?: string
  message?: string
  link?: string
  displayDate?: string
  status?: { text: string; type: string }
  versions?: { mc: string; pack: string }
}

const props = defineProps<{
  mods: ModCard[]
}>()

const convertedMessages = reactive<Record<string, string>>({})

async function updateConvertedMessages() {
  for (const mod of props.mods || []) {
    if (mod.message) {
      try {
        const html = await renderMarkdown(mod.message)
        convertedMessages[mod.name] = html
      } catch (e) {
        convertedMessages[mod.name] = renderMarkdownSync(mod.message || '')
      }
    }
  }
}

onMounted(() => {
  updateConvertedMessages()
})

watch(
  () => (i18n.global as any).locale.value,
  () => {
    updateConvertedMessages()
  },
)

watch(
  () => props.mods,
  () => {
    updateConvertedMessages()
  },
)

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(12)
const pageSizeOptions = [6, 12, 18]

// 模糊搜索逻辑
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

// 如果过滤后的结果页数少于当前页，重置到第一页
watch(filteredMods, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = 1
  }
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
    // 加上偏移量防止被固定导航栏遮挡
    const element = document.querySelector('.DownloadCards')
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 20
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }
}

const handleCardClick = (link?: string) => {
  if (link) {
    window.open(link, '_blank')
  }
}

const handleSearchInput = () => {
  currentPage.value = 1
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

const handlePageSizeChange = (event: Event) => {
  itemsPerPage.value = Number((event.target as HTMLSelectElement).value)
  currentPage.value = 1
}
</script>

<style scoped>
@import '@/styles/DownloadCards.css';
</style>
