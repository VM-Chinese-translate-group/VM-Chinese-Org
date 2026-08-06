import type { AvailableLocales } from '@/plugins/i18n'
import { convertInlineText } from '@/utils/zhconv'

const loadingLabels = {
  'zh-CN': '图片加载中…',
  'en-US': 'Loading image…',
} as const

let labelRequestId = 0

export async function syncImageLoadingLabel(locale: AvailableLocales) {
  const requestId = ++labelRequestId
  const source = locale === 'en-US' ? loadingLabels['en-US'] : loadingLabels['zh-CN']
  const label = await convertInlineText(source, locale)

  if (requestId !== labelRequestId) return
  document.documentElement.style.setProperty('--image-loading-label', JSON.stringify(label))
}

function getLoadingFrame(image: HTMLImageElement) {
  const frame = image.parentElement
  return frame?.classList.contains('image-loading-frame') ? frame : null
}

function syncLoadingFrame(frame: Element, failed = false) {
  const image = frame.querySelector<HTMLImageElement>(':scope > img')

  if (!image) return

  const lazyState = image.getAttribute('lazy')
  const hasFinishedLazyLoading = lazyState === 'loaded' || lazyState === 'error'
  const isWaitingForLazySource =
    Boolean(image.dataset.src) &&
    (lazyState === 'loading' || (image.currentSrc || image.src).startsWith('data:image/'))
  const hasFinishedDirectLoading =
    !isWaitingForLazySource && image.complete && image.naturalWidth > 0

  frame.classList.toggle(
    'is-image-loaded',
    failed || hasFinishedLazyLoading || hasFinishedDirectLoading,
  )
}

function syncAddedFrames(node: Node) {
  if (!(node instanceof Element)) return

  if (node.classList.contains('image-loading-frame')) syncLoadingFrame(node)
  node.querySelectorAll('.image-loading-frame').forEach((frame) => syncLoadingFrame(frame))
}

let imageLoadingStarted = false

export function startImageLoadingFrames() {
  if (imageLoadingStarted) return
  imageLoadingStarted = true

  document.querySelectorAll('.image-loading-frame').forEach((frame) => syncLoadingFrame(frame))

  document.addEventListener(
    'load',
    (event) => {
      if (!(event.target instanceof HTMLImageElement)) return

      const frame = getLoadingFrame(event.target)
      if (frame) queueMicrotask(() => syncLoadingFrame(frame))
    },
    true,
  )

  document.addEventListener(
    'error',
    (event) => {
      if (!(event.target instanceof HTMLImageElement)) return

      const frame = getLoadingFrame(event.target)
      if (frame) syncLoadingFrame(frame, true)
    },
    true,
  )

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.target instanceof HTMLImageElement) {
        const frame = getLoadingFrame(mutation.target)
        if (frame) syncLoadingFrame(frame)
        return
      }

      mutation.addedNodes.forEach(syncAddedFrames)
    })
  })

  observer.observe(document.documentElement, {
    attributeFilter: ['data-src', 'lazy', 'src'],
    attributes: true,
    childList: true,
    subtree: true,
  })
}
