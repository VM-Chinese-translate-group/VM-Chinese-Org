<template>
  <div
    v-if="visible"
    ref="widgetElement"
    class="feedback-widget group"
    :class="widgetClasses"
    :style="widgetStyle"
    @pointerdown="startDrag"
  >
    <button
      class="feedback-widget-main"
      :class="{ 'feedback-widget-docked-main': dock !== null }"
      type="button"
      :aria-label="$t('translationFeedback.widgetLabel')"
      @click="openPage"
    >
      <Icon
        class="text-[1.2rem] text-white"
        icon="lucide:message-heart"
        aria-hidden="true"
      />
      <span v-if="dock === null">{{ $t('translationFeedback.widgetLabel') }}</span>
    </button>
    <button
      v-if="dock === null"
      class="feedback-widget-close"
      type="button"
      :aria-label="$t('translationFeedback.dismiss')"
      @click="dismiss"
    >
      <Icon icon="lucide:x" aria-hidden="true" />
    </button>
    <span class="feedback-widget-tooltip" role="tooltip">
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
const widgetClasses = computed(() => ({
  'feedback-widget-dragging': dragging.value,
  'feedback-widget-hoverable': !dragging.value && dock.value === null,
  'feedback-widget-docked': dock.value !== null,
  'feedback-widget-docked-hoverable': !dragging.value && dock.value !== null,
  'feedback-widget-docked-left': dock.value === 'left',
  'feedback-widget-docked-right': dock.value === 'right',
}))
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
  if (event.button !== 0 || event.isPrimary === false || target?.closest('.feedback-widget-close'))
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
