<template>
  <main
    class="box-border min-h-screen w-full bg-[var(--bg-off-white)] text-[var(--text-1)] [color-scheme:light] dark:[color-scheme:dark]"
  >
    <div class="mx-auto max-w-[1212px] px-4 pb-20 pt-10 lt-sm:px-3 lt-sm:pt-6">
      <section
        class="mb-6 flex items-center justify-between gap-4 rounded-lg border border-[var(--switcher-border)] bg-[var(--bg-white)] p-6 lt-sm:flex-col lt-sm:items-stretch lt-sm:p-4"
      >
        <div class="min-w-0">
          <p class="m-0 mb-1 text-xs font-700 uppercase tracking-wider text-[var(--info-1)]">
            {{ $t('translationFeedback.kicker') }}
          </p>
          <h1 class="m-0 mb-[0.45rem] text-[clamp(1.65rem,3.4vw,2.25rem)] text-[var(--text-dark)]">
            {{ $t('translationFeedback.title') }}
          </h1>
          <p class="m-0 max-w-[42rem] text-[0.94rem] leading-[1.7] text-[var(--text-2)]">
            {{ $t('translationFeedback.intro') }}
          </p>
        </div>
        <button
          class="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border-0 bg-[var(--btn-primary-bg)] px-5 py-3 font-inherit font-700 text-white transition-colors hover:bg-[var(--btn-primary-hover)] focus-visible:outline-2 focus-visible:outline-[var(--info-1)] focus-visible:outline-offset-2 lt-sm:w-full disabled:cursor-wait disabled:opacity-60"
          type="button"
          @click="showForm = !showForm"
        >
          <Icon :icon="showForm ? 'lucide:chevron-up' : 'lucide:plus'" aria-hidden="true" />
          {{
            showForm ? $t('translationFeedback.closeForm') : $t('translationFeedback.submitButton')
          }}
        </button>
      </section>

      <Transition name="feedback-form">
        <section
          v-if="showForm"
          class="feedback-form-panel mb-6 grid scroll-mt-20 rounded-lg border border-[var(--switcher-border)] bg-[var(--bg-white)] p-6 lt-sm:p-4"
          aria-labelledby="feedback-form-title"
        >
          <div class="feedback-form-content min-h-0 overflow-hidden">
            <div class="flex items-center justify-between gap-4 lt-sm:flex-col lt-sm:items-stretch">
              <div>
                <p class="m-0 mb-1 text-xs font-700 uppercase tracking-wider text-[var(--info-1)]">
                  {{ $t('translationFeedback.formKicker') }}
                </p>
                <h2 id="feedback-form-title" class="m-0 text-[1.35rem] text-[var(--text-dark)]">
                  {{ $t('translationFeedback.formTitle') }}
                </h2>
              </div>
            </div>

            <form class="mt-6 grid gap-6" @submit.prevent="submitForm">
              <div
                class="grid grid-cols-[minmax(13rem,0.7fr)_minmax(0,1.3fr)] items-start gap-5 lt-sm:grid-cols-1"
              >
                <label class="grid gap-1.5 text-sm font-500 text-[var(--text-dark)]">
                  <span class="text-sm font-600 text-[var(--text-dark)]">
                    {{ $t('translationFeedback.categoryLabel') }}
                  </span>
                  <SelectMenu
                    :model-value="form.category"
                    :options="categoryOptions"
                    :ariaLabel="$t('translationFeedback.categoryLabel')"
                    variant="flat"
                    style="--select-width: 100%; --select-menu-min-width: 100%"
                    @update:model-value="selectFormCategory"
                  />
                </label>

                <label class="grid gap-1.5 text-sm font-500 text-[var(--text-dark)]">
                  <span class="text-sm font-600 text-[var(--text-dark)]">
                    {{ $t('translationFeedback.originalNameLabel') }}
                  </span>
                  <input
                    v-model.trim="form.originalName"
                    class="box-border min-h-11 w-full rounded-none border-0 bg-[var(--bg-soft)] px-3 py-2.5 font-inherit text-[var(--text-dark)] [border-bottom:2px_solid_var(--switcher-border)] transition-colors placeholder:text-[var(--text-muted)] hover:[border-bottom-color:var(--info-1)] focus:outline-none focus:[border-bottom-color:var(--info-1)]"
                    maxlength="120"
                    required
                    :placeholder="$t('translationFeedback.originalNamePlaceholder')"
                    @blur="scheduleSuggestions"
                  />
                </label>

                <fieldset
                  class="m-0 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 border-0 p-0 sm:col-span-2 lt-sm:grid lt-sm:grid-cols-2 lt-sm:gap-2"
                >
                  <legend
                    class="m-0 mb-1 w-full basis-full text-sm font-600 text-[var(--text-dark)] lt-sm:col-span-2"
                  >
                    {{ $t('translationFeedback.typeLabel') }}
                  </legend>
                  <label
                    v-for="subtype in subtypeOptions"
                    :key="subtype"
                    class="inline-flex min-h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-transparent px-2.5 py-1 text-sm font-600 transition-colors focus-within:outline-2 focus-within:outline-[var(--info-1)] focus-within:outline-offset-2 lt-sm:w-full"
                    :class="
                      form.subtypes.includes(subtype)
                        ? 'bg-transparent text-[var(--info-1)]'
                        : 'bg-transparent text-[var(--text-medium)] hover:bg-[var(--switcher-item-hover)] hover:text-[var(--text-dark)]'
                    "
                  >
                    <input
                      v-model="form.subtypes"
                      class="m-0 h-4 w-4 shrink-0 cursor-pointer appearance-auto accent-[var(--info-1)]"
                      type="checkbox"
                      :value="subtype"
                    />
                    <span>{{ $t(`translationFeedback.types.${form.category}.${subtype}`) }}</span>
                  </label>
                </fieldset>
              </div>

              <div
                v-if="suggestions.length"
                class="grid gap-2 rounded-lg bg-[var(--info-soft)] p-3"
                role="status"
              >
                <p class="m-0 mb-[0.15rem] font-700 text-[var(--info-1)]">
                  {{ $t('translationFeedback.suggestionsTitle') }}
                </p>
                <button
                  v-for="candidate in suggestions"
                  :key="candidate.id"
                  class="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-[var(--switcher-border)] bg-[var(--bg-alt)] px-3 py-3 text-left font-inherit text-[var(--text-dark)] transition-colors hover:border-[var(--info-1)]"
                  :class="{
                    'border-[var(--info-1)] bg-[var(--info-soft)]':
                      form.selectedExistingItemId === candidate.id,
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
                  class="inline-flex min-h-9 w-fit cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--switcher-border)] bg-transparent px-3 py-2 font-inherit text-sm font-600 text-[var(--info-1)] hover:border-[var(--info-1)]"
                  type="button"
                  @click="form.selectedExistingItemId = undefined"
                >
                  {{ $t('translationFeedback.createNewInstead') }}
                </button>
              </div>

              <div
                class="grid items-start gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]"
              >
                <div class="grid gap-2 text-sm font-500 text-[var(--text-dark)]">
                  <div
                    class="flex items-center justify-between gap-4 lt-sm:flex-col lt-sm:items-start lt-sm:gap-1"
                  >
                    <span class="text-sm font-600 text-[var(--text-dark)]">
                      {{ $t('translationFeedback.sourceUrlLabel') }}
                    </span>
                  </div>
                  <div
                    class="flex items-start gap-2 rounded-md border-l-3 border-[var(--info-1)] bg-[var(--info-soft)] px-3 py-2.5 text-sm leading-relaxed text-[var(--text-dark)]"
                    role="note"
                  >
                    <Icon
                      class="mt-[0.08rem] shrink-0 text-[1.05rem] text-[var(--info-1)]"
                      icon="lucide:info"
                      aria-hidden="true"
                    />
                    <div class="grid gap-1">
                      <strong>{{ $t('translationFeedback.sourceUrlHint') }}</strong>
                      <strong class="text-sm leading-relaxed text-[var(--text-dark)]">
                        {{ $t('translationFeedback.sourceUrlContact') }}
                      </strong>
                    </div>
                  </div>
                  <div class="grid gap-2">
                    <div
                      v-for="(_, index) in form.urls"
                      :key="index"
                      class="flex items-center gap-2"
                    >
                      <span
                        class="inline-flex h-[1.65rem] w-[1.65rem] flex-[0_0_1.65rem] items-center justify-center rounded-[0.5rem] bg-[var(--info-soft)] text-[0.75rem] font-800 text-[var(--info-1)]"
                        aria-hidden="true"
                      >
                        {{ index + 1 }}
                      </span>
                      <div class="relative min-w-0 flex-1">
                        <input
                          v-model.trim="form.urls[index]"
                          class="box-border min-h-11 w-full rounded-none border-0 bg-[var(--bg-soft)] px-3 py-2.5 font-inherit text-[var(--text-dark)] [border-bottom:2px_solid_var(--switcher-border)] transition-colors placeholder:text-[var(--text-muted)] hover:[border-bottom-color:var(--info-1)] focus:outline-none focus:[border-bottom-color:var(--info-1)]"
                          :class="{ 'pr-12': index > 0 }"
                          type="url"
                          :required="index === 0 && !form.selectedExistingItemId"
                          :placeholder="$t('translationFeedback.sourceUrlPlaceholder')"
                          @blur="scheduleSuggestions"
                        />
                        <button
                          v-if="index > 0"
                          class="absolute inset-y-0 right-0 inline-flex w-11 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-500 focus-visible:outline-offset-[-2px] dark:text-red-400 dark:hover:bg-red-950/30"
                          type="button"
                          :aria-label="$t('translationFeedback.removeUrl')"
                          @click="removeUrl(index)"
                        >
                          <Icon class="h-5 w-5" icon="lucide:trash-2" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    v-if="form.urls.length < 3"
                    class="inline-flex min-h-9 w-fit cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-[var(--switcher-border)] bg-transparent px-3 py-2 font-inherit text-sm font-600 text-[var(--info-1)] hover:border-[var(--info-1)]"
                    type="button"
                    @click="form.urls.push('')"
                  >
                    <Icon icon="lucide:plus" aria-hidden="true" />
                    {{ $t('translationFeedback.addUrl') }}
                  </button>
                </div>

                <label class="grid gap-2 text-sm font-500 text-[var(--text-dark)]">
                  <span class="text-sm font-600 text-[var(--text-dark)]">
                    {{ $t('translationFeedback.noteLabel') }}
                  </span>
                  <textarea
                    v-model.trim="form.note"
                    class="box-border min-h-32 w-full resize-y rounded-none border-0 bg-[var(--bg-soft)] px-3 py-2.5 font-inherit text-[var(--text-dark)] [border-bottom:2px_solid_var(--switcher-border)] transition-colors placeholder:text-[var(--text-muted)] hover:[border-bottom-color:var(--info-1)] focus:outline-none focus:[border-bottom-color:var(--info-1)]"
                    maxlength="500"
                    rows="4"
                    :placeholder="$t('translationFeedback.notePlaceholder')"
                  />
                </label>
              </div>

              <p v-if="formError" class="m-0 text-red-700 dark:text-red-400" role="alert">
                {{ formError }}
              </p>
              <p v-if="formSuccess" class="m-0 text-[var(--tip-1)]" role="status">
                {{ formSuccess }}
              </p>

              <button
                class="inline-flex min-h-11 w-fit min-w-40 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-[var(--btn-primary-bg)] px-4 py-3 font-inherit font-700 text-white transition-colors hover:bg-[var(--btn-primary-hover)] focus-visible:outline-2 focus-visible:outline-[var(--info-1)] focus-visible:outline-offset-2 lt-sm:w-full disabled:cursor-wait disabled:opacity-60"
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
          </div>
        </section>
      </Transition>

      <section
        class="mb-6 rounded-lg border border-[var(--switcher-border)] bg-[var(--bg-white)] p-6 lt-sm:p-4"
        aria-labelledby="feedback-list-title"
      >
        <div class="flex items-center justify-between gap-4">
          <h2 id="feedback-list-title" class="m-0 text-[1.35rem] text-[var(--text-dark)]">
            {{ $t('translationFeedback.listTitle') }}
          </h2>
          <button
            class="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border-0 bg-[var(--btn-primary-bg)] px-3 font-inherit text-sm font-700 text-white transition-colors hover:bg-[var(--btn-primary-hover)] focus-visible:outline-2 focus-visible:outline-[var(--info-1)] focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
            type="button"
            :disabled="loading"
            :aria-busy="loading"
            @click="loadItems"
          >
            <Icon
              class="text-base"
              icon="lucide:refresh-cw"
              :class="{ 'animate-spin motion-reduce:animate-none': loading }"
              aria-hidden="true"
            />
            {{ $t('translationFeedback.refresh') }}
          </button>
        </div>

        <div
          class="mb-3 mt-5 inline-flex max-w-full flex-wrap gap-1 rounded-full bg-[var(--bg-soft)] p-1 lt-sm:grid lt-sm:w-full lt-sm:grid-cols-3"
          role="tablist"
          :aria-label="$t('translationFeedback.categoryLabel')"
        >
          <button
            v-for="category in categories"
            :key="category"
            class="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-full border-0 px-3 py-2 font-inherit transition-colors lt-sm:w-full lt-sm:px-2"
            :class="
              selectedCategory === category
                ? 'bg-[var(--info-soft)] font-700 text-[var(--info-1)]'
                : 'bg-transparent text-[var(--text-medium)] hover:bg-[var(--switcher-item-hover)] hover:text-[var(--info-1)]'
            "
            type="button"
            role="tab"
            :aria-selected="selectedCategory === category"
            @click="selectCategory(category)"
          >
            {{ $t(`translationFeedback.categories.${category}`) }}
          </button>
        </div>

        <div
          class="mb-3 ml-1 inline-flex max-w-full flex-wrap gap-1 rounded-full bg-[var(--bg-soft)] p-1 lt-sm:ml-0 lt-sm:grid lt-sm:w-full lt-sm:grid-cols-3"
          role="tablist"
          :aria-label="$t('translationFeedback.typeLabel')"
        >
          <button
            class="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-full border-0 px-3 py-2 font-inherit transition-colors lt-sm:w-full lt-sm:px-2"
            :class="
              !selectedSubtype
                ? 'bg-[var(--info-soft)] font-700 text-[var(--info-1)]'
                : 'bg-transparent text-[var(--text-medium)] hover:bg-[var(--switcher-item-hover)] hover:text-[var(--info-1)]'
            "
            type="button"
            @click="selectedSubtype = ''"
          >
            {{ $t('translationFeedback.allTypes') }}
          </button>
          <button
            v-for="subtype in activeSubtypeOptions"
            :key="subtype"
            class="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-full border-0 px-3 py-2 font-inherit transition-colors lt-sm:w-full lt-sm:px-2"
            :class="
              selectedSubtype === subtype
                ? 'bg-[var(--info-soft)] font-700 text-[var(--info-1)]'
                : 'bg-transparent text-[var(--text-medium)] hover:bg-[var(--switcher-item-hover)] hover:text-[var(--info-1)]'
            "
            type="button"
            @click="selectedSubtype = subtype"
          >
            {{ $t(`translationFeedback.types.${selectedCategory}.${subtype}`) }}
          </button>
        </div>

        <p
          v-if="error"
          class="mb-0 mt-5 rounded-lg border border-dashed border-[var(--switcher-border)] bg-[var(--bg-soft)] p-6 text-center text-red-700 dark:text-red-400"
          role="alert"
        >
          {{ error }}
        </p>
        <p
          v-else-if="loading && !items.length"
          class="mb-0 mt-5 rounded-lg border border-dashed border-[var(--switcher-border)] bg-[var(--bg-soft)] p-6 text-center text-[var(--text-muted)]"
        >
          {{ $t('translationFeedback.loading') }}
        </p>
        <p
          v-else-if="!items.length"
          class="mb-0 mt-5 rounded-lg border border-dashed border-[var(--switcher-border)] bg-[var(--bg-soft)] p-6 text-center text-[var(--text-muted)]"
        >
          {{ $t('translationFeedback.empty') }}
        </p>

        <div
          v-else
          class="mt-5 grid grid-cols-1 gap-4 min-[641px]:grid-cols-2 min-[901px]:grid-cols-3"
        >
          <article
            v-for="item in paginatedItems"
            :key="item.id"
            class="min-w-0 overflow-hidden rounded-lg border border-[var(--switcher-border)] bg-[var(--bg-white)] transition-colors hover:border-[var(--info-1)]"
          >
            <div class="relative aspect-video bg-[var(--bg-soft)] image-loading-frame">
              <img
                :src="item.coverUrl || '/imgs/missing.png'"
                :alt="item.displayName"
                class="block h-full w-full object-cover [filter:var(--content-image-filter)]"
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
              <div class="flex flex-wrap gap-2">
                <span class="rounded bg-[var(--info-soft)] px-2 py-1 text-xs text-[var(--info-1)]">
                  {{ $t(`translationFeedback.categories.${item.category}`) }}
                </span>
                <span
                  v-for="subtype in item.subtypes"
                  :key="subtype"
                  class="rounded bg-[var(--info-soft)] px-2 py-1 text-xs text-[var(--info-1)]"
                >
                  {{ $t(`translationFeedback.types.${item.category}.${subtype}`) }}
                </span>
              </div>
              <h3 class="m-0 text-[1.08rem] text-[var(--text-dark)]">{{ item.displayName }}</h3>
              <p class="m-0 text-[0.78rem] text-[var(--text-muted)]">
                {{ $t(`translationFeedback.status.${item.status}`) }}
              </p>
              <div class="flex items-center justify-between gap-4">
                <span
                  class="inline-flex items-center gap-[0.3rem] text-[0.9rem] font-700 text-[var(--text-medium)]"
                >
                  <Icon icon="lucide:heart" aria-hidden="true" />
                  {{ item.voteCount }}
                </span>
                <button
                  class="inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-[var(--btn-primary-bg)] px-3 py-2 font-inherit text-sm font-700 text-white transition-colors hover:bg-[var(--btn-primary-hover)] disabled:cursor-wait disabled:opacity-60"
                  :class="{
                    'bg-[var(--tip-1)] hover:bg-[var(--tip-1)] dark:text-[#10251b]':
                      item.votedByCurrentVisitor,
                  }"
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
                  class="inline-flex min-h-7 items-center rounded border border-[var(--switcher-border)] bg-[var(--link-bg)] px-2 py-1 text-xs font-500 text-[var(--info-1)] no-underline hover:border-[var(--info-1)] hover:bg-[var(--link-bg-hover)]"
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
          class="mt-5 flex items-center justify-center gap-2 lt-sm:gap-1"
          :aria-label="$t('translationFeedback.pagination')"
        >
          <button
            class="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-lg border border-[var(--switcher-border)] bg-[var(--bg-alt)] px-3 py-2 text-sm text-[var(--text-medium)] hover:border-[var(--btn-primary-bg)] hover:text-[var(--info-1)] lt-sm:px-2 disabled:cursor-not-allowed disabled:opacity-60"
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
            class="inline-flex min-h-9 min-w-9 cursor-pointer items-center justify-center rounded-lg border border-[var(--switcher-border)] bg-[var(--bg-alt)] px-2 py-2 text-sm text-[var(--text-medium)] hover:border-[var(--btn-primary-bg)] hover:text-[var(--info-1)]"
            :class="{
              'border-[var(--btn-primary-bg)] bg-[var(--info-soft)] text-[var(--info-1)]':
                currentPage === page,
            }"
            type="button"
            :aria-current="currentPage === page ? 'page' : undefined"
            :aria-label="$t('translationFeedback.page', { page })"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <button
            class="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-lg border border-[var(--switcher-border)] bg-[var(--bg-alt)] px-3 py-2 text-sm text-[var(--text-medium)] hover:border-[var(--btn-primary-bg)] hover:text-[var(--info-1)] lt-sm:px-2 disabled:cursor-not-allowed disabled:opacity-60"
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
import SelectMenu from '@/components/SelectMenu.vue'
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
let suggestionTimer: number | undefined
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
const categoryOptions = computed(() =>
  categories.map((category) => ({
    label: t(`translationFeedback.categories.${category}`),
    value: category,
  })),
)
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

function selectFormCategory(category: FeedbackCategory) {
  form.category = category
  resetFormSubtypes()
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

<style scoped>
.feedback-form-enter-active,
.feedback-form-leave-active {
  grid-template-rows: 1fr;
  overflow: hidden;
  opacity: 1;
  transition:
    grid-template-rows 280ms ease,
    opacity 220ms ease,
    margin-bottom 280ms ease,
    padding 280ms ease,
    border-width 280ms ease;
}

.feedback-form-enter-from,
.feedback-form-leave-to {
  grid-template-rows: 0fr;
  margin-bottom: 0;
  border-width: 0;
  padding-block: 0;
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .feedback-form-enter-active,
  .feedback-form-leave-active {
    transition: none;
  }
}
</style>
