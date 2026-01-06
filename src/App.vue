<template>
  <div>
    <NavBar class="navbar" />
    <MainContent class="main-content" />

    <div class="markdown-container markdown-body">
      <MarkdownDemo />
    </div>

    <Footer class="footer" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import MarkdownDemo from './markdown-demo.md'

const { locale } = useI18n()

onMounted(() => {
  const savedLocale = localStorage.getItem('locale')
  if (savedLocale) {
    locale.value = savedLocale
  }
})
</script>
