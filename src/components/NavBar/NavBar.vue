<template>
  <nav class="navbar" :class="{ 'is-menu-open': isMenuOpen }">
    <div class="navbar-container">
      <div class="navbar-brand" @click="goToHome">
        <img v-lazy="siteLogo" alt="Logo" class="navbar-logo" />
        <span class="navbar-title">{{ $t('navbar.title') }}</span>
      </div>

      <div class="navbar-content" :class="{ 'is-active': isMenuOpen }">
        <ul class="navbar-list">
          <li v-for="item in navItems" :key="item.key" class="navbar-item">
            <router-link :to="item.to">{{ $t(item.labelKey) }}</router-link>
          </li>
        </ul>

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
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'
import { navItems } from '@/data/navigation'
import { getAprilFoolsLogoPath } from '@/utils/aprilFools'
import Switcher from './Switcher.vue'
import SearchOverlay from './SearchOverlay.vue'

useI18n()

const router = useRouter()
const route = useRoute()
const isMenuOpen = ref(false)
const isSearchOpen = ref(false)
const siteLogo = getAprilFoolsLogoPath()

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
  // 阻止底层页面滚动，只允许菜单内部滚动
  if (isMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMenu = () => {
  isMenuOpen.value = false
  document.body.style.overflow = ''
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
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    openSearch()
  }
}

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))

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
