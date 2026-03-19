<template>
  <div class="layout">
    <NavBar class="navbar" />

    <main class="notfound">
      <div class="content">
        <h1 class="code">404</h1>

        <p class="title">
          {{ $t('notFound.title') }}
        </p>

        <p class="desc">
          {{ $t('notFound.desc') }}
        </p>

        <p class="hint">
          {{ $t('notFound.hint') }}
        </p>

        <router-link to="/" class="home-btn">
          {{ $t('notFound.backHome') }}
        </router-link>
      </div>
    </main>

    <Footer class="footer" />
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar/NavBar.vue'
import Footer from '@/components/Footer/Footer.vue'
</script>

<style scoped>
@import '@/styles/NotFound.css';
</style>
