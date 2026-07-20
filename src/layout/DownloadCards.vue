<template>
  <div v-if="mods" class="DownloadCards">
    <div class="catalog-shell">
      <button
        class="filter-backdrop"
        :class="{ visible: filterDrawerOpen }"
        type="button"
        :aria-label="$t('DownloadCards.filters')"
        @click="closeFilterDrawer"
      />

      <aside
        class="filters-panel"
        :class="{ open: filterDrawerOpen }"
        :aria-label="$t('DownloadCards.filters')"
      >
        <div class="filters-drawer-header">
          <h2>{{ $t('DownloadCards.filters') }}</h2>
          <button
            type="button"
            class="filters-close"
            :aria-label="$t('DownloadCards.filters')"
            @click="closeFilterDrawer"
          >
            <Icon icon="lucide:x" />
          </button>
        </div>

        <section class="filter-group">
          <button class="filter-group-title" type="button" @click="toggleGroup('mc')">
            <span>{{ $t('DownloadCards.minecraftVersion') }}</span>
            <Icon :icon="openGroups.mc ? 'lucide:chevron-up' : 'lucide:chevron-down'" />
          </button>
          <div v-show="openGroups.mc" class="filter-options">
            <button
              v-for="option in visibleMcVersionOptions"
              :key="option.value"
              type="button"
              :class="[
                'filter-option',
                'mc-filter-option',
                { active: selectedMcVersions.includes(option.value) },
              ]"
              @click="toggleFilter(selectedMcVersions, option.value)"
            >
              <span>{{ option.label }}</span>
              <span class="filter-count">{{ option.count }}</span>
            </button>
            <button
              v-if="mcVersionOptions.length > COLLAPSED_OPTION_LIMIT"
              class="filter-more"
              type="button"
              @click="showAllMcVersions = !showAllMcVersions"
            >
              <Icon :icon="showAllMcVersions ? 'lucide:chevron-up' : 'lucide:chevron-down'" />
              <span>
                {{
                  showAllMcVersions ? $t('DownloadCards.showLess') : $t('DownloadCards.showMore')
                }}
              </span>
            </button>
          </div>
        </section>

        <section v-if="showLoaderFilter" class="filter-group">
          <button class="filter-group-title" type="button" @click="toggleGroup('loader')">
            <span>{{ $t('DownloadCards.loader') }}</span>
            <Icon :icon="openGroups.loader ? 'lucide:chevron-up' : 'lucide:chevron-down'" />
          </button>
          <div v-show="openGroups.loader" class="filter-options">
            <button
              v-for="option in loaderOptions"
              :key="option.value"
              type="button"
              :class="[
                'filter-option',
                getLoaderClass(option.value),
                { active: selectedLoaders.includes(option.value) },
              ]"
              @click="toggleFilter(selectedLoaders, option.value)"
            >
              <img
                v-if="getLoaderIcon(option.value)"
                :src="getLoaderIcon(option.value)"
                class="filter-loader-icon"
                :alt="option.label"
              />
              <Icon v-else icon="lucide:layers" />
              <span>{{ option.label }}</span>
              <span class="filter-count">{{ option.count }}</span>
            </button>
          </div>
        </section>

        <section class="filter-group">
          <button class="filter-group-title" type="button" @click="toggleGroup('status')">
            <span>{{ $t('DownloadCards.status') }}</span>
            <Icon :icon="openGroups.status ? 'lucide:chevron-up' : 'lucide:chevron-down'" />
          </button>
          <div v-show="openGroups.status" class="filter-options">
            <button
              v-for="option in statusOptions"
              :key="option.value"
              type="button"
              :class="[
                'filter-option',
                `status-${option.value}`,
                { active: selectedStatuses.includes(option.value) },
              ]"
              @click="toggleFilter(selectedStatuses, option.value)"
            >
              <Icon
                :icon="
                  option.value === 'maintaining' ? 'lucide:check-circle-2' : 'lucide:pause-circle'
                "
              />
              <span>{{ option.label }}</span>
              <span class="filter-count">{{ option.count }}</span>
            </button>
          </div>
        </section>
      </aside>

      <div class="catalog-main">
        <div class="controls-bar">
          <div class="search-field">
            <Icon icon="lucide:search" class="search-field-icon" />
            <input
              v-model="searchQuery"
              @input="handleSearchInput"
              class="search-input"
              :placeholder="$t('DownloadCards.searchPlaceholder')"
            />
            <button v-if="searchQuery" @click="clearSearch" class="search-clear" type="button">
              <Icon icon="lucide:x" />
            </button>
          </div>

          <div class="select-field">
            <span>{{ $t('DownloadCards.sortBy') }}</span>
            <SelectMenu
              v-model="sortKey"
              class="catalog-select sort-select"
              :aria-label="$t('DownloadCards.sortBy')"
              :options="sortOptions"
            />
          </div>

          <div class="select-field">
            <span>{{ $t('DownloadCards.itemsPerPage') }}</span>
            <SelectMenu
              v-model="itemsPerPage"
              class="catalog-select page-count-select"
              :aria-label="$t('DownloadCards.itemsPerPage')"
              :options="pageSizeOptions"
            />
          </div>

          <button class="mobile-filter-toggle" type="button" @click="openFilterDrawer">
            <Icon icon="lucide:list-filter" />
            <span>{{ $t('DownloadCards.filters') }}</span>
            <span v-if="activeFilterCount" class="filter-active-count">
              {{ activeFilterCount }}
            </span>
          </button>

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
          <div v-if="displayMods.length" class="grid-layout">
            <RouterLink v-for="mod in displayMods" :key="mod.name" :to="mod.link" class="card-item">
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

                      <span
                        v-if="mod.versions?.loader"
                        :class="['loader-badge', getLoaderClass(mod.versions.loader)]"
                      >
                        <img
                          v-if="getLoaderIcon(mod.versions.loader)"
                          :src="getLoaderIcon(mod.versions.loader)"
                          :alt="getLoaderText(mod.versions.loader)"
                        />
                        <Icon v-else icon="lucide:layers" />
                        {{ getLoaderText(mod.versions.loader) }}
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
                      <span>
                        {{
                          $t('pack.updateDate', {
                            date: formatUpdateDate(mod.displayDate, currentLocale),
                          })
                        }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </RouterLink>
          </div>
          <div v-else class="empty-state">
            <Icon icon="lucide:search-x" />
            <span>
              {{
                searchQuery
                  ? $t('DownloadCards.noResults', { query: searchQuery })
                  : $t('DownloadCards.noFilteredResults')
              }}
            </span>
          </div>
        </div>

        <div v-if="totalPages > 1" class="pagination-controls">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            {{ $t('DownloadCards.previousPage') }}
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
            {{ $t('DownloadCards.nextPage') }}
            <Icon icon="lucide:chevron-right" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'
import SelectMenu from '@/components/SelectMenu.vue'
import { getLoaderClass, getLoaderIcon } from '@/data/loaderIcons'
import { formatUpdateDate } from '@/utils/dateFormat'
import { getLocalizedResourceName, isEnglishLocale } from '@/utils/resourceDisplay'
import { convertInlineText } from '@/utils/zhconv'
import { usePageScrollLock } from '@/composables/usePageScrollLock'
import type { ResourceItem } from '@/types/resource'

const props = withDefaults(
  defineProps<{
    mods: ResourceItem[]
    showLoaderFilter?: boolean
  }>(),
  {
    showLoaderFilter: true,
  },
)

const { locale, t } = useI18n()
const currentLocale = computed(() => locale.value)

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(12)
const sortKey = ref('updated-desc')
const showAllMcVersions = ref(false)
const COLLAPSED_OPTION_LIMIT = 3
const pageSizeOptions = [6, 12, 18].map((value) => ({ label: String(value), value }))
const selectedMcVersions = ref<string[]>([])
const selectedLoaders = ref<string[]>([])
const selectedStatuses = ref<string[]>([])
const filterDrawerOpen = ref(false)
const openGroups = reactive({
  mc: true,
  loader: true,
  status: true,
})
const { lock: lockPageScroll, unlock: unlockPageScroll } = usePageScrollLock()

const searchIndexTW = ref<Record<string, { name: string; desc: string }>>({})
const convertedDisplayData = ref<Record<string, { name: string; desc: string; status: string }>>({})
let searchIndexRequestId = 0
let displayTranslationRequestId = 0

type FilterOption = {
  count: number
  label: string
  value: string
}

type SortOption = {
  label: string
  value: string
}

const getStatusText = (statusType?: string) => {
  if (!statusType) return ''
  return t(`pack.status.${statusType}`)
}

const getLoaderText = (loader?: string) => {
  if (!loader) return ''
  const key = loader.toLowerCase()
  const label = t(`loader.${key}`)
  return label === `loader.${key}` ? loader : label
}

const normalizeVersionToken = (value?: string) => value?.trim().toLowerCase() || ''

const getMcTokens = (mod: ResourceItem) =>
  (mod.versions?.mc || '')
    .split(/[\s,，/]+/)
    .map((item) => item.trim())
    .filter(Boolean)

const getLoaderValue = (mod: ResourceItem) => normalizeVersionToken(mod.versions?.loader)
const getStatusValue = (mod: ResourceItem) => normalizeVersionToken(mod.status?.type)

const makeOptions = (
  values: string[],
  getLabel: (value: string) => string = (value) => value,
): FilterOption[] => {
  const counts = new Map<string, number>()

  values.forEach((value) => {
    if (!value) return
    counts.set(value, (counts.get(value) || 0) + 1)
  })

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count, label: getLabel(value) }))
    .sort((a, b) => compareVersionLike(b.value, a.value) || a.label.localeCompare(b.label))
}

