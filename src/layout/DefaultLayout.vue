<template>
  <div class="layout">
    <NavBar class="navbar" />

    <DocLayout v-if="isDocLayout">
      <router-view />
    </DocLayout>

    <template v-else>
      <router-view />
    </template>

    <Footer class="footer" />
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
