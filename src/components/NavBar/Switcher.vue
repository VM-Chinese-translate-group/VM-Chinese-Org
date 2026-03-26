<template>
  <div class="switcher-container" @mousedown.prevent>
    <div class="switcher-group" :class="{ 'is-open': isDropdownOpen }">
      <div
        class="language-trigger"
        role="button"
        aria-haspopup="listbox"
        :aria-expanded="isDropdownOpen"
        @click.stop="toggleDropdown"
      >
        <Icon icon="lucide:languages" class="icon-main" />
        <span class="current-lang-name">{{ currentLangName }}</span>
        <Icon icon="lucide:chevron-down" class="dropdown-arrow" />
      </div>

      <ul class="language-dropdown" role="listbox">
        <li
          v-for="lang in AVAILABLE_LANGUAGES"
          :key="lang.code"
          class="dropdown-item"
          :class="{ active: locale === lang.code }"
          role="option"
          :aria-selected="locale === lang.code"
          @click.stop="selectLanguage(lang.code)"
        >
          <span>{{ lang.name }}</span>
          <Icon v-if="locale === lang.code" icon="lucide:check" class="check-icon" />
        </li>
      </ul>
    </div>

    <button
      class="theme-toggle-btn"
      :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      @click="toggleTheme"
    >
      <div class="icon-wrapper" :class="{ 'is-dark': isDark }">
        <Icon icon="lucide:sun" class="sun-icon" />
        <Icon icon="lucide:moon" class="moon-icon" />
      </div>
      <span class="mobile-label">{{ $t('navbar.appearance') }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'

type LocaleCode = 'zh-CN' | 'zh-TW' | 'en-US'

interface LanguageOption {
  code: LocaleCode
  name: string
}

const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'zh-CN', name: '简体中文' },
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'en-US', name: 'English' },
]

const { locale } = useI18n<{ locale: LocaleCode }>()
const isDropdownOpen = ref(false)
const isDark = ref(false)

const currentLangName = computed((): string => {
  return AVAILABLE_LANGUAGES.find((l) => l.code === locale.value)?.name ?? 'Language'
})

const toggleDropdown = () => (isDropdownOpen.value = !isDropdownOpen.value)
const closeDropdown = () => (isDropdownOpen.value = false)

const selectLanguage = (code: LocaleCode) => {
  locale.value = code
  localStorage.setItem('locale', code)
  isDropdownOpen.value = false
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  applyTheme(isDark.value)
}

const applyTheme = (dark: boolean) => {
  const root = document.documentElement
  if (dark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}

onMounted(() => {
  window.addEventListener('click', closeDropdown)

  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  isDark.value = savedTheme === 'dark' || (!savedTheme && prefersDark)
  applyTheme(isDark.value)
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
@import '@/styles/Switcher.css';
</style>
