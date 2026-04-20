<template>
  <main class="home-shell">
    <section class="hero">
      <div class="hero-backdrop">
        <img v-lazy="'/imgs/home.png'" class="hero-image" alt="Minecraft world background" />
        <div class="hero-glow hero-glow-left"></div>
        <div class="hero-glow hero-glow-right"></div>
      </div>

      <div class="hero-inner">
        <div class="hero-copy">
          <img v-lazy="'/imgs/logo/logo_long.png'" alt="VM Translation Group" class="hero-logo" />
          <h1 class="hero-title">{{ $t('main.headline') }}</h1>
          <p class="hero-description">{{ $t('main.subheadline') }}</p>

          <div class="hero-actions">
            <RouterLink to="/modpacks" class="hero-button hero-button-primary">
              <Icon icon="lucide:package" />
              {{ $t('main.modpackBtn') }}
            </RouterLink>
            <RouterLink to="/map" class="hero-button hero-button-secondary">
              <Icon icon="lucide:map" />
              {{ $t('main.mapBtn') }}
            </RouterLink>
          </div>

          <div class="hero-stats">
            <div class="stat-card" v-for="item in statCards" :key="item.label">
              <span class="stat-value">{{ item.value }}</span>
              <span class="stat-label">{{ item.label }}</span>
            </div>
          </div>
        </div>

        <div class="hero-panel">
          <div class="spotlight-card">
            <div class="spotlight-header">
              <div>
                <span class="section-kicker">{{ $t('main.overviewLabel') }}</span>
                <h2>{{ $t('main.overviewTitle') }}</h2>
              </div>
            </div>

            <RouterLink
              v-for="item in overviewCards"
              :key="item.link"
              :to="item.link"
              class="spotlight-item"
            >
              <div class="overview-icon">
                <Icon :icon="item.icon" />
              </div>
              <div class="spotlight-meta">
                <div class="spotlight-name">{{ item.title }}</div>
                <div class="spotlight-desc">{{ item.description }}</div>
              </div>
              <div class="spotlight-side">
                <span class="overview-value">{{ item.value }}</span>
              </div>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <section class="browse-section">
      <div class="section-heading">
        <span class="section-kicker">{{ $t('main.exploreLabel') }}</span>
        <h2>{{ $t('main.exploreTitle') }}</h2>
        <p>{{ $t('main.exploreDesc') }}</p>
      </div>

      <div class="browse-grid">
        <RouterLink v-for="item in browseCards" :key="item.title" :to="item.link" class="browse-card">
          <div class="browse-icon">
            <Icon :icon="item.icon" />
          </div>
          <div class="browse-body">
            <div class="browse-title-row">
              <h3>{{ item.title }}</h3>
              <span class="browse-badge">{{ item.badge }}</span>
            </div>
            <p>{{ item.description }}</p>
          </div>
          <Icon icon="lucide:arrow-up-right" class="browse-arrow" />
        </RouterLink>
      </div>
    </section>

    <section class="catalog-section">
      <div class="catalog-column">
        <div class="section-heading compact">
          <span class="section-kicker">{{ $t('main.featuredModpacksLabel') }}</span>
          <h2>{{ $t('main.featuredModpacks') }}</h2>
        </div>

        <RouterLink v-for="item in featuredModpacks" :key="item.link" :to="item.link" class="catalog-card">
          <img v-lazy="item.icon || '/imgs/missing.png'" :alt="item.name" class="catalog-icon" />
          <div class="catalog-meta">
            <div class="catalog-topline">
              <h3>{{ item.name }}</h3>
              <span v-if="item.status?.type" :class="['status-badge', item.status.type]">
                {{ getStatusText(item.status?.type) }}
              </span>
            </div>
            <p>{{ item.description || $t('main.emptyDescription') }}</p>
            <div class="catalog-footer">
              <span>
                <Icon icon="lucide:calendar-days" />
                {{ item.displayDate || $t('main.unknownDate') }}
              </span>
              <span v-if="item.author">
                <Icon icon="lucide:user-round" />
                {{ item.author }}
              </span>
            </div>
          </div>
        </RouterLink>
      </div>

      <div class="catalog-column">
        <div class="section-heading compact">
          <span class="section-kicker">{{ $t('main.featuredMapsLabel') }}</span>
          <h2>{{ $t('main.featuredMaps') }}</h2>
        </div>

        <RouterLink v-for="item in featuredMaps" :key="item.link" :to="item.link" class="catalog-card">
          <img v-lazy="item.icon || '/imgs/missing.png'" :alt="item.name" class="catalog-icon" />
          <div class="catalog-meta">
            <div class="catalog-topline">
              <h3>{{ item.name }}</h3>
              <span v-if="item.status?.type" :class="['status-badge', item.status.type]">
                {{ getStatusText(item.status?.type) }}
              </span>
            </div>
            <p>{{ item.description || $t('main.emptyDescription') }}</p>
            <div class="catalog-footer">
              <span>
                <Icon icon="lucide:calendar-days" />
                {{ item.displayDate || $t('main.unknownDate') }}
              </span>
              <span v-if="item.author">
                <Icon icon="lucide:user-round" />
                {{ item.author }}
              </span>
            </div>
          </div>
        </RouterLink>
      </div>
    </section>

    <section class="values-section">
      <div class="section-heading">
        <span class="section-kicker">{{ $t('main.valuesLabel') }}</span>
        <h2>{{ $t('main.valuesTitle') }}</h2>
        <p>{{ $t('main.valuesDesc') }}</p>
      </div>

      <div class="values-grid">
        <article class="value-card" v-for="item in infoItems" :key="item.title">
          <div class="value-icon">
            <Icon :icon="item.icon" />
          </div>
          <h3>{{ $t(item.title) }}</h3>
          <p>{{ $t(item.desc) }}</p>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { maps, modpacks } from 'virtual:resources'

