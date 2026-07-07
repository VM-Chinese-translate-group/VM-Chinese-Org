<template>
  <div v-if="downloadMethod.length > 1">
    <DownloadModal :items="downloadMethod" />
  </div>
</template>

<script setup>
import { useUrlSearchParams } from '@vueuse/core'
import { nextTick, onMounted } from 'vue'
import DownloadModal from '@/components/DownloadPage/DownloadModal.vue'
import { getPageDownloadMethods } from '@/components/DownloadPage/downloadMethods'

function downloadJump(params, downloadMethod) {
  if (!params.q) return

  const targetId = Array.isArray(params.q) ? params.q[0].toLowerCase() : params.q.toLowerCase()
  const target = downloadMethod.find((val) => val.id === targetId)

  if (target && target.link) {
    location.href = target.link
  }
}

const props = defineProps({
  methods: { type: Array, default: () => [] },
})

const params = useUrlSearchParams('history')
const downloadMethod = getPageDownloadMethods(props.methods)

onMounted(() => {
  nextTick(() => {
    window.dispatchEvent(
      new CustomEvent('vm-download-methods-ready', {
        detail: { methods: downloadMethod },
      }),
    )
  })
  downloadJump(params, downloadMethod)
})
</script>
