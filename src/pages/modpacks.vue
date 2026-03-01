<template>
  <div class="markdown-body">
    <h2>整合包汉化补丁安装教程</h2>
    <p>事前准备：</p>
    <ul>
      <li>一个解压缩软件，如7-Zip、Bandizip、WinRAR、360压缩等；</li>
      <li>一个你喜欢的最新版的Minecraft启动器，推荐使用HMCL和PCL2。</li>
    </ul>

    <DownloadCards :mods="modpacks" />
  </div>
</template>

<script setup>
import { modpacks } from 'virtual:modpacks'
import DownloadCards from '@/components/DownloadPage/DownloadCards.vue'
</script>
