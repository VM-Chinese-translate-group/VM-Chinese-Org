<template>
  <main class="home-shell">
    <section class="hero">
      <div class="hero-backdrop">
        <img v-lazy="'/imgs/home.png'" class="hero-image" alt="Minecraft world background" />
      </div>

      <div class="hero-inner">
        <div class="hero-copy">
          <img v-lazy="siteLogo" alt="VM Translation Group" class="hero-logo" />
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
        <RouterLink
          v-for="item in browseCards"
          :key="item.title"
          :to="item.link"
          class="browse-card"
        >
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

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useResourceCatalog } from '@/composables/useResourceCatalog'
import type { ResourceStatusType } from '@/types/resource'
import { getAprilFoolsLogoPath } from '@/utils/aprilFools'

const { t } = useI18n()
const { browseCards, featuredMaps, featuredModpacks, overviewCards, statCards } =
  useResourceCatalog()
const siteLogo = getAprilFoolsLogoPath('long')

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
