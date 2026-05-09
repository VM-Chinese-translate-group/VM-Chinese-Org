import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { maps, modpacks } from 'virtual:resources'
import type { ResourceBrowseCard, ResourceOverviewCard } from '@/types/resource'

const FEATURED_LIMIT = 3

export function useResourceCatalog() {
  const { t } = useI18n()

  const featuredModpacks = computed(() => modpacks.slice(0, FEATURED_LIMIT))
  const featuredMaps = computed(() => maps.slice(0, FEATURED_LIMIT))
  const maintainedCount = computed(
    () => modpacks.filter((item) => item.status?.type === 'maintaining').length,
  )

  const statCards = computed(() => [
    { value: String(modpacks.length), label: t('main.modpackCount') },
    { value: String(maps.length), label: t('main.mapCount') },
    { value: String(maintainedCount.value), label: t('main.maintainedCount') },
  ])

  const browseCards = computed<ResourceBrowseCard[]>(() => [
    {
      title: t('navbar.modpack'),
      description: t('main.modpackEntryDesc'),
      badge: t('main.modpackCountBadge', { total: modpacks.length }),
      icon: 'lucide:package',
      link: '/modpacks',
      value: String(modpacks.length),
    },
    {
      title: t('navbar.map'),
      description: t('main.mapEntryDesc'),
      badge: t('main.mapCountBadge', { total: maps.length }),
      icon: 'lucide:map',
      link: '/map',
      value: String(maps.length),
    },
    {
      title: t('navbar.tools'),
      description: t('main.toolsEntryDesc'),
      badge: t('main.toolsEntryBadge'),
      icon: 'lucide:hammer',
      link: '/tools',
      value: '',
    },
    {
      title: t('navbar.community'),
      description: t('main.communityEntryDesc'),
      badge: t('main.communityEntryBadge'),
      icon: 'lucide:messages-square',
      link: '/community',
      value: '',
    },
  ])

  const overviewCards = computed<ResourceOverviewCard[]>(() => [
    {
      title: t('navbar.modpack'),
      description: t('main.overviewModpacksDesc'),
      value: t('main.modpackCountBadge', { total: modpacks.length }),
      icon: 'lucide:package',
      link: '/modpacks',
    },
    {
      title: t('navbar.map'),
      description: t('main.overviewMapsDesc'),
      value: t('main.mapCountBadge', { total: maps.length }),
      icon: 'lucide:map',
      link: '/map',
    },
    {
      title: t('navbar.tools'),
      description: t('main.overviewToolsDesc'),
      value: '',
      icon: 'lucide:hammer',
      link: '/tools',
    },
  ])

  return {
    browseCards,
    featuredMaps,
    featuredModpacks,
    overviewCards,
    statCards,
  }
}
