<template>
  <main class="feedback-page">
    <div class="feedback-content">
      <section class="feedback-hero">
        <div class="min-w-0">
          <p class="feedback-kicker">{{ $t('translationFeedback.kicker') }}</p>
          <h1 class="m-0 mb-[0.45rem] text-[clamp(1.65rem,3.4vw,2.25rem)] text-[var(--text-dark)]">
            {{ $t('translationFeedback.title') }}
          </h1>
          <p class="m-0 max-w-[42rem] text-[0.94rem] leading-[1.7] text-[var(--text-2)]">
            {{ $t('translationFeedback.intro') }}
          </p>
        </div>
        <button
          class="feedback-primary min-h-12 whitespace-nowrap px-[1.15rem] py-[0.78rem] lt-sm:w-full"
          type="button"
          @click="showForm = !showForm"
        >
          <Icon :icon="showForm ? 'lucide:chevron-up' : 'lucide:plus'" aria-hidden="true" />
          {{
            showForm ? $t('translationFeedback.closeForm') : $t('translationFeedback.submitButton')
          }}
        </button>
      </section>

      <section
        v-if="showForm"
        class="feedback-panel scroll-mt-20"
        aria-labelledby="feedback-form-title"
      >
        <div class="feedback-flex-between lt-sm:items-stretch lt-sm:flex-col">
          <div>
            <p class="feedback-kicker">{{ $t('translationFeedback.formKicker') }}</p>
            <h2 id="feedback-form-title" class="m-0 text-[1.35rem] text-[var(--text-dark)]">
              {{ $t('translationFeedback.formTitle') }}
            </h2>
          </div>
        </div>

        <form class="mt-[1.4rem] grid gap-[1.15rem]" @submit.prevent="submitForm">
          <div
            class="grid grid-cols-[minmax(12rem,0.42fr)_minmax(0,1.58fr)] items-start gap-5 lt-sm:grid-cols-1"
          >
            <label class="feedback-field">
              <span class="feedback-field-label">
                {{ $t('translationFeedback.categoryLabel') }}
              </span>
              <select
                v-model="form.category"
                class="feedback-input min-h-[2.8rem] cursor-pointer"
                @change="resetFormSubtypes"
              >
                <option v-for="category in categories" :key="category" :value="category">
                  {{ $t(`translationFeedback.categories.${category}`) }}
                </option>
              </select>
            </label>

            <fieldset
              class="m-0 grid min-w-0 grid-cols-[repeat(auto-fit,minmax(7.4rem,1fr))] gap-[0.6rem] border-0 p-0"
            >
              <legend
                class="col-span-full m-0 mb-[0.2rem] w-full text-[0.84rem] font-750 tracking-[0.01em] text-[var(--text-dark)]"
              >
                {{ $t('translationFeedback.typeLabel') }}
              </legend>
              <label
                v-for="subtype in subtypeOptions"
                :key="subtype"
                class="feedback-type-option"
                :class="{ 'feedback-type-option-selected': form.subtypes.includes(subtype) }"
              >
                <input
                  v-model="form.subtypes"
                  class="m-0 h-4 w-4 accent-[var(--btn-primary-bg)]"
                  type="checkbox"
                  :value="subtype"
                />
                <span>{{ $t(`translationFeedback.types.${form.category}.${subtype}`) }}</span>
              </label>
            </fieldset>
          </div>

          <label class="feedback-field">
            <span class="feedback-field-label">
              {{ $t('translationFeedback.originalNameLabel') }}
            </span>
            <input
              v-model.trim="form.originalName"
              class="feedback-input"
              maxlength="120"
              required
              :placeholder="$t('translationFeedback.originalNamePlaceholder')"
              @blur="scheduleSuggestions"
            />
          </label>

          <div v-if="suggestions.length" class="feedback-suggestions" role="status">
            <p class="m-0 mb-[0.15rem] font-700 text-[var(--info-1)]">
              {{ $t('translationFeedback.suggestionsTitle') }}
            </p>
            <button
              v-for="candidate in suggestions"
              :key="candidate.id"
              class="feedback-suggestion"
              :class="{
                'feedback-suggestion-selected': form.selectedExistingItemId === candidate.id,
              }"
              type="button"
              @click="selectSuggestion(candidate.id)"
            >
              <span class="grid gap-[0.2rem]">
                <strong>{{ candidate.displayName }}</strong>
                <small class="font-normal text-[var(--text-muted)]">
                  {{ suggestionReason(candidate.reason) }}
                </small>
              </span>
              <Icon
                :icon="
                  form.selectedExistingItemId === candidate.id
                    ? 'lucide:check-circle-2'
                    : 'lucide:circle'
                "
                aria-hidden="true"
              />
            </button>
            <button
              v-if="form.selectedExistingItemId"
              class="feedback-dashed"
              type="button"
              @click="form.selectedExistingItemId = undefined"
            >
              {{ $t('translationFeedback.createNewInstead') }}
            </button>
          </div>

          <div class="feedback-field">
            <div class="feedback-flex-between lt-sm:items-start lt-sm:flex-col lt-sm:gap-1">
              <span class="feedback-field-label">
                {{ $t('translationFeedback.sourceUrlLabel') }}
              </span>
            </div>
            <div class="feedback-source-notice" role="note">
              <Icon
                class="mt-[0.08rem] shrink-0 text-[1.05rem] text-[var(--info-1)]"
                icon="lucide:info"
                aria-hidden="true"
              />
              <strong>{{ $t('translationFeedback.sourceUrlHint') }}</strong>
            </div>
            <div class="feedback-url-list">
              <div v-for="(_, index) in form.urls" :key="index" class="feedback-url-row">
                <span
                  class="inline-flex h-[1.65rem] w-[1.65rem] flex-[0_0_1.65rem] items-center justify-center rounded-[0.5rem] bg-[var(--info-soft)] text-[0.75rem] font-800 text-[var(--info-1)]"
                  aria-hidden="true"
                >
                  {{ index + 1 }}
                </span>
                <input
                  v-model.trim="form.urls[index]"
                  class="feedback-input min-w-0"
                  type="url"
                  :required="index === 0 && !form.selectedExistingItemId"
                  :placeholder="$t('translationFeedback.sourceUrlPlaceholder')"
                  @blur="scheduleSuggestions"
                />
                <button
                  v-if="index > 0"
                  class="feedback-icon-button"
                  type="button"
                  :aria-label="$t('translationFeedback.removeUrl')"
                  @click="removeUrl(index)"
                >
                  <Icon icon="lucide:minus" aria-hidden="true" />
                </button>
              </div>
            </div>
            <button
              v-if="form.urls.length < 3"
              class="feedback-dashed"
              type="button"
              @click="form.urls.push('')"
            >
              <Icon icon="lucide:plus" aria-hidden="true" />
              {{ $t('translationFeedback.addUrl') }}
            </button>
          </div>

          <label class="feedback-field">
            <span class="feedback-field-label">{{ $t('translationFeedback.noteLabel') }}</span>
            <textarea
              v-model.trim="form.note"
              class="feedback-input"
              maxlength="500"
              rows="3"
              :placeholder="$t('translationFeedback.notePlaceholder')"
            />
          </label>

          <p v-if="formError" class="m-0 text-[#b42318]" role="alert">{{ formError }}</p>
          <p v-if="formSuccess" class="m-0 text-[var(--tip-1)]" role="status">
            {{ formSuccess }}
          </p>

          <button
            class="feedback-primary w-fit min-w-40 min-h-[2.85rem] px-4 py-3 lt-sm:w-full"
            type="submit"
            :disabled="submitting"
          >
            <Icon
              :icon="
                submitting
                  ? 'lucide:loader-circle'
                  : form.selectedExistingItemId
                    ? 'lucide:heart-plus'
                    : 'lucide:send'
              "
              :class="{ 'animate-spin motion-reduce:animate-none': submitting }"
              aria-hidden="true"
            />
            {{
              submitting
                ? $t('translationFeedback.submitting')
                : form.selectedExistingItemId
                  ? $t('translationFeedback.voteExisting')
                  : $t('translationFeedback.submitAction')
            }}
          </button>
        </form>
      </section>

      <section class="feedback-panel" aria-labelledby="feedback-list-title">
        <div class="feedback-flex-between lt-sm:items-stretch lt-sm:flex-col">
          <div>
            <p class="feedback-kicker">{{ $t('translationFeedback.listKicker') }}</p>
            <h2 id="feedback-list-title" class="m-0 text-[1.35rem] text-[var(--text-dark)]">
              {{ $t('translationFeedback.listTitle') }}
            </h2>
          </div>
          <button
            class="feedback-refresh lt-sm:w-full"
            type="button"
            :disabled="loading"
            @click="loadItems"
          >
            <Icon
              icon="lucide:refresh-cw"
              :class="{ 'animate-spin motion-reduce:animate-none': loading }"
              aria-hidden="true"
            />
            {{ $t('translationFeedback.refresh') }}
          </button>
        </div>

        <div
          class="feedback-tabs"
          role="tablist"
          :aria-label="$t('translationFeedback.categoryLabel')"
        >
          <button
            v-for="category in categories"
            :key="category"
            class="feedback-tab"
            :class="{ 'feedback-tab-active': selectedCategory === category }"
            type="button"
            role="tab"
            :aria-selected="selectedCategory === category"
            @click="selectCategory(category)"
          >
            {{ $t(`translationFeedback.categories.${category}`) }}
          </button>
        </div>

        <div
          class="feedback-tabs feedback-type-tabs"
          role="tablist"
          :aria-label="$t('translationFeedback.typeLabel')"
        >
          <button
            class="feedback-tab"
            :class="{ 'feedback-tab-active': !selectedSubtype }"
            type="button"
            @click="selectedSubtype = ''"
          >
            {{ $t('translationFeedback.allTypes') }}
          </button>
          <button
            v-for="subtype in activeSubtypeOptions"
            :key="subtype"
            class="feedback-tab"
            :class="{ 'feedback-tab-active': selectedSubtype === subtype }"
            type="button"
            @click="selectedSubtype = subtype"
          >
            {{ $t(`translationFeedback.types.${selectedCategory}.${subtype}`) }}
          </button>
        </div>

        <p v-if="error" class="feedback-state text-[#b42318]" role="alert">{{ error }}</p>
        <p v-else-if="loading && !items.length" class="feedback-state">
          {{ $t('translationFeedback.loading') }}
        </p>
        <p v-else-if="!items.length" class="feedback-state">
          {{ $t('translationFeedback.empty') }}
        </p>

        <div v-else class="feedback-grid">
          <article v-for="item in paginatedItems" :key="item.id" class="feedback-card">
            <div class="relative aspect-video bg-[var(--bg-soft)] image-loading-frame">
              <img
                :src="item.coverUrl || '/imgs/missing.png'"
                :alt="item.displayName"
                class="feedback-cover"
                loading="lazy"
                @error="onCoverError"
              />
              <span
                class="absolute left-[0.65rem] top-[0.65rem] z-4 rounded-full bg-[rgb(17_24_39_/_78%)] px-2 py-1 text-[0.78rem] font-750 text-white"
              >
                #{{ item.rank }}
              </span>
            </div>
            <div class="grid gap-[0.6rem] p-4">
              <div class="feedback-card-meta">
                <span class="feedback-meta">
                  {{ $t(`translationFeedback.categories.${item.category}`) }}
                </span>
                <span v-for="subtype in item.subtypes" :key="subtype" class="feedback-meta">
                  {{ $t(`translationFeedback.types.${item.category}.${subtype}`) }}
                </span>
              </div>
              <h3 class="m-0 text-[1.08rem] text-[var(--text-dark)]">{{ item.displayName }}</h3>
              <p class="m-0 text-[0.78rem] text-[var(--text-muted)]">
                {{ $t(`translationFeedback.status.${item.status}`) }}
              </p>
              <div class="feedback-flex-between">
                <span
                  class="inline-flex items-center gap-[0.3rem] text-[0.9rem] font-700 text-[var(--text-medium)]"
                >
                  <Icon icon="lucide:heart" aria-hidden="true" />
                  {{ item.voteCount }}
                </span>
                <button
                  class="feedback-primary min-h-[2.35rem] px-[0.7rem] py-2 text-[0.82rem]"
                  :class="{ 'feedback-vote-active': item.votedByCurrentVisitor }"
                  type="button"
                  :disabled="votingIds.has(item.id)"
                  :aria-busy="votingIds.has(item.id)"
                  @click="toggleVote(item)"
                >
                  <Icon
                    :icon="item.votedByCurrentVisitor ? 'lucide:heart' : 'lucide:heart-plus'"
                    aria-hidden="true"
                  />
                  {{
                    item.votedByCurrentVisitor
                      ? $t('translationFeedback.unlike')
                      : $t('translationFeedback.like')
                  }}
                </button>
              </div>
              <div v-if="item.sources.length" class="flex flex-wrap gap-[0.4rem]">
                <a
                  v-for="source in item.sources"
                  :key="source.url"
                  class="feedback-source-link"
                  :href="source.url"
                  target="_blank"
                  rel="noopener"
                >
                  {{ source.platform }}
                </a>
              </div>
            </div>
          </article>
        </div>
        <nav
          v-if="!error && items.length && pageCount > 1"
          class="feedback-pagination"
          :aria-label="$t('translationFeedback.pagination')"
        >
          <button
            class="feedback-page-arrow"
            type="button"
            :disabled="currentPage === 1"
            :aria-label="$t('translationFeedback.previousPage')"
            @click="goToPage(currentPage - 1)"
          >
            <Icon icon="lucide:chevron-left" aria-hidden="true" />
          </button>
          <button
            v-for="page in pageCount"
            :key="page"
            class="feedback-page-button"
            :class="{ 'feedback-page-button-active': currentPage === page }"
            type="button"
            :aria-current="currentPage === page ? 'page' : undefined"
            :aria-label="$t('translationFeedback.page', { page })"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <button
            class="feedback-page-arrow"
            type="button"
            :disabled="currentPage === pageCount"
            :aria-label="$t('translationFeedback.nextPage')"
            @click="goToPage(currentPage + 1)"
          >
            <Icon icon="lucide:chevron-right" aria-hidden="true" />
          </button>
        </nav>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  listFeedbackItems,
  submitFeedback,
  suggestFeedbackItems,
  toggleFeedbackVote,
} from '@/api/translationFeedback'
import type { FeedbackCandidate, FeedbackCategory, FeedbackItem } from '@/types/translationFeedback'

