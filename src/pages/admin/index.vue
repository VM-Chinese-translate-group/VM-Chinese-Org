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
      <header>
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
        <p>粘贴 Cloudflare Pages 的 Production Deploy Hook URL。发布时只触发一次完整构建。</p>
        <div>
          <input v-model="deployHook" type="url" placeholder="https://api.cloudflare.com/..." />
          <button class="secondary" @click="saveSettings">保存</button>
        </div>
      </details>
      <div class="workspace">
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
            <input v-model="draft.path" placeholder="例如 map/evergrowth" />
          </label>
          <MetadataForm v-model="draft.metadata" />
          <div class="content-grid">
            <div>
              <h3>Markdown 正文</h3>
              <MarkdownEditor v-model="draft.body" />
            </div>
            <MarkdownPreview :body="draft.body" />
          </div>
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
import MarkdownEditor from './MarkdownEditor.vue'
import MarkdownPreview from './MarkdownPreview.vue'
import MetadataForm from './MetadataForm.vue'
import { emptyMetadata, parseMetadata, stringifyMetadata } from './types'
const loggedIn = ref(false),
  needsSetup = ref(false),
  password = ref(''),
  busy = ref(false),
  notice = ref(''),
  noticeKind = ref<'success' | 'error'>('success'),
  pages = ref<ContentPageSummary[]>([]),
  deployHook = ref('')
const draft = reactive({
  id: '',
  path: '',
  metadata: emptyMetadata(),
  body: '',
  state: '' as ContentPage['state'] | '',
})
const canSave = computed(() => Boolean(draft.path.trim() && draft.body.trim()))
const show = (message: string, kind: 'success' | 'error' = 'success') => {
  notice.value = message
  noticeKind.value = kind
}
const label = (state: string) =>
  (({ draft: '草稿', published: '已发布', archived: '已下线' }) as Record<string, string>)[state] ||
  state
function apply(page: ContentPage) {
  draft.id = page.id
  draft.path = page.path
  draft.metadata = parseMetadata(page.draftFrontmatter)
  draft.body = page.draftBody
  draft.state = page.state
}
function newPage() {
  draft.id = ''
  draft.path = ''
  draft.metadata = emptyMetadata()
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
    const input = {
      path: draft.path,
      frontmatter: stringifyMetadata(draft.metadata),
      body: draft.body,
    }
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
  width: min(1500px, calc(100% - 32px));
  margin: 0 auto;
  padding: 110px 0 70px;
}
.content-admin header,
.actions,
.settings > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
h1,
h2,
h3 {
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
.success {
  color: #166534;
  background: #e6f6eb;
}
.error {
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
.settings input {
  flex: 1;
}
.workspace {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
}
.workspace aside {
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
  color: var(--text-color);
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
  display: grid;
  gap: 18px;
  padding: 24px;
}
.editor > label {
  display: grid;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
}
.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 0.7fr);
  gap: 18px;
}
.content-grid > div:first-child {
  display: grid;
  gap: 8px;
}
input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 7px;
  background: var(--bg-color);
  color: var(--text-color);
  font:
    14px/1.5 ui-monospace,
    SFMono-Regular,
    Consolas,
    monospace;
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
  color: #fff;
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
@media (max-width: 900px) {
  .workspace,
  .content-grid {
    grid-template-columns: 1fr;
  }
  .workspace aside {
    min-height: auto;
    max-height: 230px;
    overflow: auto;
    border-right: 0;
    border-bottom: 1px solid var(--border-color);
  }
}
@media (max-width: 600px) {
  .content-admin {
    width: min(100% - 20px, 1500px);
    padding-top: 88px;
  }
  .settings > div,
  .content-admin header {
    align-items: stretch;
    flex-direction: column;
  }
  .editor {
    padding: 14px;
  }
}
</style>
