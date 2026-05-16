<template>
  <div class="markdown-body">
    <DownloadCards :mods="modpacks" />
  </div>
</template>

<script setup lang="ts">
import DownloadCards from '@/layout/DownloadCards.vue'
import { modpacks } from 'virtual:resources'
</script>