const { t } = useI18n()

const infoItems = [
  { title: 'main.qualityTitle', desc: 'main.qualityDesc', icon: 'lucide:badge-check' },
  { title: 'main.teamTitle', desc: 'main.teamDesc', icon: 'lucide:users' },
  { title: 'main.copyrightTitle', desc: 'main.copyrightDesc', icon: 'lucide:shield-check' },
  { title: 'main.techTitle', desc: 'main.techDesc', icon: 'lucide:wrench' },
]

const featuredModpacks = computed(() => modpacks.slice(0, 3))
const featuredMaps = computed(() => maps.slice(0, 3))

const maintainedCount = computed(
  () => modpacks.filter((item) => item.status?.type === 'maintaining').length,
)

const statCards = computed(() => [
  { value: String(modpacks.length), label: t('main.modpackCount') },
  { value: String(maps.length), label: t('main.mapCount') },
  { value: String(maintainedCount.value), label: t('main.maintainedCount') },
])

const browseCards = computed(() => [
  {
    title: t('navbar.modpack'),
    description: t('main.modpackEntryDesc'),
    badge: t('main.modpackCountBadge', { total: modpacks.length }),
    icon: 'lucide:package',
    link: '/modpacks',
  },
  {
    title: t('navbar.map'),
    description: t('main.mapEntryDesc'),
    badge: t('main.mapCountBadge', { total: maps.length }),
    icon: 'lucide:map',
    link: '/map',
  },
  {
    title: t('navbar.tools'),
    description: t('main.toolsEntryDesc'),
    badge: t('main.toolsEntryBadge'),
    icon: 'lucide:hammer',
    link: '/tools',
  },
  {
    title: t('navbar.community'),
    description: t('main.communityEntryDesc'),
    badge: t('main.communityEntryBadge'),
    icon: 'lucide:messages-square',
    link: '/community',
  },
])

const overviewCards = computed(() => [
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

const getStatusText = (statusType) => {
  if (!statusType) return ''
  return t(`pack.status.${statusType}`)
}
</script>

<style scoped>
@import '@/styles/Home.css';
</style>
