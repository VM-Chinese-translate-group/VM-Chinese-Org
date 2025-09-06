<template>
  <main class="main-container">
    <div class="title-content">
      <img src="/main.webp" />
      <div class="title-text">
        <img src="/vmicon.png" alt="" />
        <p>{{ $t('navbar.title') }}</p>
        <p>{{ $t('main.slogan') }}</p>
        <div class="button-div">
          <button>
            {{ $t('main.modpackBtn') }}
            <Icon icon="fluent:arrow-right-48-filled" class="arrow-icon" />
          </button>
          <button>
            {{ $t('main.mapBtn') }}
            <Icon icon="fluent:arrow-right-48-filled" class="arrow-icon" />
          </button>
        </div>
      </div>
    </div>
    <div class="other-content">
      <div class="info-box">
        <h3>{{ $t('main.qualityTitle') }}</h3>
        <p>
          {{ $t('main.qualityDesc') }}
        </p>
      </div>
      <div class="info-box">
        <h3>{{ $t('main.teamTitle') }}</h3>
        <p>
          {{ $t('main.teamDesc') }}
        </p>
      </div>
      <div class="info-box">
        <h3>{{ $t('main.copyrightTitle') }}</h3>
        <p>
          {{ $t('main.copyrightDesc') }}
        </p>
      </div>
      <div class="info-box">
        <h3>{{ $t('main.techTitle') }}</h3>
        <p>
          {{ $t('main.techDesc') }}
        </p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

// 使用 i18n
useI18n()
</script>

<style lang="css" scoped>
@import './css/Main.css';
</style>
