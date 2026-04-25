import { onBeforeUnmount, ref, type Ref } from 'vue'

interface LightboxImage {
  src: string
  title?: string
}

const getPreviewableImages = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLImageElement>('img[data-md-image-preview="true"]'),
  ).filter((img) => {
    if (!img.src) return false
    if (img.dataset.preview === 'false') return false
    return !img.closest('a[data-no-image-preview="true"]')
  })

export function useImagePreview(containerRef: Ref<HTMLElement | null>) {
  const visible = ref(false)
  const index = ref(0)
  const images = ref<LightboxImage[]>([])

  const openPreview = (target: HTMLImageElement) => {
    const container = containerRef.value

    if (!container) return

    const previewableImages = getPreviewableImages(container)
    const targetIndex = previewableImages.indexOf(target)

    if (targetIndex < 0) return

    images.value = previewableImages.map((img) => ({
      src: img.currentSrc || img.src,
      title: img.alt || undefined,
    }))
    index.value = targetIndex
    visible.value = true
  }

  const onContainerClick = (event: MouseEvent) => {
    const target = event.target

    if (!(target instanceof HTMLImageElement)) return
    if (!containerRef.value?.contains(target)) return

    event.preventDefault()
    openPreview(target)
  }

  const bindPreview = () => {
    containerRef.value?.addEventListener('click', onContainerClick)
  }

  const unbindPreview = () => {
    containerRef.value?.removeEventListener('click', onContainerClick)
  }

  const closePreview = () => {
    visible.value = false
  }

  const onVisibleChange = (value: boolean) => {
    visible.value = value
  }

  onBeforeUnmount(() => {
    unbindPreview()
  })

  return {
    bindPreview,
    closePreview,
    images,
    index,
    onVisibleChange,
    unbindPreview,
    visible,
  }
}
