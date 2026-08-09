<template>
  <div
    v-if="visible"
    ref="widgetElement"
    class="group fixed bottom-[max(2rem,env(safe-area-inset-bottom))] right-[max(4rem,env(safe-area-inset-right))] z-30 h-14 w-14 cursor-grab touch-none select-none text-white shadow-[var(--vp-shadow-1)] transition-[box-shadow,opacity] hover:shadow-lg lt-sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] lt-sm:right-[max(2.5rem,env(safe-area-inset-right))]"
    :class="dragging ? 'cursor-grabbing opacity-80 transition-none' : ''"
    :style="widgetStyle"
    @pointerdown="startDrag"
  >
    <button
      class="block h-full w-full cursor-pointer overflow-hidden border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-[var(--info-1)] focus-visible:outline-offset-2"
      type="button"
      :aria-label="$t('translationFeedback.widgetLabel')"
      @click="openPage"
    >
      <img
        class="h-full w-full object-cover [image-rendering:pixelated]"
        src="/imgs/wulian.png"
        alt=""
        draggable="false"
      />
    </button>
    <span
      class="pointer-events-none absolute bottom-[calc(100%+0.5rem)] left-1/2 z-40 w-max max-w-[min(18rem,calc(100vw_-_2rem))] -translate-x-1/2 rounded-lg border border-white/20 bg-[color-mix(in_srgb,var(--text-dark)_92%,transparent)] px-3 py-2 text-xs font-500 leading-snug text-white shadow-[var(--vp-shadow-1)] transition-opacity"
      :class="
        showIntro
          ? 'visible opacity-100'
          : 'invisible opacity-0 group-hover:visible group-hover:opacity-100'
      "
      role="tooltip"
    >
      {{ $t('translationFeedback.widgetLabel') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const DRAG_THRESHOLD = 5
const MIN_VIEWPORT_MARGIN = 8

const route = useRoute()
const router = useRouter()
const isFeedbackPage = computed(() => route.path === '/translation-feedback')
const widgetElement = ref<HTMLElement | null>(null)
const dragging = ref(false)
const suppressClick = ref(false)
const showIntro = ref(false)
const position = ref<{ x: number; y: number } | null>(null)
let introTimer: number | undefined

const dragState = {
  pointerId: -1,
  offsetX: 0,
  offsetY: 0,
  startX: 0,
  startY: 0,
}

const visible = computed(() => !isFeedbackPage.value)
const widgetStyle = computed(() => {
  if (!position.value) return undefined

  return { left: `${position.value.x}px`, right: 'auto', top: `${position.value.y}px` }
})

onMounted(() => {
  window.addEventListener('resize', keepWidgetInViewport)
  showIntro.value = true
  introTimer = window.setTimeout(() => {
    showIntro.value = false
  }, 3500)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', keepWidgetInViewport)
  if (introTimer !== undefined) window.clearTimeout(introTimer)
  stopPointerTracking()
})

function openPage() {
  if (suppressClick.value) {
    suppressClick.value = false
    return
  }

  void router.push('/translation-feedback')
}

function startDrag(event: PointerEvent) {
  if (event.button !== 0 || event.isPrimary === false) return

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
    dragging.value = true
    suppressClick.value = true
  }

  const element = widgetElement.value
  if (!element) return

  event.preventDefault()
  const bounds = element.getBoundingClientRect()
  position.value = {
    x: clamp(
      event.clientX - dragState.offsetX,
      MIN_VIEWPORT_MARGIN,
      window.innerWidth - bounds.width - MIN_VIEWPORT_MARGIN,
    ),
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
    window.setTimeout(() => {
      suppressClick.value = false
    }, 0)
  } else {
    suppressClick.value = false
  }
  dragState.pointerId = -1
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
    x: clamp(
      position.value.x,
      MIN_VIEWPORT_MARGIN,
      window.innerWidth - bounds.width - MIN_VIEWPORT_MARGIN,
    ),
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
