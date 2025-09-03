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
.footer {
  background-color: #f7f9fc;
  color: #555;
  padding: 40px 20px;
  font-family: Arial, sans-serif;
  background: linear-gradient(to bottom, #f7f9fc 0%, #e8f5e9 100%);
}

.footer-container {
  display: flex;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.logo-section {
  flex: 1;
  min-width: 250px;
}

.logo-icon {
  width: 30px;
  height: 30px;
  vertical-align: middle;
  margin-right: 10px;
  color: #333;
}

.logo-text {
  font-weight: bold;
  font-size: 1.2rem;
  color: #333;
}

.copyright,
.build-info {
  font-size: 0.8rem;
  color: #888;
  margin-top: 10px;
}

.links-section {
  flex: 2;
  display: flex;
  justify-content: flex-end;
  gap: 80px;
}

.column-title {
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.link-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.link {
  color: #555;
  text-decoration: none;
  display: inline-block;
  margin-bottom: 8px;
  position: relative;
  transition:
    color 0.5s ease,
    transform 0.5s ease;
}

.link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #007bff, #00d4ff);
  transition: width 0.3s ease;
}

.link:hover {
  color: #007bff;
}

.link:hover::after {
  width: 100%;
}

.bottom-note {
  text-align: center;
  font-size: 0.7rem;
  border-top: 1px solid #c8e6c9;
  color: #999;
  margin-top: 40px;
}

@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
    gap: 40px;
  }

  .links-section {
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 40px;
  }
}
</style>
