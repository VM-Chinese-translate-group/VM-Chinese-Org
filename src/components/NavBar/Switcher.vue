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
.switcher {
  user-select: none;
  position: relative;
  display: inline-block;
}

.language-display {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.language-display:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.language-display .icon {
  margin-right: 5px;
}

.dropdown-arrow {
  margin-left: 5px;
  transition: transform 0.3s ease;
}

.dropdown-arrow.rotate {
  transform: rotate(180deg);
}

.language-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  list-style: none;
  padding: 5px 0;
  margin: 5px 0 0 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 100px;
  z-index: 1000;
}

.dropdown-item {
  padding: 8px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
}

.dropdown-item.active {
  background-color: #e0e0e0;
  font-weight: bold;
}
</style>
