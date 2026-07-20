<template>
  <div class="doc-page-container">
    <header class="doc-header" v-if="pageTitle">
      <h1 ref="titleRef">{{ convertedPageTitle }}</h1>
      <p v-if="pageDescription" class="doc-subtitle">{{ convertedPageDescription }}</p>
    </header>

    <main class="doc-main">
      <section class="doc-content markdown-body" ref="contentRef">
        <slot />
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

  <ImagePreview
    :visible="previewVisible"
    :imgs="previewImages"
    :index="previewIndex"
    @hide="closePreview"
    @update:visible="onPreviewVisibleChange"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { convertMarkdownContainers, convertInlineText } from '@/utils/zhconv'
import { useImagePreview } from '@/composables/useImagePreview'
import ImagePreview from '@/components/ImagePreview.vue'

interface DocMeta {
  description?: string
  sidebar?: boolean
  title?: string
  [key: string]: unknown
}

const props = defineProps<{ meta?: DocMeta }>()

const { t, locale } = useI18n()

const contentRef = ref<HTMLElement | null>(null)
const {
  closePreview,
  images: previewImages,
  index: previewIndex,
  onVisibleChange: onPreviewVisibleChange,
  visible: previewVisible,
} = useImagePreview(contentRef)

const pageTitle = computed(() => props.meta?.title || '')
const pageDescription = computed(() => props.meta?.description || '')
const convertedPageTitle = ref('')
const convertedPageDescription = ref('')
let conversionRequestId = 0
let headerRequestId = 0

interface Heading {
  id: string
  text: string
  level: number
  top: number
}

const headers = ref<Heading[]>([])
const activeId = ref<string>('')

const showSidebar = computed(() => {
  if (props.meta?.sidebar === false) return false
  return headers.value.length > 0
})

const handleConversion = async () => {
  const requestId = ++conversionRequestId
  const targetLocale = locale.value
  await nextTick()

  if (contentRef.value) {
    await convertMarkdownContainers(targetLocale, contentRef.value)
  }

  const [title, description] = await Promise.all([
    convertInlineText(pageTitle.value, targetLocale),
    convertInlineText(pageDescription.value, targetLocale),
  ])

  if (requestId !== conversionRequestId || targetLocale !== locale.value) return

  convertedPageTitle.value = title
  convertedPageDescription.value = description
  await extractHeaders(targetLocale)
}

const extractHeaders = async (targetLocale = locale.value) => {
  if (!contentRef.value) return

  const requestId = ++headerRequestId
  const headingElements = Array.from(contentRef.value.querySelectorAll('h2, h3'))

  const nextHeaders = await Promise.all(
    headingElements.map(async (el) => {
      const rawText = el.textContent || ''
      const cleanText = rawText
        .replace(/^#+\s*/, '')
        .replace(/#\s*$/, '')
        .replace(/\{#.*?\}/g, '')
        .trim()

      const translatedText = await convertInlineText(cleanText, targetLocale)

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

  if (requestId !== headerRequestId || targetLocale !== locale.value) return
  headers.value = nextHeaders
  onScroll()
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
  () => props.meta,
  () => {
    void handleConversion()
  },
  { immediate: true, deep: true },
)

watch(locale, () => {
  void handleConversion()
})

onMounted(() => {
  window.addEventListener('scroll', onScroll)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  conversionRequestId += 1
  headerRequestId += 1
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
  void extractHeaders()
}
</script>

<style scoped>
@import '@/styles/DocLayout.css';
</style>
