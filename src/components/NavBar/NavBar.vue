<template>
  <nav class="navbar" :class="{ 'is-menu-open': isMenuOpen }">
    <div class="navbar-container">
      <div class="navbar-brand" @click="goToHome">
        <img v-lazy="siteLogo" alt="Logo" class="navbar-logo" />
        <span class="navbar-title">{{ $t('navbar.title') }}</span>
      </div>

      <div class="navbar-content" :class="{ 'is-active': isMenuOpen }">
        <div class="navbar-nav-area" ref="navAreaRef">
          <ul class="navbar-list">
            <li v-for="item in visibleNavItems" :key="item.key" class="navbar-item">
              <a
                v-if="isExternalLink(item.to)"
                :href="item.to"
                target="_blank"
                rel="noopener"
                @click="closeMenu"
              >
                {{ $t(item.labelKey) }}
              </a>
              <router-link v-else :to="item.to">{{ $t(item.labelKey) }}</router-link>
            </li>
          </ul>

          <div v-if="overflowNavItems.length" class="navbar-more" @click.stop>
            <button
              class="navbar-more-button"
              type="button"
              :aria-expanded="isMoreOpen"
              aria-haspopup="menu"
              @click="toggleMore"
            >
              <span>{{ $t('navbar.more') }}</span>
              <Icon
                icon="lucide:chevron-down"
                class="navbar-more-icon"
                :class="{ 'is-open': isMoreOpen }"
              />
            </button>
            <ul class="navbar-more-menu" :class="{ 'is-open': isMoreOpen }" role="menu">
              <li v-for="item in overflowNavItems" :key="item.key" class="navbar-more-item">
                <a
                  v-if="isExternalLink(item.to)"
                  :href="item.to"
                  target="_blank"
                  rel="noopener"
                  role="menuitem"
                  @click="closeMenu"
                >
                  {{ $t(item.labelKey) }}
                </a>
                <router-link v-else :to="item.to" role="menuitem">
                  {{ $t(item.labelKey) }}
                </router-link>
              </li>
            </ul>
          </div>

          <div class="navbar-measure" aria-hidden="true">
            <span
              v-for="item in navItems"
              :key="item.key"
              ref="measureItemRefs"
              class="navbar-item"
            >
              <span>{{ $t(item.labelKey) }}</span>
            </span>
            <span ref="moreMeasureRef" class="navbar-more-button">
              <span>{{ $t('navbar.more') }}</span>
              <Icon icon="lucide:chevron-down" class="navbar-more-icon" />
            </span>
          </div>
        </div>

        <div class="navbar-divider"></div>

        <div class="navbar-utils">
          <div class="search-box-trigger desktop-search" @click="openSearch">
            <Icon icon="lucide:search" class="search-icon" />
            <span class="search-text">{{ $t('search.placeholder') }}</span>
            <span class="search-shortcut" :aria-label="isApplePlatform ? 'Command K' : 'Ctrl K'">
              <Icon
                v-if="isApplePlatform"
                icon="lucide:command"
                class="search-shortcut-icon"
                aria-hidden="true"
              />
              <span v-else>Ctrl</span>
              <span>K</span>
            </span>
          </div>
          <Switcher />
        </div>
      </div>

      <div class="navbar-mobile-actions">
        <button class="mobile-search-btn" @click="openSearch">
          <Icon icon="lucide:search" class="search-icon" />
        </button>
        <button class="hamburger" @click="toggleMenu" :class="{ 'is-active': isMenuOpen }">
          <span class="line"></span>
          <span class="line"></span>
          <span class="line"></span>
        </button>
      </div>
    </div>
    <SearchOverlay :visible="isSearchOpen" @close="isSearchOpen = false" />
  </nav>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'
import { navItems } from '@/data/navigation'
import { getAprilFoolsLogoPath } from '@/utils/aprilFools'
import Switcher from './Switcher.vue'
import SearchOverlay from './SearchOverlay.vue'

const { locale } = useI18n()

const router = useRouter()
const route = useRoute()
const isMenuOpen = ref(false)
const isMoreOpen = ref(false)
const isSearchOpen = ref(false)
const siteLogo = getAprilFoolsLogoPath()
const visibleCount = ref(navItems.length)
const navAreaRef = ref<HTMLElement | null>(null)
const measureItemRefs = ref<HTMLElement[]>([])
const moreMeasureRef = ref<HTMLElement | null>(null)
let resizeObserver: ResizeObserver | null = null

const visibleNavItems = computed(() => navItems.slice(0, visibleCount.value))
const overflowNavItems = computed(() => navItems.slice(visibleCount.value))
const isExternalLink = (url: string) => /^https?:\/\//.test(url)

const getIsApplePlatform = () => {
  if (typeof navigator === 'undefined') return false

  const platform = navigator.platform.toLowerCase()
  const userAgent = navigator.userAgent.toLowerCase()
  return (
    platform.includes('mac') ||
    platform.includes('iphone') ||
    platform.includes('ipad') ||
    platform.includes('ipod') ||
    userAgent.includes('mac os') ||
    userAgent.includes('iphone') ||
    userAgent.includes('ipad') ||
    userAgent.includes('ipod')
  )
}

const isApplePlatform = getIsApplePlatform()

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  isMoreOpen.value = false
  // 阻止底层页面滚动，只允许菜单内部滚动
  if (isMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMenu = () => {
  isMenuOpen.value = false
  isMoreOpen.value = false
  document.body.style.overflow = ''
}

const toggleMore = () => {
  isMoreOpen.value = !isMoreOpen.value
}

watch(
  () => route.path,
  () => {
    closeMenu()
  },
)

const openSearch = () => {
  isSearchOpen.value = true
  closeMenu()
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    isMoreOpen.value = false
    return
  }

  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    openSearch()
  }
}

const calculateVisibleItems = async () => {
  await nextTick()

  if (typeof window === 'undefined' || window.innerWidth <= 860) {
    visibleCount.value = navItems.length
    isMoreOpen.value = false
    return
  }

  const navAreaWidth = navAreaRef.value?.clientWidth ?? 0
  const itemWidths = measureItemRefs.value.map((el) => el.offsetWidth)
  const moreWidth = moreMeasureRef.value?.offsetWidth ?? 0

  if (!navAreaWidth || itemWidths.length !== navItems.length) {
    visibleCount.value = navItems.length
    return
  }

  const totalWidth = itemWidths.reduce((sum, width) => sum + width, 0)
  if (totalWidth <= navAreaWidth) {
    visibleCount.value = navItems.length
    isMoreOpen.value = false
    return
  }

  let usedWidth = moreWidth
  let nextVisibleCount = 0

  for (const width of itemWidths) {
    if (usedWidth + width > navAreaWidth) break
    usedWidth += width
    nextVisibleCount += 1
  }

  visibleCount.value = Math.max(0, Math.min(nextVisibleCount, navItems.length - 1))
}

const handleDocumentClick = () => {
  isMoreOpen.value = false
}

const handleResize = () => {
  void calculateVisibleItems()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleDocumentClick)

  if ('ResizeObserver' in window && navAreaRef.value) {
    resizeObserver = new ResizeObserver(() => {
      void calculateVisibleItems()
    })
    resizeObserver.observe(navAreaRef.value)
  }

  void calculateVisibleItems()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleDocumentClick)
  resizeObserver?.disconnect()
})

watch(locale, () => {
  void calculateVisibleItems()
})

const goToHome = () => {
  closeMenu()
  if (route.path === '/') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
@import '@/styles/NavBar.css';
</style>
