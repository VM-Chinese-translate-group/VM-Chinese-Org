<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import DownloadMethodGrid from './DownloadMethodGrid.vue'
import { useDownloadModal } from './useDownloadModal'
import type { DownloadMethodItem } from './downloadMethods'
import type { DownloadQuestion } from '@/types/downloadQuestion'

const props = defineProps<{
  items?: DownloadMethodItem[]
  questions?: DownloadQuestion[]
  questionLoader?: (() => Promise<DownloadQuestion[]>) | null
}>()

const { locale, t } = useI18n()
const { handleDownloadMethod } = useDownloadModal({
  locale,
  questionLoader: props.questionLoader,
  questions: props.questions,
  t,
})
</script>

<template>
  <DownloadMethodGrid :items="items || []" @select="handleDownloadMethod" />
</template>

<style>
@import '@/styles/DownloadModal.css';
</style>
