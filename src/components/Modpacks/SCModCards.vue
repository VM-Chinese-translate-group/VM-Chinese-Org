<script setup lang="ts">
import { ref, computed } from 'vue'
import SCModCard from './SCModCard.vue'

interface SocialLink {
  icon: string | { svg: string }
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

// Search state
const searchQuery = ref('')

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(12)
const pageInputValue = ref('')

// Available page size options
const pageSizeOptions = [6, 12, 18, 24, 36]

// Fuzzy search function with priority scoring
const fuzzySearch = (query: string, mod: ModCard) => {
  if (!query.trim()) return { match: true, score: 0 }

  const searchTerm = query.toLowerCase().trim()
  const name = mod.name.toLowerCase()
  const author = mod.author.toLowerCase()
  const description = (mod.description || '').toLowerCase()

  let score = 0
  let match = false

  // Exact matches get highest priority
  if (name.includes(searchTerm)) {
    match = true
    if (name === searchTerm)
      score += 1000 // Exact name match
    else if (name.startsWith(searchTerm))
      score += 800 // Name starts with query
    else score += 600 // Name contains query
  }

  if (author.includes(searchTerm)) {
    match = true
    if (author === searchTerm)
      score += 400 // Exact author match
    else if (author.startsWith(searchTerm))
      score += 300 // Author starts with query
    else score += 200 // Author contains query
  }

  if (description.includes(searchTerm)) {
    match = true
    if (description.startsWith(searchTerm))
      score += 150 // Description starts with query
    else score += 100 // Description contains query
  }

  // Bonus for multiple word matches
  const words = searchTerm.split(/\s+/)
  if (words.length > 1) {
    const allText = `${name} ${author} ${description}`
    const matchedWords = words.filter((word) => allText.includes(word))
    score += matchedWords.length * 50
  }

  // Bonus for shorter matches (more relevant)
  if (match) {
    const totalLength = name.length + author.length + description.length
    score += Math.max(0, 1000 - totalLength * 2)
  }

  return { match, score }
}

// Filter and sort mods based on search query
const filteredMods = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.mods
  }

  const results = props.mods
    .map((mod) => ({
      mod,
      ...fuzzySearch(searchQuery.value, mod),
    }))
    .filter((result) => result.match)
    .sort((a, b) => b.score - a.score)
    .map((result) => result.mod)

  return results
})

// Update computed values to use filtered mods
const totalPages = computed(() => Math.ceil(filteredMods.value.length / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() =>
  Math.min(startIndex.value + itemsPerPage.value, filteredMods.value.length),
)
const paginatedMods = computed(() => filteredMods.value.slice(startIndex.value, endIndex.value))

// Reset pagination when search changes
const handleSearchInput = () => {
  currentPage.value = 1
  pageInputValue.value = ''
}

// Clear search
const clearSearch = () => {
  searchQuery.value = ''
  handleSearchInput()
}

// Pagination methods
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // Scroll to top of cards section
    document.querySelector('.SCModCards')?.scrollIntoView({ behavior: 'smooth' })
  }
}

const changeItemsPerPage = (newSize: number) => {
  itemsPerPage.value = newSize
  // Reset to first page when changing page size
  currentPage.value = 1
  pageInputValue.value = ''
}

// Handle direct page navigation
const handlePageInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.trim()

  if (value === '') {
    pageInputValue.value = ''
    return
  }

  const pageNum = parseInt(value, 10)

  if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages.value) {
    goToPage(pageNum)
    pageInputValue.value = ''
  } else {
    // Reset invalid input after a brief moment
    setTimeout(() => {
      pageInputValue.value = ''
      target.value = ''
    }, 1000)
  }
}

const handlePageInputKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handlePageInput(event)
  }
}

