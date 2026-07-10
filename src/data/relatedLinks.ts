export interface RelatedLinkInput {
  id: string
  text?: string
  link?: string
  project?: number | string
}

export interface RelatedLink {
  id: string
  text: string
  link: string
  icon?: string
}

interface SharedRelatedLink {
  text?: string
  textKey?: string
  link?: string
  getLink?: (item: RelatedLinkInput) => string
  icon?: string
}

const relatedLinkIcons: Record<string, string> = {
  bilibili: '/imgs/svg/bilibili.svg',
  curseforge: '/imgs/svg/curseforge.svg',
  github: '/imgs/svg/github.svg',
  paratranz: '/imgs/svg/paratranz.svg',
  modrinth: '/imgs/svg/modrinth.svg',
}

export const sharedRelatedLinks: Record<string, SharedRelatedLink> = {
  i18n: {
    textKey: 'pack.links.i18n',
    link: 'https://cdn.modrinth.com/data/PWERr14M/versions/4ihDUjWs/I18nUpdateMod-3.7.0-all.jar',
    icon: relatedLinkIcons.modrinth,
  },
  paratranz: {
    text: 'Paratranz',
    getLink: (item) => (item.project ? `https://paratranz.cn/projects/${item.project}` : ''),
    icon: relatedLinkIcons.paratranz,
  },
}

export const resolveRelatedLink = (
  item: RelatedLinkInput,
  translate: (key: string) => string,
): RelatedLink => {
  const id = item.id?.toLowerCase()
  const sharedLink = sharedRelatedLinks[id]

  return {
    id,
    text:
      item.text || sharedLink?.text || (sharedLink?.textKey ? translate(sharedLink.textKey) : ''),
    link: item.link || sharedLink?.getLink?.(item) || sharedLink?.link || '',
    icon: sharedLink?.icon || relatedLinkIcons[id],
  }
}
