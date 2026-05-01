<template>
  <main class="credits-page">
    <section class="credits-hero">
      <p class="credits-kicker">CREDITS</p>
      <h1>贡献名单</h1>
      <p class="credits-intro">
        感谢每一位为官网、VM 汉化组与社区内容付出时间的人。名单中，一半黑体字为 B
        站用户名，括号内为称呼，小字为 GitHub 或 Paratranz 用户名。
      </p>

      <div class="credits-stats" aria-label="贡献名单统计">
        <div v-for="category in categories" :key="category.id" class="credits-stat">
          <span>{{ category.label }}</span>
          <strong>{{ category.people.length }}</strong>
        </div>
      </div>
    </section>

    <section class="credits-reel" aria-label="分类贡献名单">
      <article
        v-for="(category, categoryIndex) in categories"
        :key="category.id"
        class="credit-section"
        :style="{ '--section-index': categoryIndex }"
      >
        <div class="credit-marker" aria-hidden="true"></div>

        <div class="credit-heading">
          <span class="credit-number">
            {{ String(categoryIndex + 1).padStart(2, '0') }}
          </span>

          <div>
            <h2>{{ category.label }}</h2>
            <p>{{ category.description }}</p>
          </div>
        </div>

        <ol class="credit-list">
          <li
            v-for="(person, personIndex) in category.people"
            :key="`${category.id}-${person.name}-${personIndex}`"
            class="credit-person"
            :style="{ '--person-index': personIndex }"
          >
            <a
              v-if="person.uidText"
              class="person-avatar"
              :href="person.spaceUrl"
              target="_blank"
              rel="noreferrer"
              :aria-label="`打开 ${person.displayName} 的 B站空间`"
            >
              <img
                v-if="avatarMap[person.uidText]"
                :src="avatarMap[person.uidText]"
                :alt="`${person.displayName} 的头像`"
                loading="lazy"
                referrerpolicy="no-referrer"
                @error="onAvatarError"
              />
              <span>{{ person.initial }}</span>
            </a>

            <span v-else class="person-avatar" aria-hidden="true">
              <span>{{ person.initial }}</span>
            </span>

            <a
              v-if="person.uidText"
              class="person-main person-link"
              :href="person.spaceUrl"
              target="_blank"
              rel="noreferrer"
            >
              <strong>{{ person.displayName }}</strong>
              <span v-if="person.nickname" class="person-nickname">
                （{{ person.nickname }}）
              </span>
            </a>

            <span v-else class="person-main">
              <strong>{{ person.displayName }}</strong>
              <span v-if="person.nickname" class="person-nickname">
                （{{ person.nickname }}）
              </span>
            </span>

            <small v-if="person.title" class="person-account">
              {{ person.title.trim() }}
            </small>
          </li>
        </ol>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'

import communityStaff from '@/components/Credit/staff-community.json'
import vmStaff from '@/components/Credit/staff-vm.json'
import webStaff from '@/components/Credit/staff-web.json'

interface CreditPerson {
  name: string
  title?: string
  uid?: number | string
}

interface CreditCategory {
  id: string
  label: string
  description: string
  people: CreditPerson[]
}

interface DisplayPerson extends CreditPerson {
  uidText: string
  displayName: string
  nickname: string
  initial: string
  spaceUrl: string
}

const rawCategories: CreditCategory[] = [
  {
    id: 'web',
    label: '网站开发',
    description: '负责官网开发、维护与内容呈现的贡献者。',
    people: webStaff,
  },
  {
    id: 'vm',
    label: 'VM汉化组成员',
    description: '持续参与整合包、地图、工具链与审核工作的正式成员。',
    people: vmStaff,
  },
  {
    id: 'community',
    label: '外部贡献人员',
    description: '来自社区、协作平台与开源项目的外部贡献者。',
    people: communityStaff,
  },
]

const avatarMap = reactive<Record<string, string>>({})
const pendingUids = new Set<string>()

const categories = computed(() =>
  rawCategories.map((category) => ({
    ...category,
    people: category.people.map(normalizePerson),
  })),
)

const allUids = computed(() => {
  const uids = new Set<string>()

  for (const category of categories.value) {
    for (const person of category.people) {
      if (person.uidText) uids.add(person.uidText)
    }
  }

  return [...uids]
})

function normalizePerson(person: CreditPerson): DisplayPerson {
  const uidText = person.uid == null ? '' : String(person.uid).trim()
  const { displayName, nickname } = splitName(person.name)

  return {
    ...person,
    uidText,
    displayName,
    nickname,
    initial: displayName.charAt(0).toUpperCase(),
    spaceUrl: uidText
      ? `https://space.bilibili.com/${encodeURIComponent(uidText)}`
      : '',
  }
}

function splitName(rawName: string) {
  const normalized = rawName.trim()
  const match = normalized.match(/^(.*?)[（(]([^（）()]+)[）)]$/)

  return {
    displayName: match ? match[1].trim() : normalized,
    nickname: match ? match[2].trim() : '',
  }
}

async function loadBilibiliAvatar(uid: string) {
  if (!uid || avatarMap[uid] || pendingUids.has(uid)) return

  pendingUids.add(uid)

  try {
    const response = await fetch(
      `https://vmct-cn.top/api/bilibili/?uid=${encodeURIComponent(uid)}`,
    )

    if (!response.ok) return

    const face = (await response.text()).trim()

    if (/^https:\/\/.+/i.test(face)) {
      avatarMap[uid] = face
    }
  } catch {
    // 头像不是核心内容，失败时保留首字母占位。
  } finally {
    pendingUids.delete(uid)
  }
}

function onAvatarError(event: Event) {
  const image = event.currentTarget as HTMLImageElement
  image.hidden = true
}

