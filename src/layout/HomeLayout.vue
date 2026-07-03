<template>
  <main class="home-shell">
    <section class="hero">
      <div class="hero-backdrop">
        <img v-lazy="'/imgs/home.png'" class="hero-image" alt="Minecraft world background" />
      </div>

      <div class="hero-inner">
        <section class="hero-card hero-card-main">
          <img v-lazy="siteLogo" alt="VM Translation Group" class="hero-logo" />
          <div class="hero-copy">
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
          </div>

          <div class="hero-metrics" aria-label="site overview">
            <div class="hero-metric" v-for="item in statCards" :key="item.label">
              <span class="metric-value">{{ item.value }}</span>
              <span class="metric-label">{{ item.label }}</span>
            </div>
          </div>
        </section>

        <aside class="hero-card hero-rail">
          <div class="quick-grid">
            <RouterLink
              v-for="item in quickLinks"
              :key="item.link"
              :to="item.link"
              class="quick-card"
            >
              <span class="quick-icon">
                <Icon :icon="item.icon" />
              </span>
              <span class="quick-title">{{ item.title }}</span>
              <span class="quick-desc">{{ item.description }}</span>
            </RouterLink>
          </div>

          <div class="latest-box">
            <div class="latest-header">
              <span class="section-kicker">{{ $t('main.featuredModpacksLabel') }}</span>
              <RouterLink to="/modpacks" class="latest-more">
                {{ $t('main.viewAllModpacks') }}
                <Icon icon="lucide:arrow-up-right" />
              </RouterLink>
            </div>

            <RouterLink
              v-for="item in featuredModpacks"
              :key="item.link"
              :to="item.link"
              class="latest-item"
            >
              <img v-lazy="item.icon || '/imgs/missing.png'" :alt="item.name" />
              <span>
                <strong>{{ item.name }}</strong>
                <small>
                  {{ formatUpdateDate(item.displayDate, locale) || $t('main.unknownDate') }}
                </small>
              </span>
            </RouterLink>
          </div>
        </aside>
      </div>
    </section>

    <section class="catalog-section">
      <div class="catalog-column">
        <div class="section-heading compact">
          <span class="section-kicker">{{ $t('main.featuredModpacksLabel') }}</span>
          <h2>{{ $t('main.featuredModpacks') }}</h2>
        </div>

        <RouterLink
          v-for="item in featuredModpacks"
          :key="item.link"
          :to="item.link"
          class="catalog-card"
        >
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
                {{ formatUpdateDate(item.displayDate, locale) || $t('main.unknownDate') }}
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

        <RouterLink
          v-for="item in featuredMaps"
          :key="item.link"
          :to="item.link"
          class="catalog-card"
        >
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
                {{ formatUpdateDate(item.displayDate, locale) || $t('main.unknownDate') }}
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

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useResourceCatalog } from '@/composables/useResourceCatalog'
import type { ResourceStatusType } from '@/types/resource'
import { getAprilFoolsLogoPath } from '@/utils/aprilFools'
import { formatUpdateDate } from '@/utils/dateFormat'

const { locale, t } = useI18n()
const { featuredMaps, featuredModpacks, statCards } = useResourceCatalog()
const siteLogo = getAprilFoolsLogoPath('long')

const quickLinks = computed(() => [
  {
    title: t('navbar.modpack'),
    description: t('main.quickModpacksDesc'),
    icon: 'lucide:package',
    link: '/modpacks',
  },
  {
    title: t('navbar.map'),
    description: t('main.quickMapsDesc'),
    icon: 'lucide:map',
    link: '/map',
  },
  {
    title: t('navbar.tools'),
    description: t('main.quickToolsDesc'),
    icon: 'lucide:wrench',
    link: '/tools',
  },
  {
    title: t('navbar.community'),
    description: t('main.quickCommunityDesc'),
    icon: 'lucide:messages-square',
    link: '/community',
  },
])

const infoItems = [
  { title: 'main.qualityTitle', desc: 'main.qualityDesc', icon: 'lucide:badge-check' },
  { title: 'main.teamTitle', desc: 'main.teamDesc', icon: 'lucide:users' },
  { title: 'main.copyrightTitle', desc: 'main.copyrightDesc', icon: 'lucide:shield-check' },
  { title: 'main.techTitle', desc: 'main.techDesc', icon: 'lucide:wrench' },
]

const getStatusText = (statusType?: ResourceStatusType) => {
  if (!statusType) return ''
  return t(`pack.status.${statusType}`)
}
</script>

<style scoped>
@import '@/styles/Home.css';
</style>
