<template>
  <section class="preview">
    <h3>实时预览</h3>
    <article v-html="rendered" />
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
const props = defineProps<{ body: string }>()
const md = new MarkdownIt({ html: false, breaks: true, linkify: true })
function previewSource(body: string) {
  return body
    .replace(/<DownloadLayout\b[^>]*>/g, '')
    .replace(/<\/DownloadLayout>/g, '')
    .replace(
      /<DocSupport\s*\/>/g,
      '> **支持 VM 汉化组**\n> 正式页面会在这里显示项目支持与反馈组件。',
    )
    .replace(
      /<DownloadLinks[\s\S]*?\/>/g,
      '> **下载方式**\n> 正式页面会在这里显示对应平台的下载按钮。',
    )
    .replace(/::: (warning|info|tip|details) (.*)\n([\s\S]*?)\n:::/g, '> **$2**\n> $3')
}
const rendered = computed(() => md.render(previewSource(props.body)))
</script>
<style scoped>
.preview {
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
}
.preview h3 {
  margin-top: 0;
}
.preview :deep(img) {
  max-width: 100%;
}
.preview :deep(pre) {
  overflow: auto;
  padding: 12px;
  background: var(--bg-off-white);
}
.preview :deep(blockquote) {
  margin: 12px 0;
  padding: 10px;
  border-left: 4px solid var(--theme-color);
  background: var(--bg-off-white);
}
</style>
