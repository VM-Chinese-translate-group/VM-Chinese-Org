<template>
  <main class="main-container">
    <section class="hero-section">
      <div class="hero-bg-wrapper">
        <img src="/main.png" class="hero-bg-img" alt="background" />
        <div class="hero-overlay"></div> </div>

      <div class="hero-content">
        <img src="/vmicon.png" alt="Logo" class="hero-logo" />
        <h1 class="hero-title">{{ $t('navbar.title') }}</h1>
        <p class="hero-slogan">{{ $t('main.slogan') }}</p>

        <div class="action-buttons">
          <button class="primary-btn">
            {{ $t('main.modpackBtn') }}
            <Icon icon="fluent:arrow-right-48-filled" class="btn-icon" />
          </button>
          <button class="primary-btn">
            {{ $t('main.mapBtn') }}
            <Icon icon="fluent:arrow-right-48-filled" class="btn-icon" />
          </button>
        </div>
      </div>
    </section>

    <section class="info-section">
      <div class="info-grid">
        <div class="info-card">
          <h3>{{ $t('main.qualityTitle') }}</h3>
          <p>{{ $t('main.qualityDesc') }}</p>
        </div>
        <div class="info-card">
          <h3>{{ $t('main.teamTitle') }}</h3>
          <p>{{ $t('main.teamDesc') }}</p>
        </div>
        <div class="info-card">
          <h3>{{ $t('main.copyrightTitle') }}</h3>
          <p>{{ $t('main.copyrightDesc') }}</p>
        </div>
        <div class="info-card">
          <h3>{{ $t('main.techTitle') }}</h3>
          <p>{{ $t('main.techDesc') }}</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

useI18n()
</script>

<style lang="css" scoped>
@import './css/Main.css';
</style>
