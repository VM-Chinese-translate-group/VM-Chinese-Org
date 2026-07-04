<template>
  <section
    class="site-announcement"
    :class="{ 'is-home': isHomePage }"
    :aria-label="$t('announcement.label')"
  >
    <div class="site-announcement-inner">
      <span class="site-announcement-icon" aria-hidden="true">
        <Icon icon="lucide:megaphone" />
      </span>
      <p>
        <span>{{ $t('announcement.body') }}</span>
      </p>
      <RouterLink class="site-announcement-link" to="/modpacks/enigmatic-skies">
        {{ $t('announcement.action') }}
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'

const route = useRoute()
const isHomePage = computed(() => route.path === '/')
</script>

<style scoped>
.site-announcement {
  box-sizing: border-box;
  width: 100%;
  padding: 12px 0 0;
  background: transparent;
  overflow: hidden;
}

.site-announcement.is-home {
  background: radial-gradient(circle at 12% 0%, rgba(57, 132, 68, 0.1), transparent 26%), #eef3f2;
}

.site-announcement-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  box-sizing: border-box;
  width: min(1320px, calc(100% - 40px));
  min-height: 44px;
  margin: 0 auto;
  padding: 7px 12px;
  border: 1px solid rgba(39, 112, 56, 0.12);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  color: #277038;
}

.site-announcement-icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  border-radius: 8px;
  background: rgba(49, 130, 65, 0.1);
  font-size: 1rem;
}

.site-announcement p {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
  flex: 1;
  margin: 0;
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.35;
}

.site-announcement-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  padding: 5px 12px;
  border: 1px solid rgba(39, 112, 56, 0.18);
  border-radius: 8px;
  background: rgba(46, 125, 50, 0.1);
  color: #277038;
  font-size: 0.86rem;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
}

.dark .site-announcement-inner {
  background: rgba(24, 30, 34, 0.78);
  color: #89e8bd;
}

.dark .site-announcement.is-home {
  background: #101417;
}

.dark .site-announcement-link {
  color: #89e8bd;
}

@media (max-width: 720px) {
  .site-announcement {
    padding-top: 12px;
  }

  .site-announcement-inner {
    align-items: flex-start;
    width: calc(100% - 20px);
    gap: 10px;
    flex-wrap: wrap;
  }

  .site-announcement p {
    font-size: 0.88rem;
  }

  .site-announcement-link {
    width: 100%;
  }
}
</style>
