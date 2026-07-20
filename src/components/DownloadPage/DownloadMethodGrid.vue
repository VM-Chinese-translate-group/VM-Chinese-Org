<script setup lang="ts">
import type { DownloadMethodItem } from './downloadMethods'

defineProps<{
  items: DownloadMethodItem[]
}>()

const emit = defineEmits<{
  select: [item: DownloadMethodItem]
}>()
</script>

<template>
  <div class="flex flex-wrap justify-center gap-4">
    <button
      v-for="item in items"
      :key="item.name"
      type="button"
      :class="[
        'download-method-button group flex h-[140px] w-[160px] cursor-pointer flex-col items-center justify-center border-none rounded-[var(--link-radius)] bg-[var(--link-bg)] p-5 no-underline! transition-[background-color,transform] duration-[250ms] ease-[ease] hover:-translate-y-px hover:bg-[var(--link-bg-hover)] hover:no-underline!',
        { 'lazy-text': item.id === 'lazy' },
      ]"
      @click="emit('select', item)"
    >
      <div
        v-if="item.icon && typeof item.icon === 'string' && item.icon.startsWith('i')"
        :class="[
          item.icon,
          'mb-2.5 h-11 w-11 object-contain transition-transform duration-[250ms] group-hover:scale-106',
        ]"
      />
      <img
        v-else
        v-lazy="item.icon"
        class="mb-2.5 h-11 w-11 object-contain transition-transform duration-[250ms] group-hover:scale-106"
      />
      <span class="text-[0.92rem] text-[var(--link-title)] font-500 leading-[1.2]">
        {{ item.name }}
      </span>
      <span class="mt-1 text-xs text-[var(--link-desc)] leading-[1.2]">
        {{ item.secondary }}
      </span>
    </button>
  </div>
</template>
