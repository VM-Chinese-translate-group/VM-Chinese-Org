import { onBeforeUnmount, ref, watch, type Ref } from 'vue'

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
  let boundContainer: HTMLElement | null = null

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
    if (!boundContainer?.contains(target)) return

    event.preventDefault()
    openPreview(target)
  }

  const bindPreview = (container: HTMLElement | null) => {
    if (container === boundContainer) return

    boundContainer?.removeEventListener('click', onContainerClick)
    boundContainer = container
    boundContainer?.addEventListener('click', onContainerClick)
  }

  const closePreview = () => {
    visible.value = false
  }

  const onVisibleChange = (value: boolean) => {
    visible.value = value
  }

  watch(containerRef, bindPreview, { flush: 'post' })

  onBeforeUnmount(() => bindPreview(null))

  return {
    closePreview,
    images,
    index,
    onVisibleChange,
    visible,
  }
}
