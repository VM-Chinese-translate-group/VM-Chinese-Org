<template>
  <teleport to="body">
    <transition name="search-fade">
      <div v-if="visible" class="search-overlay" @click.self="close">
        <div class="search-panel">
          <div class="search-header">
            <div class="search-icon-wrapper">
              <svg class="search-icon" viewBox="0 0 24 24">
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m21 21l-4.343-4.343m0 0A8 8 0 1 0 5.343 5.343a8 8 0 0 0 11.314 11.314Z"
                />
              </svg>
            </div>
            <input
              v-model="keyword"
              @input="handleSearch"
              class="search-input"
              :placeholder="$t('search.placeholder')"
              ref="inputRef"
              autofocus
            />
            <div class="search-kbd" @click="close">{{ $t('search.esc') }}</div>
          </div>

          <div class="results-area">
            <div v-if="results.length" class="results-list">
              <div
                v-for="item in results"
                :key="item.url"
                class="result-row"
                @click="goTo(item.url)"
              >
                <div class="result-content">
                  <h4 class="result-title" v-html="highlight(item.title)"></h4>
                  <p class="result-snippet" v-html="highlight(item.snippet)"></p>
                </div>
                <div class="result-arrow">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9 18l6-6l-6-6"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div v-else-if="keyword" class="search-empty">
              <p v-html="$t('search.empty', { query: `<span>${keyword}</span>` })"></p>
            </div>

            <div v-else class="search-placeholder">
              {{ $t('search.startSearch') }}
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { searchIndex } from 'virtual:search-index'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits(['close'])
const router = useRouter()

const keyword = ref('')
const results = ref<any[]>([])
const inputRef = ref<HTMLInputElement | null>(null)

// 自动聚焦输入框
watch(() => props.visible, (newVal) => {
  if (newVal) {
    nextTick(() => inputRef.value?.focus())
  } else {
    keyword.value = ''
    results.value = []
  }
})

const handleSearch = () => {
  const term = keyword.value.trim().toLowerCase()
  if (!term) {
    results.value = []
    return
  }

  results.value = searchIndex
    .filter((i: any) => 
      (i.title || '').toLowerCase().includes(term) || 
      (i.text || '').toLowerCase().includes(term)
    )
    .map((i: any) => {
      const text = i.text || ''
      const pos = text.toLowerCase().indexOf(term)
      
      // 生成预览片段
      const start = Math.max(0, pos - 40)
      const end = pos + 60
      let snippet = text.slice(start, end)
      if (start > 0) snippet = '...' + snippet
      if (end < text.length) snippet = snippet + '...'
      
      return { 
        url: i.url, 
        title: i.title || 'Untitled', 
        snippet 
      }
    })
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

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<style scoped>
@import '@/styles/SearchOverlay.css';
</style>
