<template>
  <main class="content-admin">
    <section v-if="!loggedIn" class="login-card">
      <p class="eyebrow">CONTENT CMS</p>
      <h1>{{ needsSetup ? '设置后台密码' : '后台登录' }}</h1>
      <p>使用 6 位数字密码直接管理网站内容。</p>
      <p v-if="notice" class="notice error">{{ notice }}</p>
      <form @submit.prevent="authenticate">
        <input
          v-model="password"
          inputmode="numeric"
          maxlength="6"
          pattern="[0-9]{6}"
          type="password"
          placeholder="6 位数字密码"
          required
        />
        <button class="primary" :disabled="busy">
          {{ needsSetup ? '设置并进入后台' : '登录' }}
        </button>
      </form>
    </section>

    <template v-else>
      <header class="header">
        <div>
          <p class="eyebrow">CONTENT CMS</p>
          <h1>页面内容管理</h1>
        </div>
        <div class="actions">
          <button class="secondary" @click="newPage">新建页面</button>
          <button class="secondary" @click="logout">退出</button>
        </div>
      </header>
      <p v-if="notice" class="notice" :class="noticeKind">{{ notice }}</p>

      <details class="settings">
        <summary>部署设置</summary>
        <p>
          粘贴 Cloudflare Pages 的 Production Deploy Hook URL。发布内容时会自动触发一次完整构建。
        </p>
        <div class="settings-row">
          <input v-model="deployHook" type="url" placeholder="https://api.cloudflare.com/..." />
          <button class="secondary" @click="saveSettings">保存</button>
        </div>
      </details>

      <div class="grid">
        <aside>
          <button class="page-row" :class="{ active: !draft.id }" @click="newPage">
            ＋ 新页面
          </button>
          <button
            v-for="page in pages"
            :key="page.id"
            class="page-row"
            :class="{ active: page.id === draft.id }"
            @click="openPage(page.id)"
          >
            <span>{{ page.path }}</span>
            <small :class="page.state">{{ label(page.state) }}</small>
          </button>
        </aside>
        <section class="editor">
          <h2>{{ draft.id ? '编辑页面' : '新建页面' }}</h2>
          <label>
            页面路径
            <input v-model="draft.path" placeholder="例如 modpacks/example" />
          </label>
          <label>
            Frontmatter（不含 ---）
            <textarea v-model="draft.frontmatter" class="frontmatter" spellcheck="false" />
          </label>
          <label>
            Markdown 正文
            <textarea v-model="draft.body" class="markdown" spellcheck="false" />
          </label>
          <div class="actions">
            <button class="secondary" :disabled="busy || !canSave" @click="save">保存草稿</button>
            <button class="primary" :disabled="busy || !canSave" @click="publish">
              发布并完整构建
            </button>
            <button
              v-if="draft.id && draft.state !== 'archived'"
              class="danger"
              :disabled="busy"
              @click="archive"
            >
              下线
            </button>
          </div>
        </section>
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  archiveContentPage,
  createContentPage,
  getContentAuthStatus,
  getContentPage,
  getContentSettings,
  listContentPages,
  loginContentAdmin,
  logoutContentAdmin,
  publishContentPage,
  saveContentDraft,
  saveContentSettings,
  setupContentAdmin,
  type ContentPage,
  type ContentPageSummary,
} from '@/api/contentAdmin'

const loggedIn = ref(false)
const needsSetup = ref(false)
const password = ref('')
const busy = ref(false)
const notice = ref('')
const noticeKind = ref<'success' | 'error'>('success')
const pages = ref<ContentPageSummary[]>([])
const deployHook = ref('')
const draft = reactive({
  id: '',
  path: '',
  frontmatter: '',
  body: '',
  state: '' as ContentPage['state'] | '',
})
const canSave = computed(() => Boolean(draft.path.trim() && draft.body.trim()))