const { t } = useI18n()

const PAGE_SIZE = 18
const categories: FeedbackCategory[] = ['modpack', 'map', 'other']
const subtypeMap: Record<FeedbackCategory, string[]> = {
  modpack: ['technology', 'adventure', 'kitchen_sink', 'magic', 'other'],
  map: ['puzzle', 'minigame', 'adventure', 'horror', 'parkour', 'other'],
  other: ['other'],
}

const selectedCategory = ref<FeedbackCategory>('modpack')
const selectedSubtype = ref('')
const items = ref<FeedbackItem[]>([])
const currentPage = ref(1)
const suggestions = ref<FeedbackCandidate[]>([])
const showForm = ref(false)
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const formError = ref('')
const formSuccess = ref('')
const votingIds = reactive(new Set<string>())
let suggestionTimer: ReturnType<typeof setTimeout> | undefined
let itemsRequestId = 0
let suggestionRequestId = 0
let itemsController: AbortController | undefined
let suggestionController: AbortController | undefined

const form = reactive({
  category: 'modpack' as FeedbackCategory,
  subtypes: ['technology'],
  originalName: '',
  urls: [''],
  note: '',
  selectedExistingItemId: undefined as string | undefined,
})

const activeSubtypeOptions = computed(() => subtypeMap[selectedCategory.value])
const subtypeOptions = computed(() => subtypeMap[form.category])
const pageCount = computed(() => Math.max(1, Math.ceil(items.value.length / PAGE_SIZE)))
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return items.value.slice(start, start + PAGE_SIZE)
})

