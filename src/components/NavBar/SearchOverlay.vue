<template>
  <teleport to="body">
    <transition name="search-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-2000 flex justify-center overscroll-contain bg-[var(--search-overlay)] pt-[12vh] backdrop-blur-1"
        @click.self="close"
      >
        <div
          class="flex max-h-[70vh] w-160 max-w-[95%] flex-col overflow-hidden border border-[var(--search-border)] rounded-3 bg-[var(--bg-white)] shadow-[var(--card-shadow)]"
        >
          <div class="flex items-center border-b border-b-[var(--search-border)] px-5">
            <div>
              <Icon icon="lucide:search" class="text-5 text-[var(--text-muted)]" />
            </div>
            <input
              v-model="keyword"
              @input="onInput"
              class="flex-1 border-none bg-transparent px-3 py-5 text-[1.1rem] text-[var(--search-input-text)] outline-none"
              :placeholder="$t('search.placeholder')"
              ref="inputRef"
              autofocus
            />
            <div
              class="cursor-pointer border border-[var(--search-border)] rounded-1 bg-[var(--bg-soft)] px-1.5 py-0.5 text-[11px] text-[var(--text-muted)] font-600"
              @click="close"
            >
              {{ $t('search.esc') }}
            </div>
          </div>

          <div ref="resultsAreaRef" class="results-area overflow-y-auto overscroll-contain p-2">
            <div v-if="results.length" class="results-list">
              <div
                v-for="(item, index) in results"
                :key="item.url"
                :data-result-index="index"
                :class="[
                  'group mb-0.5 flex cursor-pointer items-center rounded-2 px-4 py-[0.85rem] transition-colors duration-150 hover:bg-[var(--search-row-hover)]',
                  index === activeIndex ? 'is-active' : '',
                ]"
                role="option"
                :aria-selected="index === activeIndex"
                @mouseenter="activeIndex = index"
                @click="goTo(item.url)"
              >
                <div class="min-w-0 flex-1">
                  <h4
                    class="mb-1 mt-0 text-[0.95rem] text-[var(--link-title)] font-600"
                    v-html="highlight(item.title)"
                  ></h4>
                  <p
                    class="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-[0.85rem] text-[var(--text-light)]"
                    v-html="highlight(item.snippet)"
                  ></p>
                </div>
                <div
                  :class="[
                    'result-arrow -translate-x-1.25 text-[1.2rem] text-[var(--brand-primary)] opacity-50 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100',
                  ]"
                >
                  <Icon icon="lucide:chevron-right" />
                </div>
              </div>
            </div>

            <div
              v-else-if="keyword"
              class="search-empty m-0 px-4 py-16 text-center text-[var(--text-muted)]"
            >
              <Icon icon="lucide:search-x" class="mx-auto mb-4 block text-12 opacity-20" />
              <p v-html="$t('search.empty', { query: `<span>${keyword}</span>` })"></p>
            </div>

            <div v-else class="m-0 px-4 py-16 text-center text-[var(--text-muted)]">
              <p>{{ $t('search.startSearch') }}</p>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'
import { searchIndex } from 'virtual:search-index'
import { convertInlineText } from '@/utils/zhconv'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits(['close'])
const router = useRouter()
const { locale } = useI18n()

const keyword = ref('')
const results = ref<any[]>([])
const inputRef = ref<HTMLInputElement | null>(null)
const resultsAreaRef = ref<HTMLElement | null>(null)
const activeIndex = ref(-1)
let timer: any = null
let previousBodyOverflow = ''
let previousDocumentOverflow = ''

const lockBodyScroll = () => {
  if (typeof document === 'undefined') return

  previousBodyOverflow = document.body.style.overflow
  previousDocumentOverflow = document.documentElement.style.overflow
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
}

const unlockBodyScroll = () => {
  if (typeof document === 'undefined') return

  document.body.style.overflow = previousBodyOverflow
  document.documentElement.style.overflow = previousDocumentOverflow
}

