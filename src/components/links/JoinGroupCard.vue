<template>
  <section class="join-card">
    <header class="join-card__header">
      <h2 class="join-card__title">
        <span class="join-card__emoji" aria-hidden="true">{{ emoji }}</span>
        <span>{{ title }}</span>
      </h2>
      <a class="join-card__apply" :href="applyLink" target="_blank" rel="noopener"> 立即申请 </a>
    </header>

    <div class="join-card__divider" />

    <div class="join-card__content">
      <h3>负责内容</h3>
      <ol>
        <li v-for="(item, index) in responsibilities" :key="`resp-${index}`">{{ item }}</li>
      </ol>

      <template v-if="requirements?.length">
        <h3>要求</h3>
        <ol>
          <li v-for="(item, index) in requirements" :key="`req-${index}`">{{ item }}</li>
        </ol>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  emoji: string
  title: string
  applyLink: string
  responsibilities: string[]
  requirements?: string[]
}>()
</script>