watch([selectedCategory, selectedSubtype], () => {
  currentPage.value = 1
  void loadItems()
})
watch(pageCount, (count) => {
  if (currentPage.value > count) currentPage.value = count
})
watch(
  () => [form.category, form.subtypes.join(','), form.originalName, form.urls.join('\u0000')],
  (values, previousValues) => {
    if (previousValues && values.some((value, index) => value !== previousValues[index])) {
      form.selectedExistingItemId = undefined
    }
    scheduleSuggestions()
  },
)

onMounted(() => void loadItems())
onBeforeUnmount(() => {
  window.clearTimeout(suggestionTimer)
  itemsController?.abort()
  suggestionController?.abort()
})

async function loadItems() {
  const requestId = ++itemsRequestId
  itemsController?.abort()
  const controller = new AbortController()
  itemsController = controller
  loading.value = true
  error.value = ''

  try {
    const result = await listFeedbackItems({
      category: selectedCategory.value,
      subtype: selectedSubtype.value || undefined,
      signal: controller.signal,
    })

    if (requestId !== itemsRequestId) return
    items.value = result.items
    currentPage.value = 1
  } catch {
    if (controller.signal.aborted || requestId !== itemsRequestId) return
    error.value = t('translationFeedback.loadError')
  } finally {
    if (requestId === itemsRequestId) {
      loading.value = false
      if (itemsController === controller) itemsController = undefined
    }
  }
}

