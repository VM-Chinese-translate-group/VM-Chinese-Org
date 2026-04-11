<template>
  <div class="afdian-wrap">
    <p class="intro-text">
      VM汉化组是一个用爱发电的专注于汉化MC整合包与地图的非盈利组织，汉化下载完全零广告并且完全免费。
      但是随着项目规模和用户数量的持续增长，也需要有相应的资金支持才能持续翻译的维护和制作。您可以通过下列的方法来支持我们：
    </p>

    <Coins />

    <div class="tip-block">
      <p class="tip-title">TIP</p>
      <p>
        未成年人请勿大额赞助。如有其他疑问可联系 
        <a href="mailto:admin@vmct-cn.top">admin@vmct-cn.top</a>
        ，并备注相关问题。
      </p>
    </div>

    <div class="section-head">
      <span class="section-title">
        <Icon icon="lucide:users" class="si" />
        感谢以下小伙伴的发电支持
      </span>
      <span class="section-pill" v-if="totalCount > 0">
        <Icon icon="lucide:sparkles" class="si" />
        共 {{ totalCount }} 位
      </span>
    </div>

    <div class="state-wrap" v-if="loading">
      <div class="state-icon spin"><Icon icon="lucide:loader-2" width="20" /></div>
      <p class="state-label">正在拉取发电名单…</p>
    </div>

    <div class="state-wrap" v-else-if="error">
      <div class="state-icon"><Icon icon="lucide:wifi-off" width="20" /></div>
      <p class="state-label">加载失败</p>
      <p class="state-desc">{{ error }}</p>
      <button class="btn-retry" @click="fetchSponsors(currentPage)">
        <Icon icon="lucide:refresh-cw" width="13" />
        重新加载
      </button>
    </div>

    <Transition name="fade">
      <div v-if="!loading && !error && sponsors.length > 0">
        <div class="sponsor-grid">
          <div
            class="sponsor-card"
            v-for="(item, idx) in sponsors"
            :key="item.user.user_id"
            :style="{ animationDelay: idx * 35 + 'ms' }"
          >
            <div class="card-head">
              <img
                class="avatar"
                v-if="item.user.avatar"
                :src="item.user.avatar"
                :alt="item.user.name"
              />
              <div class="avatar-fb" v-else>{{ item.user.name?.charAt(0) ?? '?' }}</div>
              <div class="card-meta">
                <span class="card-name">{{ item.user.name }}</span>
                <span class="card-amount">
                  <Icon icon="lucide:zap" width="11" />
                  累计 ¥{{ item.all_sum_amount }}
                </span>
              </div>
            </div>

            <div class="divider" />

            <div class="card-plan">
              <template v-if="lastPlan(item).name">
                <div class="plan-row">
                  <span class="plan-badge">
                    <Icon icon="lucide:tag" width="10" />
                    {{ lastPlan(item).name }}
                  </span>
                  <span class="plan-price" v-if="lastPlan(item).show_price">
                    ¥{{ lastPlan(item).show_price }}
                  </span>
                </div>
                <span class="plan-date" v-if="item.last_pay_time">
                  <Icon icon="lucide:calendar" width="11" />
                  {{ fmtDate(item.last_pay_time) }}
                </span>
              </template>
              <span class="no-plan" v-else>暂无方案信息</span>
            </div>

            <div class="card-pic" v-if="lastPlan(item).pic">
              <img :src="lastPlan(item).pic" alt="" />
            </div>
          </div>
        </div>

        <div class="pagination" v-if="totalPage > 1">
          <button class="pg-btn" :disabled="currentPage <= 1" @click="go(currentPage - 1)">
            <Icon icon="lucide:chevron-left" width="14" />
            {{ $t('DownloadCards.previousPage') }}
          </button>
          <template v-for="p in pageNums" :key="'p' + p">
            <span class="pg-dot" v-if="p === '...'">…</span>
            <button v-else class="pg-btn" :class="{ active: p === currentPage }" @click="go(p)">
              {{ p }}
            </button>
          </template>
          <button class="pg-btn" :disabled="currentPage >= totalPage" @click="go(currentPage + 1)">
            {{ $t('DownloadCards.nextPage') }}
            <Icon icon="lucide:chevron-right" width="14" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import Coins from '@/components/Coins.vue'

const API = 'https://afdian.wulian.workers.dev'
const sponsors = ref([])
const totalCount = ref(0)
const totalPage = ref(1)
const currentPage = ref(1)
const loading = ref(false)
const error = ref('')

async function fetchSponsors(page = 1) {
  loading.value = true
  error.value = ''
  sponsors.value = []
  try {
    const res = await fetch(`${API}?page=${page}`)
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const { ec, em, data } = await res.json()
    if (ec !== 200) throw new Error(em || '接口错误')
    sponsors.value = data.list || []
    totalCount.value = data.total_count || 0
    totalPage.value = data.total_page || 1
    currentPage.value = page
    if (page !== 1) window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const go = (p) => fetchSponsors(p)

function lastPlan(item) {
  const p = item.sponsor_plans || []
  return p[p.length - 1]?.name ? p[p.length - 1] : item.current_plan?.name ? item.current_plan : {}
}

function fmtDate(ts) {
  const d = new Date(ts * 1000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const pageNums = computed(() => {
  const [t, c] = [totalPage.value, currentPage.value]
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1)
  const p = [1]
  if (c > 3) p.push('...')
  for (let i = Math.max(2, c - 1); i <= Math.min(t - 1, c + 1); i++) p.push(i)
  if (c < t - 2) p.push('...')
  p.push(t)
  return p
})

onMounted(() => fetchSponsors(1))
</script>

<style scoped>
@import '@/styles/DonateLayout.css';
</style>
