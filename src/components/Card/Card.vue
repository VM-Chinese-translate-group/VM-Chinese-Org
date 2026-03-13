<template>
  <a
    :href="isExternal ? link : withBase(link)"
    :target="isExternal ? '_blank' : '_self'"
    :class="`card card-theme-medium card-hover`"
    :title="title"
  >
    <div :class="`card-footer`">
      <template v-if="!logoMissing">
        <img class="card-logo" :src="logoLink" />
      </template>

      <div class="card-content">
        <div class="card-title">
          {{ title }}
        </div>
        <div class="card-desc">
          {{ descText }}
        </div>
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface CardProps {
  title: string
  desc?: string
  logo?: string
  link?: string
}

const props = withDefaults(defineProps<CardProps>(), {
  desc: '',
  logo: '',
  link: '',
})

const BASE = ''

function withBase(url: string) {
  if (!url) return ''
  if (/^https?:\/\//.test(url)) return url
  return BASE + url
}

function isLinkExternal(url: string) {
  return /^https?:\/\//.test(url)
}

function isRelativeLink(url: string) {
  return !/^https?:\/\//.test(url)
}

const isExternal = computed(() => isLinkExternal(props.link))

const logoLink = computed(() => {
  if (props.logo === '') {
    return withBase('/imgs/missing.png')
  }

  return isRelativeLink(props.logo) ? withBase(props.logo) : props.logo
})

const logoMissing = computed(() => logoLink.value === 'no-logo')

const descText = computed(() => {
  if (props.desc) return props.desc
  return props.link || ''
})
</script>

<style scoped>
@import '@/styles/Card.css';
</style>