function selectCategory(category: FeedbackCategory) {
  selectedCategory.value = category
  selectedSubtype.value = ''
}

function scheduleSuggestions() {
  window.clearTimeout(suggestionTimer)
  suggestionTimer = window.setTimeout(() => void loadSuggestions(), 180)
}

async function loadSuggestions() {
  const name = form.originalName.trim()
  const subtypes = [...form.subtypes]
  const urls = form.urls.map((url) => url.trim()).filter(Boolean)
  const requestId = ++suggestionRequestId

  suggestionController?.abort()
  if (name.length < 2 || !subtypes.length) {
    suggestions.value = []
    return
  }

  const controller = new AbortController()
  suggestionController = controller
  try {
    const result = await suggestFeedbackItems({
      category: form.category,
      subtypes,
      name,
      urls,
      signal: controller.signal,
    })
    if (requestId === suggestionRequestId) suggestions.value = result.candidates
  } catch {
    if (!controller.signal.aborted && requestId === suggestionRequestId) suggestions.value = []
  } finally {
    if (suggestionController === controller) suggestionController = undefined
  }
}

function selectSuggestion(id: string) {
  form.selectedExistingItemId = id
}

function resetFormSubtypes() {
  form.subtypes = [subtypeOptions.value[0] || 'other']
}

