<template>
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const dropdownOpen = ref(false)

const availableLanguages = [
  { code: 'zh-CN', name: '简体中文' },
  { code: 'en-US', name: 'English' },
]

// 根据当前 locale 计算显示的语言名称
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
</script>

<style scoped>
@import '@/styles/Switcher.css';
</style>
