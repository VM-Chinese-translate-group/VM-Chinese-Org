<template>
  <div class="doc-page-container">
    <header class="doc-header" v-if="pageTitle">
      <h1 ref="titleRef">{{ convertedPageTitle }}</h1>
    </header>

    <main class="doc-main">
      <section class="doc-content markdown-body" ref="contentRef">
        <router-view />
      </section>

      <aside class="doc-sidebar" v-if="showSidebar">
        <div class="doc-toc">
          <div class="toc-title">{{ t('toc.title') }}</div>
          <ul class="toc-list">
            <li
              v-for="heading in headers"
              :key="heading.id"
              :class="['toc-item', `toc-level-${heading.level}`]"
            >
              <a
                :href="`#${heading.id}`"
                :class="{ active: activeId === heading.id }"
                @click.prevent="scrollToHeading(heading.id)"
              >
                {{ heading.text }}
              </a>
            </li>
          </ul>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { convertMarkdownContainers, convertInlineText } from '@/utils/zhconv'

const route = useRoute()
const { t, locale } = useI18n()

const contentRef = ref<HTMLElement | null>(null)

const pageTitle = computed(() => (route.meta.title as string) || '')
const convertedPageTitle = ref('')

interface Heading {
  id: string
  text: string
  level: number
  top: number
}

const headers = ref<Heading[]>([])
const activeId = ref<string>('')

const showSidebar = computed(() => {
  if (route.meta.sidebar === false) return false
  return headers.value.length > 0
})

const handleConversion = async () => {
  await nextTick()
  await convertMarkdownContainers(locale.value)

  convertedPageTitle.value = await convertInlineText(pageTitle.value, locale.value)

  await extractHeaders()
}

const extractHeaders = async () => {
  if (!contentRef.value) return

  const headingElements = Array.from(contentRef.value.querySelectorAll('h2, h3'))

  headers.value = await Promise.all(
    headingElements.map(async (el) => {
      let rawText = el.textContent || ''
      let cleanText = rawText
        .replace(/^#+\s*/, '')
        .replace(/#\s*$/, '')
        .replace(/\{#.*?\}/g, '')
        .trim()

      const translatedText = await convertInlineText(cleanText, locale.value)

      if (!el.id) {
        const customIdMatch = rawText.match(/\{#([^}]+)\}/)
        el.id = customIdMatch
          ? customIdMatch[1].trim()
          : cleanText.replace(/\s+/g, '-').toLowerCase()
      }

      return {
        id: el.id,
        text: translatedText,
        level: Number(el.tagName.charAt(1)),
        top: (el as HTMLElement).offsetTop,
      }
    }),
  )
}

const onScroll = () => {
  if (headers.value.length === 0 || !showSidebar.value) return
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const offset = 100
  let currentId = headers.value[0]?.id
  for (let i = 0; i < headers.value.length; i++) {
    if (scrollTop >= headers.value[i].top - offset) {
      currentId = headers.value[i].id
    } else {
      break
    }
  }
  activeId.value = currentId
}

const scrollToHeading = (id: string) => {
  const target = document.getElementById(id)
  if (target) {
    const offset = 80
    const top = target.getBoundingClientRect().top + window.pageYOffset - offset
    window.scrollTo({ top, behavior: 'smooth' })
    history.pushState(null, '', `#${id}`)
  }
}

watch(
  () => route.path,
  () => {
    handleConversion()
  },
  { immediate: true },
)

watch(locale, () => {
  handleConversion()
})

onMounted(() => {
  window.addEventListener('scroll', onScroll)
  window.addEventListener('resize', extractHeaders)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', extractHeaders)
})
</script>

<style scoped>
@import '@/styles/DocLayout.css';
</style>
