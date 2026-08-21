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
const rendered = computed(() =>
  md.render(
    props.body
      .replace(
        /::: (warning|info|tip) (.*)\n([\s\S]*?)\n:::/g,
        '<blockquote><strong>$2</strong><br>$3</blockquote>',
      )
      .replace(
        /<DownloadLinks[\s\S]*?\/>/g,
        '<blockquote><strong>下载方式组件</strong><br>将在正式页面中显示下载按钮。</blockquote>',
      ),
  ),
)
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
