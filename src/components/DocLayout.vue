<template>
  <div class="doc-page-container">
    <header class="doc-header" v-if="pageTitle">
      <h1>{{ pageTitle }}</h1>
    </header>

    <main class="doc-main">
      <section class="doc-content markdown-body" ref="contentRef">
        <router-view />
      </section>

      <aside class="doc-sidebar" v-if="hasToc">
        <div class="doc-toc" ref="tocRef" />
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { convertMarkdownContainers } from '@/utils/zhconv'

const route = useRoute()
const { locale } = useI18n()

const pageTitle = computed(() => (route.meta.title as string) || '')

const contentRef = ref<HTMLElement | null>(null)
const tocRef = ref<HTMLElement | null>(null)
const hasToc = ref(false)

const updateToc = async () => {
  await nextTick()

  if (!contentRef.value || !tocRef.value) {
    hasToc.value = false
    return
  }

  const tocElement = contentRef.value.querySelector('.markdown-toc') as HTMLElement | null
  if (!tocElement) {
    hasToc.value = false
    tocRef.value.innerHTML = ''
    return
  }

  hasToc.value = true

  tocRef.value.innerHTML = ''
  tocRef.value.appendChild(tocElement)
}

const handleConvert = async () => {
  await nextTick()
  await convertMarkdownContainers(locale.value)
}

onMounted(() => {
  handleConvert()
  updateToc()
})

watch(
  () => route.fullPath,
  () => {
    handleConvert()
    updateToc()
  },
)

watch(locale, () => {
  handleConvert()
})
</script>

<style scoped>
@import '@/styles/DocLayout.css';
</style>
