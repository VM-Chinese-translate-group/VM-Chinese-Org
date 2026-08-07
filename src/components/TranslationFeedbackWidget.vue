<template>
  <div
    v-if="visible"
    ref="widgetElement"
    class="group fixed right-[max(1rem,env(safe-area-inset-right))] top-[clamp(11rem,40vh,26rem)] z-30 inline-flex min-h-12 cursor-grab touch-none select-none items-center gap-2 border border-[color-mix(in_srgb,#c4b5fd_62%,transparent)] bg-[color-mix(in_srgb,#7c3aed_88%,transparent)] text-white shadow-[var(--vp-shadow-1)] backdrop-blur-sm transition-colors lt-sm:right-[max(0.75rem,env(safe-area-inset-right))] lt-sm:top-[7rem] lt-sm:max-w-[calc(100vw_-_1.5rem)] lt-sm:text-sm"
    :class="widgetClasses"
    :style="widgetStyle"
    @pointerdown="startDrag"
  >
    <button
      class="inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 whitespace-nowrap border-0 bg-transparent px-2 py-2 pl-0 font-inherit text-inherit focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
      :class="{ 'h-full w-full p-0': dock !== null }"
      type="button"
      :aria-label="$t('translationFeedback.widgetLabel')"
      @click="openPage"
    >
      <Icon class="text-[1.2rem] text-white" icon="lucide:message-heart" aria-hidden="true" />
      <span v-if="dock === null">{{ $t('translationFeedback.widgetLabel') }}</span>
    </button>
    <button
      v-if="dock === null"
      data-widget-close
      class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0 text-white/70 hover:bg-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
      type="button"
      :aria-label="$t('translationFeedback.dismiss')"
      @click="dismiss"
    >
      <Icon icon="lucide:x" aria-hidden="true" />
    </button>
    <span
      class="pointer-events-none invisible absolute bottom-[calc(100%+0.5rem)] left-1/2 z-40 w-max max-w-[min(18rem,calc(100vw_-_2rem))] -translate-x-1/2 rounded-lg border border-white/20 bg-[color-mix(in_srgb,var(--text-dark)_92%,transparent)] px-3 py-2 text-xs font-500 leading-snug text-white opacity-0 shadow-[var(--vp-shadow-1)] transition-opacity group-hover:visible group-hover:opacity-100"
      role="tooltip"
    >
      {{ $t('translationFeedback.widgetTooltip') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const DRAG_THRESHOLD = 5
const EDGE_DISTANCE = 28
const MIN_VIEWPORT_MARGIN = 8

const route = useRoute()
const router = useRouter()
const dismissed = ref(false)
const isFeedbackPage = computed(() => route.path === '/translation-feedback')
const widgetElement = ref<HTMLElement | null>(null)
const dragging = ref(false)
const suppressClick = ref(false)
const dock = ref<'left' | 'right' | null>(null)
const position = ref<{ x: number; y: number } | null>(null)

const dragState = {
  pointerId: -1,
  offsetX: 0,
  offsetY: 0,
  startX: 0,
  startY: 0,
}

const visible = computed(() => !dismissed.value && !isFeedbackPage.value)
const widgetClasses = computed(() => [
  dragging.value
    ? 'cursor-grabbing opacity-80 transition-none'
    : 'hover:border-[#c4b5fd] hover:bg-[#6d28d9]',
  dock.value === null ? 'rounded-full px-2 py-1.5 pl-3' : 'h-12 w-12 justify-center p-0',
  dock.value === 'left' ? 'rounded-r-full' : '',
  dock.value === 'right' ? 'rounded-l-full' : '',
])
const widgetStyle = computed(() => {
  if (!position.value) return undefined

  const top = `${position.value.y}px`
  if (dock.value === 'left') return { left: '0px', right: 'auto', top }
  if (dock.value === 'right') return { left: 'auto', right: '0px', top }
  return { left: `${position.value.x}px`, right: 'auto', top }
})

onMounted(() => window.addEventListener('resize', keepWidgetInViewport))

onBeforeUnmount(() => {
  window.removeEventListener('resize', keepWidgetInViewport)
  stopPointerTracking()
})

function openPage() {
  if (suppressClick.value) {
    suppressClick.value = false
    return
  }

  void router.push('/translation-feedback')
}

function dismiss() {
  dismissed.value = true
}

function startDrag(event: PointerEvent) {
  const target = event.target as Element | null
  if (event.button !== 0 || event.isPrimary === false || target?.closest('[data-widget-close]'))
    return

  const element = widgetElement.value
  if (!element) return

  const bounds = element.getBoundingClientRect()
  stopPointerTracking()
  dragState.pointerId = event.pointerId
  dragState.offsetX = event.clientX - bounds.left
  dragState.offsetY = event.clientY - bounds.top
  dragState.startX = event.clientX
  dragState.startY = event.clientY
  window.addEventListener('pointermove', moveDrag, { passive: false })
  window.addEventListener('pointerup', endDrag)
  window.addEventListener('pointercancel', endDrag)
}

function moveDrag(event: PointerEvent) {
  if (event.pointerId !== dragState.pointerId) return

  if (!dragging.value) {
    const distance = Math.hypot(event.clientX - dragState.startX, event.clientY - dragState.startY)
    if (distance < DRAG_THRESHOLD) return

    const element = widgetElement.value
    if (!element) return

    const bounds = element.getBoundingClientRect()
    position.value = { x: bounds.left, y: bounds.top }
    dock.value = null
    dragging.value = true
    suppressClick.value = true
  }

  const element = widgetElement.value
  if (!element) return

  event.preventDefault()
  const bounds = element.getBoundingClientRect()
  position.value = {
    x: clamp(event.clientX - dragState.offsetX, 0, window.innerWidth - bounds.width),
    y: clamp(
      event.clientY - dragState.offsetY,
      MIN_VIEWPORT_MARGIN,
      window.innerHeight - bounds.height - MIN_VIEWPORT_MARGIN,
    ),
  }
}

function endDrag(event: PointerEvent) {
  if (event.pointerId !== dragState.pointerId) return

  stopPointerTracking()
  if (dragging.value) {
    dragging.value = false
    snapToEdge()
    window.setTimeout(() => {
      suppressClick.value = false
    }, 0)
  } else {
    suppressClick.value = false
  }
  dragState.pointerId = -1
}

function snapToEdge() {
  const element = widgetElement.value
  if (!element || !position.value) return

  const bounds = element.getBoundingClientRect()
  if (position.value.x <= EDGE_DISTANCE) {
    dock.value = 'left'
  } else if (window.innerWidth - (position.value.x + bounds.width) <= EDGE_DISTANCE) {
    dock.value = 'right'
  }
}

function stopPointerTracking() {
  window.removeEventListener('pointermove', moveDrag)
  window.removeEventListener('pointerup', endDrag)
  window.removeEventListener('pointercancel', endDrag)
}

function keepWidgetInViewport() {
  if (!position.value || !widgetElement.value) return

  const bounds = widgetElement.value.getBoundingClientRect()
  position.value = {
    x: dock.value ? position.value.x : clamp(position.value.x, 0, window.innerWidth - bounds.width),
    y: clamp(
      position.value.y,
      MIN_VIEWPORT_MARGIN,
      window.innerHeight - bounds.height - MIN_VIEWPORT_MARGIN,
    ),
  }
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum))
}
</script>
