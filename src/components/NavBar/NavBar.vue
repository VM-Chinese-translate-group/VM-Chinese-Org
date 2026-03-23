<template>
  <nav class="navbar" :class="{ 'is-menu-open': isMenuOpen }">
    <div class="navbar-container">
      <div class="navbar-brand" @click="goToHome">
        <img v-lazy="'/imgs/logo/logo_128.png'" alt="Logo" class="navbar-logo" />
        <span class="navbar-title">{{ $t('navbar.title') }}</span>
      </div>

      <div class="navbar-content" :class="{ 'is-active': isMenuOpen }">
        <ul class="navbar-list">
          <li class="navbar-item">
            <router-link to="/modpacks">{{ $t('navbar.modpack') }}</router-link>
          </li>
          <li class="navbar-item">
            <router-link to="/map">{{ $t('navbar.map') }}</router-link>
          </li>
          <li class="navbar-item">
            <router-link to="/community">{{ $t('navbar.community') }}</router-link>
          </li>
          <li class="navbar-item">
            <router-link to="/support-us">{{ $t('navbar.supportUs') }}</router-link>
          </li>
          <li class="navbar-item">
            <router-link to="/tools">{{ $t('navbar.tools') }}</router-link>
          </li>
          <li class="navbar-item">
            <router-link to="/rule">{{ $t('navbar.rule') }}</router-link>
          </li>
        </ul>

        <div class="navbar-divider"></div>

        <div class="navbar-utils">
          <div class="search-box-trigger desktop-search" @click="openSearch">
            <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m21 21l-4.343-4.343m0 0A8 8 0 1 0 5.343 5.343a8 8 0 0 0 11.314 11.314Z"
              />
            </svg>
            <span class="search-text">{{ $t('search.placeholder') }}</span>
            <span class="search-shortcut">Ctrl K</span>
          </div>
          <Switcher />
        </div>
      </div>

      <div class="navbar-mobile-actions">
        <button class="mobile-search-btn" @click="openSearch">
          <Icon icon="lucide:search" class="search-icon" />
        </button>
        <button class="hamburger" @click="toggleMenu" :class="{ 'is-active': isMenuOpen }">
          <span class="line"></span><span class="line"></span><span class="line"></span>
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
import Switcher from './Switcher.vue'
import SearchOverlay from './SearchOverlay.vue'

useI18n()

const router = useRouter()
const route = useRoute()
const isMenuOpen = ref(false)
const isSearchOpen = ref(false)

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