function show(message: string, kind: 'success' | 'error' = 'success') {
  notice.value = message
  noticeKind.value = kind
}
function label(state: string) {
  return (
    ({ draft: '草稿', published: '已发布', archived: '已下线' } as Record<string, string>)[state] ||
    state
  )
}
function apply(page: ContentPage) {
  draft.id = page.id
  draft.path = page.path
  draft.frontmatter = page.draftFrontmatter
  draft.body = page.draftBody
  draft.state = page.state
}
function newPage() {
  draft.id = ''
  draft.path = ''
  draft.frontmatter = ''
  draft.body = ''
  draft.state = ''
}
async function refresh() {
  pages.value = (await listContentPages()).pages
}
async function openPage(id: string) {
  busy.value = true
  try {
    apply((await getContentPage(id)).page)
  } catch (error) {
    show(error instanceof Error ? error.message : '无法读取页面', 'error')
  } finally {
    busy.value = false
  }
}
async function authenticate() {
  busy.value = true
  notice.value = ''
  try {
    if (needsSetup.value) await setupContentAdmin(password.value)
    else await loginContentAdmin(password.value)
    password.value = ''
    loggedIn.value = true
    await Promise.all([refresh(), loadSettings()])
  } catch (error) {
    show(error instanceof Error ? error.message : '登录失败', 'error')
  } finally {
    busy.value = false
  }
}
async function loadSettings() {
  deployHook.value = (await getContentSettings()).deploymentHookUrl
}
async function saveSettings() {
  busy.value = true
  try {
    await saveContentSettings(deployHook.value)
    show('Deploy Hook 已保存。')
  } catch (error) {
    show(error instanceof Error ? error.message : '保存失败', 'error')
  } finally {
    busy.value = false
  }
}
async function save() {
  busy.value = true
  try {
    const input = { path: draft.path, frontmatter: draft.frontmatter, body: draft.body }
    apply(
      (draft.id ? await saveContentDraft(draft.id, input) : await createContentPage(input)).page,
    )
    await refresh()
    show('草稿已保存，网站尚未更新。')
  } catch (error) {
    show(error instanceof Error ? error.message : '保存失败', 'error')
  } finally {
    busy.value = false
  }
}
async function publish() {
  await save()
  if (!draft.id || noticeKind.value === 'error') return
  busy.value = true
  try {
    const result = await publishContentPage(draft.id)
    apply(result.page)
    await refresh()
    show(
      result.deployment.requested
        ? '已发布，Cloudflare 正在完整构建。'
        : '内容已发布，但构建未触发：' + (result.deployment.error || '未知错误'),
      result.deployment.requested ? 'success' : 'error',
    )
  } catch (error) {
    show(error instanceof Error ? error.message : '发布失败', 'error')
  } finally {
    busy.value = false
  }
}
async function archive() {
  if (!draft.id || !window.confirm('确定下线这个页面吗？')) return
  busy.value = true
  try {
    const result = await archiveContentPage(draft.id)
    apply(result.page)
    await refresh()
    show(
      result.deployment.requested
        ? '已下线，Cloudflare 正在完整构建。'
        : '页面已下线，但构建未触发。',
      result.deployment.requested ? 'success' : 'error',
    )
  } catch (error) {
    show(error instanceof Error ? error.message : '下线失败', 'error')
  } finally {
    busy.value = false
  }
}
async function logout() {
  await logoutContentAdmin().catch(() => {})
  loggedIn.value = false
  password.value = ''
  newPage()
}
onMounted(async () => {
  try {
    const status = await getContentAuthStatus()
    needsSetup.value = status.needsSetup
    if (!status.needsSetup) {
      try {
        await Promise.all([refresh(), loadSettings()])
        loggedIn.value = true
      } catch {}
    }
  } catch (error) {
    show(error instanceof Error ? error.message : '无法连接内容服务', 'error')
  }
})
</script>

<style scoped>
.content-admin {
  width: min(1400px, calc(100% - 32px));
  margin: 0 auto;
  padding: 110px 0 70px;
}
.header,
.actions,
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
h1,
h2 {
  margin: 0;
}
.eyebrow {
  color: var(--theme-color);
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.1em;
}
.notice {
  padding: 10px 12px;
  border-radius: 7px;
}
.notice.success {
  color: #166534;
  background: #e6f6eb;
}
.notice.error {
  color: #b42318;
  background: #feecec;
}
.login-card {
  width: min(400px, 100%);
  margin: 12vh auto;
  padding: 28px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
}
.login-card form {
  display: grid;
  gap: 12px;
  margin-top: 22px;
}
.settings {
  margin: 18px 0;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}
.settings p {
  color: var(--text-secondary);
  font-size: 14px;
}
.settings-row input {
  flex: 1;
}
.grid {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
}
.grid aside {
  min-height: 600px;
  padding: 10px;
  background: var(--bg-off-white);
  border-right: 1px solid var(--border-color);
}
.page-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 10px 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  text-align: left;
  cursor: pointer;
}
.page-row.active,
.page-row:hover {
  background: color-mix(in srgb, var(--theme-color) 12%, transparent);
}
.page-row span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.page-row small {
  white-space: nowrap;
}
.draft {
  color: #805b10;
}
.published {
  color: #176638;
}
.archived {
  color: #59636e;
}
.editor {
  padding: 24px;
}
.editor label {
  display: grid;
  gap: 6px;
  margin: 16px 0;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
}
input,
textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--border-color);
  border-radius: 7px;
  background: var(--bg-color);
  color: var(--text-color);
  padding: 10px;
  font:
    14px/1.5 ui-monospace,
    SFMono-Regular,
    Consolas,
    monospace;
}
textarea {
  resize: vertical;
}
.frontmatter {
  min-height: 120px;
}
.markdown {
  min-height: 380px;
}
button {
  border: 0;
  border-radius: 7px;
  padding: 9px 14px;
  font-weight: 600;
  cursor: pointer;
}
button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.primary {
  background: var(--theme-color);
  color: white;
}
.secondary {
  border: 1px solid var(--border-color);
  background: var(--bg-off-white);
  color: var(--text-color);
}
.danger {
  color: #b42318;
  background: #fee2e2;
}
@media (max-width: 800px) {
  .content-admin {
    width: min(100% - 20px, 1400px);
    padding-top: 88px;
  }
  .grid {
    grid-template-columns: 1fr;
  }
  .grid aside {
    min-height: auto;
    max-height: 230px;
    overflow: auto;
    border-right: 0;
    border-bottom: 1px solid var(--border-color);
  }
  .editor {
    padding: 18px;
  }
  .settings-row {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
