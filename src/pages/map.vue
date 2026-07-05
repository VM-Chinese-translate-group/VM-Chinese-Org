<template>
  <div class="markdown-body resource-list-page">
    <DownloadCards :mods="maps" :show-loader-filter="false" />
  </div>
</template>

<script setup lang="ts">
import DownloadCards from '@/layout/DownloadCards.vue'
import { maps } from 'virtual:resources'
</script>

<style scoped>
.resource-list-page {
  background: var(--bg-off-white);
}
</style>
