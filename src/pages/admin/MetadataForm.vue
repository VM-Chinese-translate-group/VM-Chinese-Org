<template>
  <section class="metadata">
    <h3>页面元数据</h3>
    <div class="fields">
      <label>
        标题
        <input v-model="model.title" class="cms-field" />
      </label>
      <label>
        原始名称
        <input v-model="model.originalName" class="cms-field" />
      </label>
      <label>
        封面 / 图标 URL
        <input v-model="model.icon" class="cms-field" type="url" />
      </label>
      <label>
        更新日期
        <input v-model="calendarDate" class="cms-field" type="date" />
      </label>
      <label>
        发布状态
        <SelectMenu
          :model-value="model.statusType"
          :options="statusOptions"
          aria-label="发布状态"
          variant="flat"
          style="--select-width: 100%; --select-menu-min-width: 100%"
          @update:model-value="model.statusType = $event"
        />
      </label>
      <label>
        加载器
        <SelectMenu
          :model-value="model.loader"
          :options="loaderOptions"
          aria-label="加载器"
          variant="flat"
          style="--select-width: 100%; --select-menu-min-width: 100%"
          @update:model-value="model.loader = $event"
        />
      </label>
      <label>
        Minecraft 版本
        <input v-model="model.minecraft" class="cms-field" placeholder="例如 1.21.1" />
      </label>
      <label>
        整合包版本
        <input v-model="model.pack" class="cms-field" placeholder="例如 2.3.1" />
      </label>
    </div>
    <label>
      简介
      <textarea v-model="model.description" class="cms-field" rows="3" />
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
          class="cms-field"
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
        <div class="link-platform">
          <SelectMenu
            :model-value="selectedLinkPlatform(link.id)"
            :options="linkOptions"
            aria-label="链接平台"
            variant="flat"
            style="--select-width: 100%; --select-menu-min-width: 100%"
            @update:model-value="updateLinkPlatform(link, $event)"
          />
          <input
            v-if="selectedLinkPlatform(link.id) === '__custom__'"
            v-model="link.id"
            class="cms-field"
            placeholder="自定义平台标识"
          />
        </div>
        <input v-model="link.text" class="cms-field" placeholder="显示文字（必填）" />
        <input v-model="link.link" class="cms-field" type="url" placeholder="https://..." />
        <button type="button" @click="model.links.splice(index, 1)">删除</button>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import SelectMenu from '@/components/SelectMenu.vue'
import type { ContentLink, ContentMetadata } from './types'
const model = defineModel<ContentMetadata>({ required: true })
const calendarDate = computed({
  get: () => {
    const match = model.value.updateDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
    return match ? `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}` : ''
  },
  set: (value) => {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    model.value.updateDate = match ? `${match[1]}-${Number(match[2])}-${Number(match[3])}` : ''
  },
})
const statusOptions = [
  { value: '', label: '未设置' },
  { value: 'maintaining', label: '维护中' },
  { value: 'completed', label: '已完成' },
  { value: 'paused', label: '暂停维护' },
]
const loaderOptions = [
  { value: '', label: '未设置' },
  { value: 'vanilla', label: '原版' },
  { value: 'forge', label: 'Forge' },
  { value: 'neoforge', label: 'NeoForge' },
  { value: 'fabric', label: 'Fabric' },
  { value: 'quilt', label: 'Quilt' },
]
const linkOptions = [
  'curseforge',
  'modrinth',
  'github',
  'bilibili',
  'planetminecraft',
  'lazy',
  'vmtu',
  'website',
].map((value) => ({ value, label: value }))
linkOptions.push({ value: '__custom__', label: '自定义平台' })
function selectedLinkPlatform(id: string) {
  return linkOptions.some((option) => option.value === id) ? id : '__custom__'
}
function updateLinkPlatform(link: ContentLink, value: string) {
  link.id = value === '__custom__' ? '' : value
}
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
textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
}
.cms-field {
  min-height: 44px;
  border-color: var(--switcher-border, #d8dfda);
  border-radius: 8px;
  background: var(--bg-white, #fff);
  box-shadow: inset 0 1px 1px #00000008;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease;
}
.cms-field:focus {
  outline: 0;
  border-color: var(--info-1, #168153);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--info-1, #168153) 16%, transparent);
}
textarea.cms-field {
  min-height: 96px;
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
  grid-template-columns: 150px minmax(10rem, 1fr) minmax(16rem, 2fr) auto;
  gap: 6px;
}
.link-platform {
  display: grid;
  gap: 6px;
  align-content: start;
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