onMounted(() => {
  allUids.value.forEach(loadBilibiliAvatar)
})
</script>

<style scoped>
.credits-page {
  --credits-bg: var(--bg-off-white);
  --credits-panel: var(--bg-white);
  --credits-text: var(--text-dark);
  --credits-muted: var(--text-light);
  --credits-soft: var(--vp-c-bg-soft);
  --credits-border: var(--switcher-border);
  --credits-accent: var(--brand-primary);
  --credits-accent-soft: var(--vp-c-info-soft);
  --credits-line: linear-gradient(
    180deg,
    transparent,
    var(--credits-accent) 12%,
    var(--vp-c-tip-1) 50%,
    var(--credits-accent) 88%,
    transparent
  );
  min-height: 100vh;
  padding: 72px 16px 96px;
  background:
    linear-gradient(180deg, var(--credits-bg), var(--credits-soft)),
    var(--credits-bg);
  color: var(--credits-text);
}

.dark .credits-page {
  --credits-bg: #14161b;
  --credits-panel: #1f222a;
  --credits-soft: #181b21;
  --credits-border: rgba(235, 235, 245, 0.14);
  --credits-text: #f1f5f9;
  --credits-muted: #b7c0cf;
  --credits-accent: #8fb2ff;
  --credits-accent-soft: rgba(143, 178, 255, 0.18);
}

.credits-hero,
.credits-reel {
  width: min(1120px, 100%);
  margin: 0 auto;
}

.credits-hero {
  display: grid;
  gap: 18px;
  padding: 36px 0 44px;
}

.credits-kicker {
  margin: 0;
  color: var(--credits-accent);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.credits-hero h1 {
  margin: 0;
  color: var(--credits-text);
  font-size: clamp(2.6rem, 7vw, 5.4rem);
  line-height: 1;
}

.credits-intro {
  max-width: 760px;
  margin: 0;
  color: var(--credits-muted);
  font-size: 1rem;
  line-height: 1.85;
}

.credits-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.credits-stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border: 1px solid var(--credits-border);
  border-radius: 8px;
  background: var(--credits-panel);
  box-shadow: var(--vp-shadow-1);
}

.credits-stat span {
  color: var(--credits-muted);
  font-size: 0.92rem;
}

.credits-stat strong {
  color: var(--credits-accent);
  font-size: 1.35rem;
}

.credits-reel {
  position: relative;
  display: grid;
  gap: 34px;
  padding-left: 42px;
}

.credits-reel::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 14px;
  width: 4px;
  border-radius: 999px;
  background: var(--credits-line);
}

.credit-section {
  position: relative;
  display: grid;
  gap: 18px;
  animation: creditReveal 0.55s ease both;
  animation-delay: calc(var(--section-index) * 0.08s);
}

.credit-marker {
  position: absolute;
  top: 13px;
  left: -36px;
  width: 18px;
  height: 18px;
  border: 4px solid var(--credits-bg);
  border-radius: 999px;
  background: var(--credits-accent);
  box-shadow: 0 0 0 6px var(--credits-accent-soft);
}

.credit-heading {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.credit-number {
  color: var(--credits-accent);
  font-size: 0.86rem;
  font-weight: 800;
  line-height: 2.4;
}

.credit-heading h2 {
  margin: 0;
  font-size: clamp(1.7rem, 4vw, 2.6rem);
  line-height: 1.12;
}

.credit-heading p {
  margin: 8px 0 0;
  color: var(--credits-muted);
  line-height: 1.7;
}

.credit-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.credit-person {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  grid-template-areas:
    'avatar name'
    'avatar account';
  gap: 3px 14px;
  align-items: center;
  min-height: 76px;
  padding: 15px 16px;
  border: 1px solid color-mix(in srgb, var(--credits-border), transparent 18%);
  border-radius: 8px;
  background: color-mix(in srgb, var(--credits-panel), transparent 5%);
  box-shadow: var(--vp-shadow-1);
  animation: creditReveal 0.45s ease both;
  animation-delay: calc(var(--section-index) * 0.08s + var(--person-index) * 0.012s);
}

.person-avatar {
  grid-area: avatar;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  overflow: hidden;
  border: 1px solid var(--credits-border);
  border-radius: 999px;
  background: linear-gradient(135deg, var(--credits-accent-soft), var(--credits-soft));
  color: var(--credits-accent);
  font-size: 1rem;
  font-weight: 900;
  text-decoration: none;
}

.person-avatar img {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: var(--credits-panel);
}

.person-avatar img[hidden] {
  display: none;
}

.person-main {
  grid-area: name;
  min-width: 0;
  color: var(--credits-text);
  line-height: 1.35;
}

.person-main strong {
  font-weight: 900;
  overflow-wrap: anywhere;
}

.person-link {
  text-decoration: none;
  transition: color 0.2s ease;
}

.person-link:hover strong,
.person-link:focus-visible strong {
  color: var(--credits-accent);
}

.person-nickname {
  color: var(--credits-muted);
  overflow-wrap: anywhere;
}

.person-account {
  grid-area: account;
  min-width: 0;
  color: var(--credits-muted);
  font-size: 0.78rem;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

@keyframes creditReveal {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .credit-section,
  .credit-person {
    animation: none;
  }
}

@media (max-width: 820px) {
  .credits-page {
    padding: 48px 12px 72px;
  }

  .credits-stats,
  .credit-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .credits-reel {
    padding-left: 30px;
  }

  .credits-reel::before {
    left: 10px;
  }

  .credit-marker {
    left: -28px;
  }

  .credit-heading {
    gap: 10px;
  }

  .credit-person {
    grid-template-columns: 46px minmax(0, 1fr);
    padding: 14px 12px;
  }

  .person-avatar {
    width: 42px;
    height: 42px;
  }
}
</style>
