<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="logo-section">
        <img class="logo-icon" src="/favicon.ico" />
        <span class="logo-text">VM汉化组官网 v4</span>
        <p class="copyright">© 2025 VM汉化组官网开发团队</p>
        <p class="build-info">Build: dev@{{ commitId }}</p>
      </div>

      <div class="links-section">
        <div class="column">
          <h3 class="column-title">关于</h3>
          <ul class="link-list">
            <li><a href="join" class="link">加入我们</a></li>
            <li><a href="support-us" class="link">赞助我们</a></li>
            <li><a href="friends-links" class="link">友情链接</a></li>
          </ul>
        </div>
        <div class="column">
          <h3 class="column-title">政策</h3>
          <ul class="link-list">
            <li><a href="privacy" class="link">隐私政策</a></li>
            <li><a href="agreement" class="link">用户协议</a></li>
          </ul>
        </div>
        <div class="column">
          <h3 class="column-title">产品</h3>
          <ul class="link-list">
            <li><a href="modpacks" class="link">整合包汉化补丁</a></li>
            <li><a href="map" class="link">地图汉化补丁</a></li>
            <li><a href="vmtu" class="link">VM汉化更新模组</a></li>
            <li><a href="tools" class="link">翻译工具</a></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="bottom-note">
      <p>本站所提供内容与 Minecraft 官方无关，未获 Mojang 或 Microsoft 任何形式的认可或授权</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const commitId = import.meta.env.VITE_GIT_COMMIT || '未知提交'
</script>

<style scoped>
@import './css/Footer.css';
</style>
