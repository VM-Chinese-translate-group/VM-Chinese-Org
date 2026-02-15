<template>
  <div>
    <h2>{{ $t('supportUs.supportTitle') }}</h2>

    <p>
      {{ $t('supportUs.supportParagraph1') }}
    </p>

    <p>
      <i18n-t keypath="supportUs.supportParagraph2">
        <template #afd>
          <a href="https://afdian.com" target="_blank">
            {{ $t('supportUs.afdText') }}
          </a>
        </template>
      </i18n-t>
    </p>

    <h2>{{ $t('supportUs.joinTitle') }}</h2>

    <p>
      <i18n-t keypath="supportUs.joinParagraph1">
        <template #community>
          <a :href="communityLink" target="_blank">
            {{ $t('supportUs.communityText') }}
          </a>
        </template>
      </i18n-t>
    </p>

    <p>
      <i18n-t keypath="supportUs.joinParagraph2">
        <template #review>
          <router-link to="/join">
            {{ $t('supportUs.reviewText') }}
          </router-link>
        </template>
      </i18n-t>
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const communityLink = computed(() => {
  if (locale.value === 'zh-CN') {
    return 'https://qm.qq.com/q/zfY3xUJ2YS'
  }
  return 'https://discord.com/invite/SvJM5d9S98'
})
</script>
