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
import { defineAsyncComponent } from 'vue'

import { ROUTE_LAYOUT } from '@/router/route-meta'

const NavBar = defineAsyncComponent(() => import('@/components/NavBar/NavBar.vue'))
const Footer = defineAsyncComponent(() => import('@/components/Footer/Footer.vue'))
const DocLayout = defineAsyncComponent(() => import('@/layout/DocLayout.vue'))

const route = useRoute()

const isDocLayout = computed(() => route.meta.layout === ROUTE_LAYOUT.DOC)
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
}
</style>
