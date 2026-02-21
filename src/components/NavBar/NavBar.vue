<template>
  <nav class="navbar">
    <div class="navbar-left">
      <div class="navbar-brand" @click="goToHome">
        <img v-lazy="'/imgs/logo/logo_128.png'" alt="Logo" class="navbar-logo" />
        <span class="navbar-title">
          {{ $t('navbar.title') }}
        </span>
      </div>

      <div class="navbar-search-container" @click="openSearch">
        <div class="search-box-trigger">
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
      </div>
    </div>

    <div class="navbar-collapse" :class="{ 'is-active': isMenuOpen }">
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
    </div>

    <div class="navbar-right">
      <Switcher />

      <button class="hamburger" @click="toggleMenu" :class="{ 'is-active': isMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>

    <SearchOverlay :visible="isSearchOpen" @close="isSearchOpen = false" />
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Switcher from './Switcher.vue'
import SearchOverlay from './SearchOverlay.vue'

useI18n()

const router = useRouter()
const isMenuOpen = ref(false)
const isSearchOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const openSearch = () => {
  isSearchOpen.value = true
}

const handleKeyDown = (e: KeyboardEvent) => {
  // 监听 Ctrl+K 或 Command+K (Mac)
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault() // 阻止浏览器默认搜索行为
    openSearch()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

const goToHome = () => {
  // 如果当前已经在主页，则滚动到顶部
  if (router.currentRoute.value.path === '/') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    // 否则导航到主页
    router.push('/')
  }
}
</script>

<style scoped>
@import '@/styles/NavBar.css';
</style>
