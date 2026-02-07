<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <img src="/imgs/favicon/favicon.ico" alt="Logo" class="navbar-logo" />
      <span class="navbar-title">{{ $t('navbar.title') }}</span>
    </div>

    <button class="hamburger" @click="toggleMenu" :class="{ 'is-active': isMenuOpen }">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <div class="navbar-collapse" :class="{ 'is-active': isMenuOpen }">
      <ul class="navbar-list">
        <li class="navbar-item">
          <a href="/modpacks">{{ $t('navbar.modpack') }}</a>
        </li>
        <li class="navbar-item">
          <a href="/map">{{ $t('navbar.map') }}</a>
        </li>
        <li class="navbar-item">
          <a href="/community">{{ $t('navbar.community') }}</a>
        </li>
        <li class="navbar-item">
          <a href="/support-us">{{ $t('navbar.supportUs') }}</a>
        </li>
        <li class="navbar-item">
          <a href="/tools">{{ $t('navbar.tools') }}</a>
        </li>
        <li class="navbar-item">
          <a href="/rule">{{ $t('navbar.rule') }}</a>
        </li>
        <li class="navbar-button">
          <div class="navbar-button-group">
            <Switcher />
          </div>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Switcher from './Switcher.vue'

useI18n()

const isMenuOpen = ref(false)
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<style scoped>
@import '@/styles/NavBar.css';
</style>