const mcVersionOptions = computed(() =>
  makeOptions(
    props.mods.flatMap((mod) => getMcTokens(mod)),
    (value) => value,
  ),
)

const visibleMcVersionOptions = computed(() =>
  showAllMcVersions.value
    ? mcVersionOptions.value
    : mcVersionOptions.value.slice(0, COLLAPSED_OPTION_LIMIT),
)

const loaderOptions = computed(() =>
  makeOptions(
    props.mods.map((mod) => getLoaderValue(mod)),
    (value) => getLoaderText(value),
  ),
)

const statusOptions = computed(() =>
  makeOptions(
    props.mods.map((mod) => getStatusValue(mod)),
    (value) => getStatusText(value),
  ),
)

const activeFilterCount = computed(
  () =>
    selectedMcVersions.value.length +
    (props.showLoaderFilter ? selectedLoaders.value.length : 0) +
    selectedStatuses.value.length,
)

const sortOptions = computed<SortOption[]>(() => {
  const options = [
    { value: 'updated-desc', label: t('DownloadCards.sort.updatedDesc') },
    { value: 'updated-asc', label: t('DownloadCards.sort.updatedAsc') },
  ]

  if (selectedMcVersions.value.length !== 1) {
    options.push(
      { value: 'mc-desc', label: t('DownloadCards.sort.mcDesc') },
      { value: 'mc-asc', label: t('DownloadCards.sort.mcAsc') },
    )
  }

  return options
})

