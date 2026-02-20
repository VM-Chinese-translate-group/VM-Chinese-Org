<script setup>
import { ref, onMounted } from 'vue'
const q = ref('')
const results = ref([])
let index = []
onMounted(async () => {
  try {
    const res = await fetch('/search-index.json')
    index = await res.json()
  } catch (e) {
    index = []
  }
})
function search() {
  const term = q.value.trim().toLowerCase()
  if (!term) { results.value = []; return }
  results.value = index.filter(i => ((i.title||'').toLowerCase().includes(term) || (i.text||'').toLowerCase().includes(term)))
}
</script>

# 页面搜索

请输入关键词进行搜索（支持页面标题和内容）。

<div class="search-ui">
  <input v-model="q" @input="search" placeholder="搜索页面标题或内容" />
  <ul>
    <li v-for="r in results" :key="r.url">
      <a :href="r.url">{{ r.title || r.url }}</a>
      <p>{{ r.text }}</p>
    </li>
  </ul>
  <p v-if="results.length===0 && q">未找到结果</p>
</div>

# Hello VitePress-like Markdown

This is a **markdown** file rendered as a Vue component!

<DownloadLinks :methods="[
  { id: 'quark-lanzou', text: '下载汉化', icon: '/imgs/logo/logo_64.png', lanzouLink: 'https://vmhanhuazu.lanzouo.com/s/sb4', quarkLink: 'https://pan.quark.cn/s/e7e23e916087' },
  { id: 'bilibili', text: '介绍视频', icon: '/imgs/svg/bilibili.svg', link: 'https://www.bilibili.com/video/BV1mAyrBqEYj' },
  { id: 'curseforge', text: '下载i18n模组', icon: '/imgs/svg/curseforge.svg', link: 'https://www.curseforge.com/api/v1/mods/297404/files/7173159/download' },
  { id: 'github', text: 'GitHub仓库', icon: '/imgs/svg/github.svg', link: 'https://github.com/VM-Chinese-translate-group/StoneBlock4-Chinese' },
  { id: 'lazy', text: '懒汉下载', icon: '/imgs/lazydl.png', link: 'https://vmhanhuazu.lanzouo.com/s/sb4' }
]" />

## Custom Containers

::: tip
This is a tip.
:::

::: info
This is a info.
:::

::: warning
This is a warning.
:::

::: details details

xxxxxxxxx

:::
