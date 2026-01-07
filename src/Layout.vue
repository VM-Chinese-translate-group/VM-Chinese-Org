<template>
  <div class="layout">
    <NavBar class="navbar" />

    <router-view />

    <Footer class="footer" />
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar/NavBar.vue'
import Footer from '@/components/Footer/Footer.vue'
</script>
