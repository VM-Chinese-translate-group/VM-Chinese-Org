<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="logo-section">
        <img class="logo-icon" src="/imgs/logo/logo_long.png" />
        <p class="copyright">{{ $t('footer.copyright') }}</p>
        <p class="build-info">
          {{ $t('footer.buildInfo', { branch: branchName }) }}@<a
            :href="`https://github.com/${repoPath}/commit/${commitId}`"
            target="_blank"
            class="commit-link"
            >{{ commitId }}</a
          >
        </p>
      </div>

      <div class="links-section">
        <div class="column">
          <h3 class="column-title">{{ $t('footer.about') }}</h3>
          <ul class="link-list">
            <li>
              <a href="join" class="link">{{ $t('footer.joinUs') }}</a>
            </li>
            <li>
              <a href="support-us" class="link">{{ $t('footer.supportUs') }}</a>
            </li>
            <li>
              <a href="friends-links" class="link">{{ $t('footer.friendsLinks') }}</a>
            </li>
          </ul>
        </div>
        <div class="column">
          <h3 class="column-title">{{ $t('footer.policy') }}</h3>
          <ul class="link-list">
            <li>
              <a href="privacy" class="link">{{ $t('footer.privacy') }}</a>
            </li>
            <li>
              <a href="agreement" class="link">{{ $t('footer.agreement') }}</a>
            </li>
          </ul>
        </div>
        <div class="column">
          <h3 class="column-title">{{ $t('footer.products') }}</h3>
          <ul class="link-list">
            <li>
              <a href="modpacks" class="link">{{ $t('footer.modpacks') }}</a>
            </li>
            <li>
              <a href="map" class="link">{{ $t('footer.maps') }}</a>
            </li>
            <li>
              <a href="vmtu" class="link">{{ $t('footer.vmtu') }}</a>
            </li>
            <li>
              <a href="tools" class="link">{{ $t('footer.tools') }}</a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="bottom-note">
      <p>{{ $t('footer.disclaimer') }}</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const commitId = import.meta.env.VITE_GIT_COMMIT || 'Unknown'
const branchName = import.meta.env.VITE_GIT_BRANCH || 'Unknown'
const repoPath = import.meta.env.VITE_GIT_REPO || 'VM-Chinese-translate-group/VM-Chinese-Org'

useI18n()
</script>

<style scoped>
@import '@/styles/Footer.css';
</style>
