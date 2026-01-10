<template>
  <div class="switcher-container">
    <button @click="toggleTheme" class="theme-toggle-btn">
      <Icon :icon="isDark ? 'solar:sun-bold' : 'solar:moon-bold'" />
    </button>

    <div class="switcher">
      <div class="language-display" @click="toggleDropdown">
        <Icon icon="fluent-mdl2:locale-language" class="icon" />
        <span>{{ displayLanguage }}</span>
        <span class="dropdown-arrow" :class="{ rotate: dropdownOpen }">&#9660;</span>
      </div>

      <ul v-if="dropdownOpen" class="language-dropdown">
        <li
          v-for="lang in availableLanguages"
          :key="lang.code"
          @click="selectLanguage(lang.code)"
          class="dropdown-item"
          :class="{ active: locale === lang.code }"
        >
          {{ lang.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

const displayLanguage = computed(() => {
  const currentLang = availableLanguages.find((lang) => lang.code === locale.value)
  return currentLang ? currentLang.name : 'Unknown'
})

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

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
  const html = document.documentElement
  if (isDark.value) {
    html.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    html.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    isDark.value = true
    updateTheme()
  }
})
</script>

<style scoped>
@import '@/styles/Switcher.css';
</style>
