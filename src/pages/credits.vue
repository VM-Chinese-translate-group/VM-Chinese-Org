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
              <span v-if="person.nickname" class="person-nickname">（{{ person.nickname }}）</span>
            </a>

            <span v-else class="person-main">
              <strong>{{ person.displayName }}</strong>
              <span v-if="person.nickname" class="person-nickname">（{{ person.nickname }}）</span>
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
    spaceUrl: uidText ? `https://space.bilibili.com/${encodeURIComponent(uidText)}` : '',
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
    const response = await fetch(`https://vmct-cn.top/api/bilibili/?uid=${encodeURIComponent(uid)}`)

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
@import '@/styles/Credits.css';
</style>
