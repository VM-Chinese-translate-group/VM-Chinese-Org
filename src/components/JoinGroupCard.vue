<template>
  <section class="join-card">
    <header class="join-card-header">
      <h2 class="join-card-title">
        {{ title }}
      </h2>

      <a class="join-card-button" :href="applyLink" target="_blank" rel="noopener">立即申请</a>
    </header>

    <div class="join-card-body">
      <h3>负责内容</h3>

      <ol>
        <li v-for="(item, i) in responsibilities" :key="i">
          {{ item }}
        </li>
      </ol>

      <template v-if="requirements?.length">
        <h3>要求</h3>

        <ol>
          <li v-for="(item, i) in requirements" :key="i">
            {{ item }}
          </li>
        </ol>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  applyLink: string
  responsibilities: string[]
  requirements?: string[]
}>()
</script>

<style scoped>
@import '@/styles/JoinGroupCard.css';
</style>
