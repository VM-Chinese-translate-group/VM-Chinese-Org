<template>
  <section class="markdown-editor">
    <div class="toolbar">
      <button
        v-for="tool in tools"
        :key="tool.name"
        type="button"
        :title="tool.name"
        @click="insert(tool.before, tool.after, tool.placeholder)"
      >
        {{ tool.label }}
      </button>
      <span></span>
      <button type="button" @click="insertContainer('warning', '重要提示')">警告</button>
      <button type="button" @click="insertContainer('info', '信息')">信息</button>
      <button type="button" @click="insertDownload">下载组件</button>
    </div>
    <textarea ref="textarea" v-model="model" spellcheck="false" placeholder="Markdown 正文" />
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const model = defineModel<string>({ required: true })
const textarea = ref<HTMLTextAreaElement>()
const tools = [
  { name: '粗体', label: 'B', before: '**', after: '**', placeholder: '粗体文字' },
  { name: '斜体', label: 'I', before: '*', after: '*', placeholder: '斜体文字' },
  { name: '标题', label: 'H2', before: '## ', after: '', placeholder: '标题' },
  { name: '链接', label: '链接', before: '[', after: '](https://)', placeholder: '链接文字' },
  { name: '代码', label: '代码', before: '`', after: '`', placeholder: '代码' },
  { name: '列表', label: '列表', before: '- ', after: '', placeholder: '列表项' },
]
function insert(before: string, after: string, placeholder: string) {
  const el = textarea.value
  const start = el?.selectionStart ?? model.value.length
  const end = el?.selectionEnd ?? start
  const selected = model.value.slice(start, end) || placeholder
  model.value = model.value.slice(0, start) + before + selected + after + model.value.slice(end)
  requestAnimationFrame(() => {
    el?.focus()
    el?.setSelectionRange(start + before.length, start + before.length + selected.length)
  })
}
function insertContainer(type: string, title: string) {
  insert(`\n::: ${type} ${title}\n`, '\n:::\n', '内容')
}
function insertDownload() {
  insert(
    '\n<DownloadLinks :methods="[\n  ',
    '\n]" />\n',
    "{ id: 'curseforge', text: '下载地图和汉化', link: 'https://www.curseforge.com/minecraft/worlds/evergrowth/files/7111682' },\n  { id: 'lazy', link: 'https://www.curseforge.com/minecraft/worlds/evergrowth/files/7111682' }",
  )
}
</script>
<style scoped>
.markdown-editor {
  display: grid;
  gap: 6px;
  align-content: start;
  grid-template-rows: auto auto;
}
.toolbar {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  align-items: center;
  align-self: start;
}
.toolbar span {
  flex: 1;
}
.toolbar button {
  flex: 0 0 auto;
  min-height: 34px;
  line-height: 1;
  padding: 6px 9px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background: var(--bg-off-white);
  color: var(--text-color);
  cursor: pointer;
}
.markdown-editor textarea {
  align-self: start;
  width: 100%;
  min-height: 420px;
  height: 520px;
  box-sizing: border-box;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-color);
  font:
    14px/1.6 ui-monospace,
    SFMono-Regular,
    Consolas,
    monospace;
  resize: vertical;
}
</style>
