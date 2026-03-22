<template>
  <div class="switcher-container">
    <div class="switcher-group" :class="{ 'is-open': dropdownOpen }">
      <div class="language-trigger" @click.stop="toggleDropdown">
        <Icon icon="lucide:languages" class="icon" />
        <span class="current-lang-name">{{ currentLangName }}</span>
        <Icon icon="lucide:chevron-down" class="dropdown-arrow" />
      </div>

      <ul class="language-dropdown">
        <li
          v-for="lang in availableLanguages"
          :key="lang.code"
          @click="selectLanguage(lang.code)"
          class="dropdown-item"
          :class="{ active: locale === lang.code }"
        >
          <span>{{ lang.name }}</span>
          <Icon v-if="locale === lang.code" icon="lucide:check" class="check-icon" />
        </li>
      </ul>
    </div>

    <button @click="toggleTheme" class="theme-toggle-btn">
      <div class="icon-wrapper" :class="{ 'is-dark': isDark }">
        <Icon icon="lucide:sun" class="sun-icon" />
        <Icon icon="lucide:moon" class="moon-icon" />
      </div>
      <span class="mobile-label">{{ $t('navbar.appearance') }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'

const { locale } = useI18n()
const dropdownOpen = ref(false)
const isDark = ref(false)

const availableLanguages = [
  { code: 'zh-CN', name: '简体中文' },
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'en-US', name: 'English' },
]

const currentLangName = computed(() => {
  return availableLanguages.find((l) => l.code === locale.value)?.name || 'Language'
})

const toggleDropdown = () => (dropdownOpen.value = !dropdownOpen.value)
const closeDropdown = () => (dropdownOpen.value = false)

const selectLanguage = (langCode: string) => {
  locale.value = langCode
  localStorage.setItem('locale', langCode)
  dropdownOpen.value = false
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  updateTheme()
}

const updateTheme = () => {
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  window.addEventListener('click', closeDropdown)
  const savedTheme = localStorage.getItem('theme')
  if (
    savedTheme === 'dark' ||
    (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    isDark.value = true
    updateTheme()
  }
})

onUnmounted(() => window.removeEventListener('click', closeDropdown))
</script>

<style scoped>
@import '@/styles/Switcher.css';
</style>
