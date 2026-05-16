export const loaderIconMap: Record<string, string> = {
  neoforge: '/imgs/svg/neoforge.svg',
  fabric: '/imgs/svg/fabric.svg',
  forge: '/imgs/svg/forge.svg',
  vanilla: '/imgs/svg/vanilla.svg',
}

export const getLoaderIcon = (loader?: string) => {
  if (!loader) return ''
  return loaderIconMap[loader.toLowerCase()] || ''
}

export const getLoaderClass = (loader?: string) => {
  if (!loader) return ''
  return `loader-${loader.toLowerCase()}`
}
