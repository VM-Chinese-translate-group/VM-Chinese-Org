import { onScopeDispose } from 'vue'

const activeLocks = new Set<symbol>()
let originalBodyOverflow = ''
let originalDocumentOverflow = ''

function applyScrollLock() {
  if (typeof document === 'undefined') return

  originalBodyOverflow = document.body.style.overflow
  originalDocumentOverflow = document.documentElement.style.overflow
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
}

function restoreScroll() {
  if (typeof document === 'undefined') return

  document.body.style.overflow = originalBodyOverflow
  document.documentElement.style.overflow = originalDocumentOverflow
}

export function usePageScrollLock() {
  const lockId = Symbol('page-scroll-lock')

  const lock = () => {
    if (activeLocks.has(lockId)) return
    if (activeLocks.size === 0) applyScrollLock()
    activeLocks.add(lockId)
  }

  const unlock = () => {
    if (!activeLocks.delete(lockId)) return
    if (activeLocks.size === 0) restoreScroll()
  }

  onScopeDispose(unlock)

  return { lock, unlock }
}