// Generate page numbers for pagination controls
const pageNumbers = computed(() => {
  const pages = []
  const maxVisiblePages = 5
  const half = Math.floor(maxVisiblePages / 2)

  let start = Math.max(1, currentPage.value - half)
  let end = Math.min(totalPages.value, start + maxVisiblePages - 1)

  if (end - start < maxVisiblePages - 1) {
    start = Math.max(1, end - maxVisiblePages + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})
</script>

<template>
  <div v-if="mods" class="SCModCards">
    <!-- Combined controls bar -->
    <div class="controls-bar">
      <div class="items-per-page">
        <label for="page-size-select">Items per page:</label>
        <select
          id="page-size-select"
          :value="itemsPerPage"
          @change="changeItemsPerPage(Number(($event.target as HTMLSelectElement).value))"
          class="page-size-select"
        >
          <option v-for="size in pageSizeOptions" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </div>

      <!-- Search field - centered on wide screens -->
      <div class="search-field">
        <input
          v-model="searchQuery"
          @input="handleSearchInput"
          type="text"
          placeholder="Search mods..."
          class="search-input"
          aria-label="Search mods"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="search-clear"
          aria-label="Clear search"
          type="button"
        >
          ×
        </button>
      </div>

      <div class="results-info">
        Showing {{ startIndex + 1 }}-{{ endIndex }} of {{ filteredMods.length }} mods
      </div>
    </div>

    <!-- Cards container -->
    <div class="container">
      <div v-if="filteredMods.length === 0" class="no-results">
        <p>No mods found matching "{{ searchQuery }}"</p>
        <button @click="clearSearch" class="clear-search-btn">Clear search</button>
      </div>
      <div
        v-for="{ icon, name, author, description, message, sources } in paginatedMods"
        class="item"
        :key="name"
      >
        <SCModCard :icon :name :author :description :message :sources />
      </div>
    </div>

    <!-- Pagination controls -->
    <div v-if="totalPages > 1" class="pagination-controls">
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="pagination-btn"
        aria-label="Previous page"
      >
        ←
      </button>

      <button v-if="pageNumbers[0] > 1" @click="goToPage(1)" class="pagination-btn">1</button>

      <span v-if="pageNumbers[0] > 2" class="pagination-ellipsis">...</span>

      <button
        v-for="page in pageNumbers"
        :key="page"
        @click="goToPage(page)"
        :class="['pagination-btn', { active: page === currentPage }]"
      >
        {{ page }}
      </button>

      <span v-if="pageNumbers[pageNumbers.length - 1] < totalPages - 1" class="pagination-ellipsis"
        >...</span
      >

      <button
        v-if="pageNumbers[pageNumbers.length - 1] < totalPages"
        @click="goToPage(totalPages)"
        class="pagination-btn"
      >
        {{ totalPages }}
      </button>

      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
        aria-label="Next page"
      >
        →
      </button>

      <!-- Direct page navigation -->
      <div class="page-navigation">
        <label for="page-input" class="page-nav-label">Go to page:</label>
        <input
          id="page-input"
          type="number"
          :min="1"
          :max="totalPages"
          :placeholder="`1-${totalPages}`"
          v-model="pageInputValue"
          @blur="handlePageInput"
          @keydown="handlePageInputKeydown"
          class="page-input"
          :title="`Enter a page number between 1 and ${totalPages}`"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.SCModCards {
  position: relative;
}

/* Combined controls bar */
.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 8px;
  gap: 16px;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  flex-shrink: 0;
}

.page-size-select {
  padding: 4px 8px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
}

.page-size-select:focus {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

/* Search field - centered */
.search-field {
  position: relative;
  flex: 1;
  max-width: 400px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
  padding: 8px 32px 8px 12px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-1-alpha-20);
}

.search-input::placeholder {
  color: var(--vp-c-text-3);
}

.search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 16px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.search-clear:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-gray-light-1);
}

.results-info {
  font-size: 14px;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}

/* No results styling */
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: var(--vp-c-text-2);
}

.no-results p {
  font-size: 18px;
  margin-bottom: 16px;
}

.clear-search-btn {
  padding: 8px 16px;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.clear-search-btn:hover {
  background: var(--vp-c-brand-1);
  color: var(--vp-c-white);
}

.container {
  margin: 0 auto;
  max-width: 1152px;
}

.item {
  padding: 8px;
  width: 100%;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  padding: 16px 0;
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 8px 12px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  min-width: 40px;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--vp-c-gray-light-2);
  border-color: var(--vp-c-brand-1);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn.active {
  background: var(--vp-c-brand-1);
  color: var(--vp-c-white);
  border-color: var(--vp-c-brand-1);
}

.pagination-ellipsis {
  padding: 8px 4px;
  color: var(--vp-c-text-2);
}

/* Direct page navigation styling */
.page-navigation {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 16px;
  padding-left: 16px;
  border-left: 1px solid var(--vp-c-border);
}

.page-nav-label {
  font-size: 14px;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

.page-input {
  width: 80px;
  padding: 6px 8px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
  text-align: center;
}

.page-input:focus {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
  border-color: var(--vp-c-brand-1);
}

.page-input:invalid {
  border-color: var(--vp-c-danger-1);
}

/* Remove spinner arrows from number input */
.page-input::-webkit-outer-spin-button,
.page-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.page-input[type='number'] {
  -moz-appearance: textfield;
}

/* Responsive adjustments */
@media (max-width: 900px) {
  .controls-bar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .search-field {
    max-width: none;
    order: -1; /* Move search to top on mobile */
  }

  .search-input {
    font-size: 16px; /* Prevents zoom on iOS */
  }

  .items-per-page,
  .results-info {
    text-align: center;
  }
}

@media (max-width: 768px) {
  .pagination-controls {
    gap: 4px;
    justify-content: center;
  }

  .pagination-btn {
    padding: 6px 8px;
    min-width: 32px;
    font-size: 13px;
  }

  .page-navigation {
    margin-left: 8px;
    padding-left: 8px;
    flex-direction: column;
    gap: 4px;
    border-left: none;
    border-top: 1px solid var(--vp-c-border);
    padding-top: 8px;
    margin-top: 8px;
    width: 100%;
    align-items: center;
  }

  .page-input {
    width: 120px;
  }
}
</style>
