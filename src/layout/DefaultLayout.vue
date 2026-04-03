<template>
  <div class="layout">
    <NavBar />

    <DocLayout v-if="isDocLayout">
      <router-view />
    </DocLayout>

    <router-view v-else />

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import NavBar from '@/components/NavBar/NavBar.vue'
import Footer from '@/components/Footer/Footer.vue'
import DocLayout from '@/layout/DocLayout.vue'

const route = useRoute()

const isDocLayout = computed(() => route.meta.layout === 'doc')
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
}
</style>