function removeUrl(index: number) {
  form.urls.splice(index, 1)
}

function suggestionReason(reason: FeedbackCandidate['reason']) {
  return t(`translationFeedback.suggestionReasons.${reason}`)
}

async function submitForm() {
  if (submitting.value) return

  formError.value = ''
  formSuccess.value = ''
  const originalName = form.originalName.trim()
  const urls = form.urls.map((url) => url.trim()).filter(Boolean)
  const selectedExistingItemId = form.selectedExistingItemId
  if (!originalName || (!selectedExistingItemId && !urls.length) || !form.subtypes.length) {
    formError.value = t('translationFeedback.formRequired')
    return
  }

  submitting.value = true
  try {
    if (selectedExistingItemId) {
      await toggleFeedbackVote(selectedExistingItemId, 'like')
      formSuccess.value = t('translationFeedback.existingVoteSuccess')
    } else {
      const result = await submitFeedback({
        category: form.category,
        subtypes: [...form.subtypes],
        originalName,
        urls,
        note: form.note.trim() || undefined,
      })
      formSuccess.value =
        result.result === 'merged'
          ? t('translationFeedback.mergedSuccess')
          : t('translationFeedback.createdSuccess')
    }
    form.originalName = ''
    form.urls = ['']
    form.note = ''
    form.selectedExistingItemId = undefined
    suggestions.value = []
    await loadItems()
  } catch (requestError) {
    if (selectedExistingItemId) {
      formError.value = t('translationFeedback.voteError')
      submitting.value = false
      return
    }
    const message = requestError instanceof Error ? requestError.message : ''
    formError.value = message.includes('only CurseForge')
      ? t('translationFeedback.sourceUrlError')
      : t('translationFeedback.submitError')
  } finally {
    submitting.value = false
  }
}

function goToPage(page: number) {
  currentPage.value = Math.min(Math.max(page, 1), pageCount.value)
}

async function toggleVote(item: FeedbackItem) {
  if (votingIds.has(item.id)) return

  const action = item.votedByCurrentVisitor ? 'unlike' : 'like'
  votingIds.add(item.id)
  try {
    const result = await toggleFeedbackVote(item.id, action)
    item.voteCount = result.item.voteCount
    item.votedByCurrentVisitor = result.item.votedByCurrentVisitor
    items.value = [...items.value]
      .sort((a, b) => b.voteCount - a.voteCount || a.rank - b.rank)
      .map((entry, index) => ({ ...entry, rank: index + 1 }))
  } catch {
    error.value = t('translationFeedback.voteError')
  } finally {
    votingIds.delete(item.id)
  }
}

function onCoverError(event: Event) {
  const image = event.target as HTMLImageElement
  if (!image.src.endsWith('/imgs/missing.png')) image.src = '/imgs/missing.png'
}
</script>
