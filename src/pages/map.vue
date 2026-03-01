<template>
  <div class="markdown-body">
    <h2>地图汉化下载</h2>
    <p>地图是原版MC的！无需模组，把地图放进存档（saves）文件夹！</p>

    <DownloadCards :mods="maps" />
  </div>
</template>

<script setup>
import { maps } from 'virtual:resources'
import DownloadCards from '@/components/DownloadPage/DownloadCards.vue'
</script>
