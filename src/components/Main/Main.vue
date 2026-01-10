<template>
  <main class="main-container">
    <section class="hero-section">
      <div class="hero-bg-wrapper">
        <img src="/imgs/home.png" class="hero-bg-img" alt="background" />
        <div class="hero-overlay"></div>
      </div>

      <div class="hero-content">
        <img src="/imgs/logo/logo_long.png" alt="Logo" class="hero-logo" />
        <h1 class="hero-title">{{ $t('navbar.title') }}</h1>
        <p class="hero-slogan">{{ $t('main.slogan') }}</p>

        <div class="action-buttons">
          <RouterLink to="/modpack" class="primary-btn">
            {{ $t('main.modpackBtn') }}
            <Icon icon="fluent:arrow-right-48-filled" class="btn-icon" />
          </RouterLink>

          <RouterLink to="/map" class="primary-btn">
            {{ $t('main.mapBtn') }}
            <Icon icon="fluent:arrow-right-48-filled" class="btn-icon" />
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="info-section">
      <div class="info-grid">
        <div class="info-card" v-for="item in infoItems" :key="item.title">
          <h3>{{ $t(item.title) }}</h3>
          <p>{{ $t(item.desc) }}</p>
        </div>
      </div>
    </section>

    <MarkdownDemo />
  </main>
</template>

<script setup lang="ts">
import MarkdownDemo from '@/pages/markdown-demo.md'

const infoItems = [
  { title: 'main.qualityTitle', desc: 'main.qualityDesc' },
  { title: 'main.teamTitle', desc: 'main.teamDesc' },
  { title: 'main.copyrightTitle', desc: 'main.copyrightDesc' },
  { title: 'main.techTitle', desc: 'main.techDesc' },
]
</script>

<style scoped>
@import '@/styles/Main.css';
</style>
