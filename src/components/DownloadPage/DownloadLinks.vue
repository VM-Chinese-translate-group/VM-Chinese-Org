<template>
  <div v-if="downloadMethods.length > 1">
    <DownloadModal :items="downloadMethods" />
  </div>
</template>

<script setup lang="ts">
import { useUrlSearchParams } from '@vueuse/core'
import { computed, inject, onBeforeUnmount, onMounted, watch } from 'vue'
import DownloadModal from '@/components/DownloadPage/DownloadModal.vue'
import {
  DOWNLOAD_METHODS_REGISTRAR,
  getPageDownloadMethods,
  type DownloadMethodItem,
  type DownloadMethodSource,
} from '@/components/DownloadPage/downloadMethods'

const props = withDefaults(
  defineProps<{
    methods?: DownloadMethodSource[]
  }>(),
  {
    methods: () => [],
  },
)

const params = useUrlSearchParams('history')
const registerDownloadMethods = inject(DOWNLOAD_METHODS_REGISTRAR, null)
const downloadMethods = computed(() => getPageDownloadMethods(props.methods))

function downloadJump(methods: DownloadMethodItem[]) {
  const query = Array.isArray(params.q) ? params.q[0] : params.q
  if (typeof query !== 'string') return

  const targetId = query.toLowerCase()
  const target = methods.find((method) => method.id?.toLowerCase() === targetId)

  if (target?.link) {
    location.href = target.link
  }
}

watch(
  downloadMethods,
  (methods) => {
    registerDownloadMethods?.(methods)
  },
  { immediate: true },
)

onMounted(() => {
  downloadJump(downloadMethods.value)
})

onBeforeUnmount(() => {
  registerDownloadMethods?.([])
})
</script>
