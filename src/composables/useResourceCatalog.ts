import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { maps, modpacks } from 'virtual:resources'

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

  return {
    featuredMaps,
    featuredModpacks,
    statCards,
  }
}
