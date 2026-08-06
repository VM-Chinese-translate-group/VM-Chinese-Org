<template>
  <Teleport to="body">
    <Transition name="download-choice-fade">
      <div v-if="visible" class="download-choice-backdrop" role="presentation" @click.self="close">
        <section
          ref="dialogRef"
          class="download-choice-dialog"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
        >
          <header class="download-choice-header">
            <div>
              <h2 :id="titleId">{{ t('downloadModal.resourceTitle') }}</h2>
              <p>{{ t('downloadModal.resourceIntro') }}</p>
            </div>
            <button
              ref="closeButtonRef"
              type="button"
              class="download-choice-close"
              :aria-label="t('downloadModal.close')"
              @click="close"
            >
              <Icon icon="lucide:x" />
            </button>
          </header>

          <DownloadMethodGrid :items="items" @select="select" />
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import DownloadMethodGrid from './DownloadMethodGrid.vue'
import type { DownloadMethodItem } from './downloadMethods'
import { usePageScrollLock } from '@/composables/usePageScrollLock'

const props = defineProps<{
  items: DownloadMethodItem[]
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  select: [item: DownloadMethodItem]
}>()

const { t } = useI18n()
const { lock, unlock } = usePageScrollLock()
const dialogRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLButtonElement | null>(null)
const titleId = 'download-choice-title'

const close = () => emit('close')

const select = (item: DownloadMethodItem) => {
  emit('select', item)
  close()
}

const onKeydown = (event: KeyboardEvent) => {
  if (!props.visible) return
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
  }
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      lock()
      nextTick(() => closeButtonRef.value?.focus())
    } else {
      unlock()
    }
  },
  { immediate: true },
)

onMounted(() => window.addEventListener('keydown', onKeydown))

onBeforeUnmount(() => {
  unlock()
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.download-choice-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2100;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.58);
  backdrop-filter: blur(4px);
}

.download-choice-dialog {
  width: min(560px, 100%);
  max-height: min(720px, calc(100vh - 40px));
  overflow-y: auto;
  padding: 24px;
  border: 1px solid var(--switcher-border);
  border-radius: 16px;
  background: var(--bg-white);
  box-shadow: var(--card-shadow);
}

.download-choice-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.download-choice-header h2 {
  margin: 0;
  color: var(--text-dark);
  font-size: 1.3rem;
}

.download-choice-header p {
  margin: 8px 0 0;
  color: var(--text-medium);
  line-height: 1.55;
}

.download-choice-close {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--switcher-border);
  border-radius: 8px;
  background: var(--bg-soft);
  color: var(--text-dark);
  cursor: pointer;
}

.download-choice-close:hover,
.download-choice-close:focus-visible {
  border-color: var(--btn-primary-bg);
  color: var(--btn-primary-bg);
}

.download-choice-fade-enter-active,
.download-choice-fade-leave-active {
  transition: opacity 0.18s ease;
}

.download-choice-fade-enter-from,
.download-choice-fade-leave-to {
  opacity: 0;
}

@media (max-width: 520px) {
  .download-choice-dialog {
    padding: 20px 14px;
  }
}
</style>
