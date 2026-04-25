<template>
  <VueEasyLightbox
    :visible="visible"
    :imgs="imgs"
    :index="index"
    :move-disabled="false"
    :rotate-disabled="false"
    :zoom-disabled="false"
    @hide="emit('hide')"
    @on-visible-change="handleVisibleChange"
  />
</template>

<script setup lang="ts">
import VueEasyLightbox from 'vue-easy-lightbox'

defineProps<{
  imgs: Array<{ src: string; title?: string }>
  index: number
  visible: boolean
}>()

const emit = defineEmits<{
  hide: []
  'update:visible': [value: boolean]
}>()

const handleVisibleChange = (value: boolean) => {
  emit('update:visible', value)
}
</script>
