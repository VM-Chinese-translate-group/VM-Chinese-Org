<template>
  <section class="site-announcement" :aria-label="$t('announcement.label')">
    <div class="site-announcement-inner">
      <span class="site-announcement-icon" aria-hidden="true">
        <Icon icon="lucide:megaphone" />
      </span>
      <p>
        <strong>{{ $t('announcement.title') }}</strong>
        <span>{{ $t('announcement.body') }}</span>
      </p>
      <RouterLink class="site-announcement-link" to="/modpacks/enigmatic-skies">
        {{ $t('announcement.action') }}
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
</script>

<style scoped>
.site-announcement {
  box-sizing: border-box;
  width: 100%;
  padding: 18px 0 0;
  background: transparent;
  overflow: hidden;
}

.site-announcement-inner {
  display: flex;
  align-items: center;
  gap: 14px;
  box-sizing: border-box;
  width: min(1320px, calc(100% - 40px));
  min-height: 56px;
  margin: 0 auto;
  padding: 10px 14px;
  border: 1px solid rgba(39, 112, 56, 0.14);
  border-radius: 8px;
  background: rgba(46, 125, 50, 0.06);
  color: #277038;
}

.site-announcement-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  border-radius: 8px;
  background: rgba(49, 130, 65, 0.1);
  font-size: 1.1rem;
}

.site-announcement p {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
  flex: 1;
  margin: 0;
  font-size: 0.96rem;
  font-weight: 700;
  line-height: 1.5;
}

.site-announcement-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 7px 14px;
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
  background: rgba(123, 216, 143, 0.08);
  color: #89e8bd;
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
