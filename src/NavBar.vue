<template>
  <nav class="navbar">
    <ul class="navbar-list">
      <li class="navbar-icon">
        <img src="/vm_title_icon.ico" alt="Logo" class="navbar-logo" />
        <span class="navbar-title">VM汉化组</span>
      </li>
      <li class="navbar-item"><a href="/modpack">整合包汉化</a></li>
      <li class="navbar-item"><a href="/map">地图汉化</a></li>
      <li class="navbar-item">
        <Icon icon="ix:language-filled" weight="100px" />
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
</script>

<style lang="css">
@import './NavBar.css';
</style>
