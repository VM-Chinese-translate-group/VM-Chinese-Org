<template>
  <section class="metadata">
    <h3>页面元数据</h3>
    <div class="fields">
      <label>
        标题
        <input v-model="model.title" />
      </label>
      <label>
        原始名称
        <input v-model="model.originalName" />
      </label>
      <label>
        封面 / 图标 URL
        <input v-model="model.icon" type="url" />
      </label>
      <label>
        更新日期
        <input v-model="model.updateDate" type="date" />
      </label>
      <label>
        发布状态
        <select v-model="model.statusType">
          <option value="">未设置</option>
          <option value="maintaining">维护中</option>
          <option value="completed">已完成</option>
          <option value="paused">暂停维护</option>
        </select>
      </label>
      <label>
        加载器
        <select v-model="model.loader">
          <option value="">未设置</option>
          <option value="vanilla">原版</option>
          <option value="forge">Forge</option>
          <option value="neoforge">NeoForge</option>
          <option value="fabric">Fabric</option>
          <option value="quilt">Quilt</option>
        </select>
      </label>
      <label>
        Minecraft 版本
        <input v-model="model.minecraft" placeholder="例如 1.21.1" />
      </label>
      <label>
        整合包版本
        <input v-model="model.pack" placeholder="例如 2.3.1" />
      </label>
    </div>
    <label>
      简介
      <textarea v-model="model.description" rows="3" />
    </label>
    <div class="switches">
      <label>
        <input v-model="model.featured" type="checkbox" />
        推荐显示
      </label>
      <label>
        <input v-model="model.search" type="checkbox" />
        搜索收录
      </label>
      <label>
        <input v-model="model.sidebar" type="checkbox" />
        侧栏显示
      </label>
    </div>
    <label>
      作者
      <div class="chips">
        <input
          v-for="(_, index) in model.authors"
          :key="index"
          v-model="model.authors[index]"
          placeholder="作者名称"
        />
        <button type="button" @click="model.authors.push('')">＋ 添加作者</button>
      </div>
    </label>
    <div class="links">
      <div>
        <strong>相关链接</strong>
        <button
          type="button"
          @click="model.links.push({ id: 'curseforge', text: '', link: '', icon: '' })"
        >
          ＋ 添加链接
        </button>
      </div>
      <div v-for="(link, index) in model.links" :key="index" class="link-row">
        <select v-model="link.id">
          <option v-for="id in linkIds" :key="id" :value="id">{{ id }}</option>
        </select>
        <input v-model="link.text" placeholder="显示文字（可选）" />
        <input v-model="link.link" type="url" placeholder="https://..." />
        <button type="button" @click="model.links.splice(index, 1)">删除</button>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import type { ContentMetadata } from './types'
const model = defineModel<ContentMetadata>({ required: true })
const linkIds = [
  'curseforge',
  'modrinth',
  'github',
  'bilibili',
  'planetminecraft',
  'lazy',
  'vmtu',
  'website',
  'other',
]
</script>
<style scoped>
.metadata {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
}
.metadata h3 {
  margin: 0;
}
.fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.metadata label {
  display: grid;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}
input,
select,
textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
}
.switches,
.chips,
.links > div:first-child {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
.switches label {
  display: flex;
  align-items: center;
  gap: 5px;
}
.switches input {
  width: auto;
}
.chips input {
  width: 170px;
}
.links {
  display: grid;
  gap: 8px;
}
.link-row {
  display: grid;
  grid-template-columns: 130px 1fr 2fr auto;
  gap: 6px;
}
button {
  padding: 7px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-off-white);
  color: var(--text-color);
  cursor: pointer;
}
@media (max-width: 700px) {
  .fields,
  .link-row {
    grid-template-columns: 1fr;
  }
}
</style>
