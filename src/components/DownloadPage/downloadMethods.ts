import type { InjectionKey } from 'vue'

import { getDownloadMethodIcon } from '@/data/downloadMethodIcons'

export interface DownloadMethodSource {
  icon?: string
  id?: string
  lanzouLink?: string
  lazyLink?: string
  link?: string
  quarkLink?: string
  subText?: string
  text?: string
}

export interface DownloadMethodItem {
  icon?: string
  id?: string
  lanzouLink?: string
  lazyLink?: string
  link?: string
  name?: string
  quarkLink?: string
  secondary?: string
  target?: string
}

export const DOWNLOAD_METHODS_REGISTRAR: InjectionKey<(methods: DownloadMethodItem[]) => void> =
  Symbol('download-methods-registrar')

function clientLink(method: DownloadMethodSource): DownloadMethodItem {
  const id = method.id?.toLowerCase()

  return {
    id: method.id,
    name: method.text || (id === 'lazy' ? '懒汉下载' : ''),
    secondary: method.subText || '',
    icon: method.icon || getDownloadMethodIcon(method.id),
    link: method.link,
    lazyLink: method.lazyLink,
    lanzouLink: method.lanzouLink,
    quarkLink: method.quarkLink,
    target: method.link && method.link.startsWith('http') ? '_blank' : '_self',
  }
}

function mergeLazyDownload(methods: DownloadMethodSource[]) {
  const lazyMethod = methods.find((method) => method.id === 'lazy' && method.link)
  const hasDriveChooser = methods.some((method) => {
    const id = method.id?.toLowerCase()
    return id === 'quark-lanzou' || id === 'lanzou-quake'
  })

  return methods
    .filter((method) => !(hasDriveChooser && method.id === 'lazy'))
    .map((method) => {
      const id = method.id?.toLowerCase()
      if (!lazyMethod || (id !== 'quark-lanzou' && id !== 'lanzou-quake')) return method

      return {
        ...method,
        lazyLink: lazyMethod.link,
      }
    })
}

export function getPageDownloadMethods(methods: DownloadMethodSource[]) {
  return mergeLazyDownload(methods).map((method) => clientLink(method))
}
