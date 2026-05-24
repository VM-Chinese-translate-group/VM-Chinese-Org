const vmLogoIcon = '/imgs/logo/logo_64.png'

const downloadMethodIcons: Record<string, string> = {
  'baidu-drive': '/imgs/svg/baidu-drive.svg',
  curseforge: '/imgs/svg/curseforge.svg',
  'lanzou-quark-mapdl': vmLogoIcon,
  lanzou: '/imgs/svg/lanzou.svg',
  lazy: '/imgs/lazydl.png',
  mediafire: '/imgs/svg/mediafire.svg',
  'quark-lanzou': vmLogoIcon,
}

export const getDownloadMethodIcon = (id?: string) =>
  id ? downloadMethodIcons[id.toLowerCase()] : undefined
