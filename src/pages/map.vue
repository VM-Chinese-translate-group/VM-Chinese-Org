<template>
  <div class="markdown-body">
    <DownloadCards :mods="maps" />
  </div>
</template>

<script setup lang="ts">
import DownloadCards from '@/layout/DownloadCards.vue'
import { maps } from 'virtual:resources'
</script>
