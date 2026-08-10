<template>
  <span
    :id="id"
    class="feedback-widget-bubble"
    :class="visible ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-1 opacity-0'"
    role="tooltip"
    aria-live="polite"
    :aria-hidden="!visible"
  >
    <svg
      class="feedback-widget-bubble-shape"
      viewBox="0 0 240 96"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M14 3H226C232.6 3 237 7.4 237 14V58C237 64.6 232.6 69 226 69H209L198 92L187 69H14C7.4 69 3 64.6 3 58V14C3 7.4 7.4 3 14 3Z"
        fill="var(--bg-white)"
        stroke="var(--text-dark)"
        stroke-linejoin="round"
        stroke-linecap="round"
        stroke-width="3"
        vector-effect="non-scaling-stroke"
      />
    </svg>
    <span class="feedback-widget-bubble-text">{{ text }}</span>
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    id?: string
    text: string
    visible: boolean
  }>(),
  {
    id: 'translation-feedback-widget-bubble',
  },
)
</script>
