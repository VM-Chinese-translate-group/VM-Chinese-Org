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
        <Icon icon="lucide:search" class="search-field-icon" />
        <input
          v-model="searchQuery"
          @input="handleSearchInput"
          class="search-input"
          :placeholder="$t('DownloadCards.searchPlaceholder')"
        />
        <button v-if="searchQuery" @click="clearSearch" class="search-clear">
          <Icon icon="lucide:x" />
        </button>
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
          v-for="mod in displayMods"
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
                  <span class="card-name">{{ mod.displayName }}</span>
                </div>

                <p class="card-desc">{{ mod.displayDesc }}</p>
              </div>

              <div class="card-footer">
                <div class="tag-group">
                  <span v-if="mod.status?.type" :class="['status-badge', mod.status.type]">
                    {{ mod.displayStatus }}
                  </span>

                  <span v-if="mod.versions?.mc" class="version-badge mc">
                    MC {{ mod.versions.mc }}
                  </span>

                  <span v-if="mod.versions?.pack" class="version-badge pack">
                    {{ $t('pack.packVersion') }} {{ mod.versions.pack }}
                  </span>
                </div>

                <div class="update-info" v-if="mod.displayDate">
                  <Icon icon="lucide:calendar-days" class="update-icon" />
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
        <Icon icon="lucide:chevron-left" />
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
        <Icon icon="lucide:chevron-right" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'
import { convertInlineText } from '@/utils/zhconv'

export interface ModCard {
  icon: string
  name: string
  author: string
  description?: string
  link?: string
  displayDate?: string
  status?: { type: string }
  versions?: { mc: string; pack: string }
}

const props = defineProps<{
  mods: ModCard[]
}>()

const { locale, t } = useI18n()
const currentLocale = computed(() => locale.value)

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(12)
const pageSizeOptions = [6, 12, 18]

const searchIndexTW = ref<Record<string, { name: string; desc: string }>>({})
const convertedDisplayData = ref<Record<string, { name: string; desc: string; status: string }>>({})

const getStatusText = (statusType?: string) => {
  if (!statusType) return ''
  return t(`pack.status.${statusType}`)
}

async function initSearchIndex() {
  for (const mod of props.mods) {
    if (searchIndexTW.value[mod.name]) continue

    const [nameTW, descTW] = await Promise.all([
      convertInlineText(mod.name, 'zh-TW'),
      convertInlineText(mod.description || '', 'zh-TW'),
    ])

    searchIndexTW.value[mod.name] = { name: nameTW, desc: descTW }
  }
}

async function refreshDisplayTranslations() {
  const targetLocale = currentLocale.value

  const tasks = paginatedMods.value.map(async (mod) => {
    const [name, desc] = await Promise.all([
      convertInlineText(mod.name, targetLocale),
      convertInlineText(mod.description || '', targetLocale),
    ])

    return { id: mod.name, name, desc, status: getStatusText(mod.status?.type) }
  })

  const results = await Promise.all(tasks)

  results.forEach((item) => {
    convertedDisplayData.value[item.id] = {
      name: item.name,
      desc: item.desc,
      status: item.status,
    }
  })
}

const filteredMods = computed(() => {
  if (!searchQuery.value.trim()) return props.mods

  const term = searchQuery.value.toLowerCase().trim()

  return props.mods.filter((mod) => {
    const tw = searchIndexTW.value[mod.name]

    const matchOriginal =
      mod.name.toLowerCase().includes(term) ||
      (mod.description || '').toLowerCase().includes(term) ||
      mod.author.toLowerCase().includes(term)

    const matchTW = tw
      ? tw.name.toLowerCase().includes(term) || tw.desc.toLowerCase().includes(term)
      : false

    return matchOriginal || matchTW
  })
})

const totalPages = computed(() => Math.ceil(filteredMods.value.length / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() =>
  Math.min(startIndex.value + itemsPerPage.value, filteredMods.value.length),
)

const paginatedMods = computed(() => filteredMods.value.slice(startIndex.value, endIndex.value))

const displayMods = computed(() =>
  paginatedMods.value.map((mod) => ({
    ...mod,
    displayName: convertedDisplayData.value[mod.name]?.name || mod.name,
    displayDesc: convertedDisplayData.value[mod.name]?.desc || mod.description,
    displayStatus: convertedDisplayData.value[mod.name]?.status || getStatusText(mod.status?.type),
  })),
)

const pageNumbers = computed(() => {
  const pages = []
  const max = 5

  let start = Math.max(1, currentPage.value - 2)
  let end = Math.min(totalPages.value, start + max - 1)

  if (end - start < max - 1) start = Math.max(1, end - max + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  return pages
})

onMounted(() => {
  initSearchIndex()
})

watch(
  () => props.mods,
  () => {
    initSearchIndex()
  },
  { deep: true },
)

watch(
  [paginatedMods, currentLocale],
  () => {
    refreshDisplayTranslations()
  },
  { immediate: true },
)

watch(searchQuery, () => {
  currentPage.value = 1
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page

    const element = document.querySelector('.DownloadCards')

    if (element) {
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY - 20,
        behavior: 'smooth',
      })
    }
  }
}

const handleCardClick = (link?: string) => {
  if (link) window.open(link, '_blank')
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
