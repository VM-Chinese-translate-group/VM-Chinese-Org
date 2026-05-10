<template>
  <div class="flex flex-1 items-center justify-center bg-[var(--bg-white)] px-5 py-10 text-center">
    <div class="max-w-130">
      <h1 class="m-0 text-30 font-700 text-[var(--brand-primary)]">404</h1>

      <p class="my-2.5 text-7 text-[var(--text-dark)]">
        {{ $t('notFound.title') }}
      </p>

      <p class="mb-7.5 text-4 text-[var(--text-muted)]">
        {{ $t('notFound.desc') }}
      </p>

      <p class="mb-7.5 text-4 text-[var(--text-muted)]">
        {{ $t('notFound.hint') }}
      </p>

      <router-link
        to="/"
        class="inline-block rounded-2 bg-[var(--btn-primary-bg)] px-6.5 py-3 font-500 text-white no-underline hover:bg-[var(--btn-primary-hover)] active:bg-[var(--btn-primary-active)]"
      >
        {{ $t('notFound.backHome') }}
      </router-link>
    </div>
  </div>
</template>