const currentLocale = computed(() => locale.value)

const performSearch = async () => {
  const term = keyword.value.trim().toLowerCase()
  if (!term) {
    results.value = []
    activeIndex.value = -1
    return
  }

  const rawResults = searchIndex.filter((i: any) => {
    return (
      (i.title || '').toLowerCase().includes(term) ||
      (i.text || '').toLowerCase().includes(term) ||
      (i.titleTW || '').toLowerCase().includes(term) ||
      (i.textTW || '').toLowerCase().includes(term)
    )
  })

  const translatedResults = await Promise.all(
    rawResults.slice(0, 15).map(async (i: any) => {
      const displayTitle = await convertInlineText(i.title, currentLocale.value)
      const displayText = await convertInlineText(i.text, currentLocale.value)

      const pos = displayText.toLowerCase().indexOf(term)
      const start = Math.max(0, pos - 40)
      const end = pos + 60
      let snippet = displayText.slice(start, end)
      if (start > 0) snippet = '...' + snippet
      if (end < displayText.length) snippet = snippet + '...'

      return {
        url: i.url,
        title: displayTitle || 'Untitled',
        snippet,
      }
    }),
  )

  results.value = translatedResults
  activeIndex.value = translatedResults.length ? 0 : -1
}

const onInput = () => {
  clearTimeout(timer)
  timer = setTimeout(performSearch, 150)
}

const highlight = (text: string) => {
  if (!keyword.value) return text
  const reg = new RegExp(`(${keyword.value})`, 'gi')
  return text.replace(reg, '<mark>$1</mark>')
}

const goTo = (url: string) => {
  emit('close')
  router.push(url)
}

const close = () => emit('close')

const scrollActiveIntoView = () => {
  nextTick(() => {
    const area = resultsAreaRef.value
    if (!area || activeIndex.value < 0) return

    const active = area.querySelector<HTMLElement>(`[data-result-index="${activeIndex.value}"]`)
    active?.scrollIntoView({ block: 'nearest' })
  })
}

const onKeyDown = (e: KeyboardEvent) => {
  if (!props.visible) return

  if (e.key === 'Escape') {
    e.preventDefault()
    close()
    return
  }

  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    e.stopPropagation()

    if (!results.value.length) return

    const direction = e.key === 'ArrowDown' ? 1 : -1
    activeIndex.value =
      (activeIndex.value + direction + results.value.length) % results.value.length
    scrollActiveIntoView()
    return
  }

  if (e.key === 'Enter' && activeIndex.value >= 0) {
    e.preventDefault()
    const activeResult = results.value[activeIndex.value]
    if (activeResult) goTo(activeResult.url)
  }
}

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      lockBodyScroll()
      nextTick(() => inputRef.value?.focus())
    } else {
      unlockBodyScroll()
      keyword.value = ''
      results.value = []
      activeIndex.value = -1
    }
  },
  { immediate: true },
)

watch(currentLocale, () => {
  if (keyword.value) performSearch()
})

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  unlockBodyScroll()
  window.removeEventListener('keydown', onKeyDown)
  clearTimeout(timer)
})
</script>

<style scoped>
.search-fade-enter-active,
.search-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.search-fade-enter-from,
.search-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.search-empty :deep(span) {
  color: var(--brand-primary);
  font-weight: 600;
}

:deep(mark) {
  background: var(--search-highlight);
  color: inherit;
  border-radius: 2px;
  padding: 0 1px;
}

.results-area::-webkit-scrollbar {
  width: 6px;
}

.results-area::-webkit-scrollbar-thumb {
  background: var(--switcher-border);
  border-radius: 10px;
}

.results-list [role='option'].is-active {
  background: var(--search-row-hover);
}

.results-list [role='option'].is-active .result-arrow {
  color: var(--brand-primary);
  opacity: 1;
  transform: translateX(0);
}
</style>
