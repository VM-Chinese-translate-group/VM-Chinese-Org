<template>
  <div class="notfound">
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
  </div>
</template>

<style scoped>
@import '@/styles/NotFoundLayout.css';
</style>
