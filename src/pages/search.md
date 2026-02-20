---
title: 搜索
---

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