function compareVersionLike(a = '', b = '') {
  const aParts = a.match(/\d+|[a-z]+/gi) || []
  const bParts = b.match(/\d+|[a-z]+/gi) || []
  const length = Math.max(aParts.length, bParts.length)

  for (let i = 0; i < length; i++) {
    const left = aParts[i] || ''
    const right = bParts[i] || ''
    const leftNumber = Number(left)
    const rightNumber = Number(right)

    if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber) && leftNumber !== rightNumber) {
      return leftNumber - rightNumber
    }

    const textCompare = left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' })
    if (textCompare) return textCompare
  }

  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

function compareMods(a: ResourceItem, b: ResourceItem) {
  const aMc = getMcTokens(a)[0] || ''
  const bMc = getMcTokens(b)[0] || ''

  switch (sortKey.value) {
    case 'updated-asc':
      return (a.date || 0) - (b.date || 0)
    case 'mc-desc':
      return compareVersionLike(bMc, aMc)
    case 'mc-asc':
      return compareVersionLike(aMc, bMc)
    case 'updated-desc':
    default:
      return (b.date || 0) - (a.date || 0)
  }
}

async function initSearchIndex() {
  const requestId = ++searchIndexRequestId
  const nextSearchIndex: Record<string, { name: string; desc: string }> = {}

  for (const mod of props.mods) {
    const [nameTW, descTW] = await Promise.all([
      convertInlineText(getSearchableName(mod), 'zh-TW'),
      convertInlineText(mod.description || '', 'zh-TW'),
    ])

    if (requestId !== searchIndexRequestId) return
    nextSearchIndex[mod.name] = { name: nameTW, desc: descTW }
  }

  searchIndexTW.value = nextSearchIndex
}

async function refreshDisplayTranslations() {
  const targetLocale = currentLocale.value
  const requestId = ++displayTranslationRequestId

  const tasks = paginatedMods.value.map(async (mod) => {
    const localizedName = getLocalizedResourceName(mod, targetLocale)
    const [name, desc] = await Promise.all([
      isEnglishLocale(targetLocale)
        ? Promise.resolve(localizedName)
        : convertInlineText(localizedName, targetLocale),
      convertInlineText(mod.description || '', targetLocale),
    ])

    return { id: mod.name, name, desc, status: getStatusText(mod.status?.type) }
  })

  const results = await Promise.all(tasks)

  if (requestId !== displayTranslationRequestId || targetLocale !== currentLocale.value) return

  results.forEach((item) => {
    convertedDisplayData.value[item.id] = {
      name: item.name,
      desc: item.desc,
      status: item.status,
    }
  })
}

const filteredMods = computed(() => {
  const term = searchQuery.value.toLowerCase().trim()

  return props.mods
    .filter((mod) => {
      if (selectedMcVersions.value.length) {
        const tokens = getMcTokens(mod).map((item) => item.toLowerCase())
        if (!selectedMcVersions.value.some((value) => tokens.includes(value.toLowerCase()))) {
          return false
        }
      }

      if (
        props.showLoaderFilter &&
        selectedLoaders.value.length &&
        !selectedLoaders.value.includes(getLoaderValue(mod))
      ) {
        return false
      }

      if (selectedStatuses.value.length && !selectedStatuses.value.includes(getStatusValue(mod))) {
        return false
      }

      if (!term) return true

      const tw = searchIndexTW.value[mod.name]

      const matchOriginal =
        mod.name.toLowerCase().includes(term) ||
        (mod.originalName || '').toLowerCase().includes(term) ||
        (mod.description || '').toLowerCase().includes(term) ||
        mod.author.toLowerCase().includes(term) ||
        (mod.versions?.mc || '').toLowerCase().includes(term) ||
        (mod.versions?.pack || '').toLowerCase().includes(term) ||
        getLoaderText(mod.versions?.loader).toLowerCase().includes(term)

      const matchTW = tw
        ? tw.name.toLowerCase().includes(term) || tw.desc.toLowerCase().includes(term)
        : false

      return matchOriginal || matchTW
    })
    .slice()
    .sort(compareMods)
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
  const pages: number[] = []
  const max = 5

  let start = Math.max(1, currentPage.value - 2)
  let end = Math.min(totalPages.value, start + max - 1)

  if (end - start < max - 1) start = Math.max(1, end - max + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  return pages
})

const toggleGroup = (group: keyof typeof openGroups) => {
  openGroups[group] = !openGroups[group]
}

const openFilterDrawer = () => {
  filterDrawerOpen.value = true
}

const closeFilterDrawer = () => {
  filterDrawerOpen.value = false
}

const toggleFilter = (target: string[], value: string) => {
  const index = target.indexOf(value)
  if (index >= 0) target.splice(index, 1)
  else target.push(value)

  if (
    target === selectedMcVersions.value &&
    target.length === 1 &&
    sortKey.value.startsWith('mc-')
  ) {
    sortKey.value = 'updated-desc'
  }

  currentPage.value = 1
}

const resetFilters = () => {
  selectedMcVersions.value = []
  selectedLoaders.value = []
  selectedStatuses.value = []
  searchQuery.value = ''
  sortKey.value = 'updated-desc'
  currentPage.value = 1
}

onMounted(() => {
  void initSearchIndex()
})

watch(
  () => props.mods,
  () => {
    void initSearchIndex()
  },
  { deep: true },
)

watch(
  [paginatedMods, currentLocale],
  () => {
    void refreshDisplayTranslations()
  },
  { immediate: true },
)

watch(
  [searchQuery, sortKey, itemsPerPage, selectedMcVersions, selectedLoaders, selectedStatuses],
  () => {
    currentPage.value = 1
  },
)

watch(
  () => props.showLoaderFilter,
  (showLoaderFilter) => {
    if (!showLoaderFilter) selectedLoaders.value = []
  },
)

watch(filteredMods, () => {
  if (currentPage.value > totalPages.value) currentPage.value = Math.max(totalPages.value, 1)
})

watch(filterDrawerOpen, (isOpen) => {
  if (isOpen) lockPageScroll()
  else unlockPageScroll()
})

onUnmounted(() => {
  searchIndexRequestId += 1
  displayTranslationRequestId += 1
  unlockPageScroll()
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

const handleSearchInput = () => {
  currentPage.value = 1
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

const getSearchableName = (mod: ResourceItem) =>
  [mod.name, mod.originalName].filter(Boolean).join(' ')
</script>

<style scoped>
@import '@/styles/DownloadCards.css';
</style>
