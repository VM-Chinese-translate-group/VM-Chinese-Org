import { defineConfig } from 'unocss'
import { presetWind3 } from 'unocss/preset-wind3'

export default defineConfig({
  content: {
    pipeline: {
      include: ['index.html', 'src/**/*.{vue,md}'],
    },
  },
  presets: [presetWind3()],
  shortcuts: {
    'vm-link-underline':
      "relative inline-block text-[var(--text-medium)] no-underline transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-0 after:[background:var(--footer-underline-gradient)] after:transition-width after:duration-300 hover:text-[var(--footer-link-hover)] hover:after:w-full",
    'feedback-page':
      'box-border min-h-screen w-full m-0 bg-[var(--bg-off-white)] text-[var(--text-1)]',
    'feedback-content': 'mx-auto max-w-[1212px] px-4 pt-10 pb-20 lt-sm:px-3 lt-sm:pt-6',
    'feedback-flex-between': 'flex items-center justify-between gap-4',
    'feedback-hero':
      'feedback-flex-between mb-6 rounded-2 border border-[var(--switcher-border)] bg-[var(--bg-white)] p-6 lt-sm:items-stretch lt-sm:flex-col lt-sm:p-4',
    'feedback-kicker':
      'm-0 mb-[0.35rem] text-[0.78rem] font-700 uppercase tracking-[0.08em] text-[var(--info-1)]',
    'feedback-action':
      'inline-flex items-center justify-center gap-[0.45rem] align-middle text-center font-inherit leading-[1.2] transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-[var(--btn-primary-bg)] focus-visible:outline-offset-2',
    'feedback-primary':
      'feedback-action cursor-pointer rounded-2 border border-transparent bg-[var(--btn-primary-bg)] font-700 text-[var(--text-white)] hover:bg-[var(--btn-primary-hover)] active:bg-[var(--btn-primary-active)] disabled:cursor-wait disabled:opacity-65 motion-reduce:transition-none',
    'feedback-secondary':
      'feedback-action cursor-pointer rounded-2 border border-[var(--switcher-border)] bg-[var(--bg-alt)] font-600 text-[var(--text-medium)] hover:border-[var(--btn-primary-bg)] hover:bg-[var(--info-soft)] hover:text-[var(--info-1)] disabled:cursor-not-allowed disabled:opacity-55 motion-reduce:transition-none',
    'feedback-panel':
      'mb-6 rounded-2 border border-[var(--switcher-border)] bg-[var(--bg-white)] p-6 lt-sm:p-4',
    'feedback-field': 'grid gap-[0.45rem] text-[0.9rem] font-500 text-[var(--text-dark)]',
    'feedback-field-label': 'text-[0.84rem] font-600 tracking-[0.01em] text-[var(--text-dark)]',
    'feedback-input':
      'box-border w-full rounded-none border-0 border-b border-b-[var(--switcher-border)] bg-transparent p-[0.7rem_0.5rem] font-inherit text-[var(--text-dark)] shadow-none transition-colors duration-150 ease-out hover:border-b-[var(--info-1)] focus:border-b-[var(--info-1)] focus:bg-transparent focus:shadow-none focus:outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-[var(--info-1)] focus-visible:outline-offset-1 motion-reduce:transition-none',
    'feedback-type-option':
      'inline-flex box-border w-full min-h-[2.8rem] items-center justify-center gap-2 cursor-pointer whitespace-nowrap rounded-2 border border-[var(--switcher-border)] bg-[var(--bg-alt)] p-[0.55rem_0.8rem] text-[0.86rem] font-500 transition-colors duration-150 ease-out hover:border-[var(--btn-primary-bg)] hover:bg-[var(--switcher-item-hover)] motion-reduce:transition-none',
    'feedback-type-option-selected':
      'border-[var(--btn-primary-bg)] bg-[var(--info-soft)] text-[var(--info-1)]',
    'feedback-source-notice':
      'flex items-start gap-[0.55rem] rounded-2 border-l-4 border-l-[var(--info-1)] bg-[var(--info-soft)] p-[0.75rem_0.85rem] text-[0.86rem] leading-[1.45] text-[var(--text-dark)]',
    'feedback-url-list': 'grid gap-[0.55rem] bg-transparent p-0',
    'feedback-url-row': 'flex items-center gap-[0.55rem]',
    'feedback-icon-button': 'feedback-secondary h-[2.4rem] w-[2.4rem] min-w-[2.4rem] p-0',
    'feedback-refresh':
      'feedback-action min-h-[2.4rem] cursor-pointer rounded-none border-0 border-b border-b-[var(--switcher-border)] bg-transparent px-2 py-2 text-[0.84rem] font-600 text-[var(--text-medium)] shadow-none hover:border-b-[var(--info-1)] hover:bg-transparent hover:text-[var(--info-1)] disabled:cursor-not-allowed disabled:opacity-55 motion-reduce:transition-none',
    'feedback-dashed':
      'feedback-action w-fit min-h-[2.3rem] cursor-pointer rounded-2 border border-dashed border-[var(--switcher-border)] bg-transparent px-[0.7rem] py-[0.48rem] font-600 text-[0.82rem] text-[var(--info-1)] hover:border-[var(--info-1)] hover:bg-[var(--info-soft)] motion-reduce:transition-none',
    'feedback-suggestions': 'grid gap-[0.55rem] rounded-2 bg-[var(--info-soft)] p-3',
    'feedback-suggestion':
      'flex items-center justify-between gap-4 cursor-pointer rounded-2 border border-[var(--switcher-border)] bg-[var(--bg-alt)] px-[0.8rem] py-[0.7rem] text-left font-inherit text-[var(--text-dark)] transition-colors duration-150 ease-out hover:border-[var(--info-1)] hover:bg-[var(--info-soft)]',
    'feedback-suggestion-selected': 'border-[var(--info-1)] bg-[var(--info-soft)]',
    'feedback-vote-active': 'bg-[var(--tip-1)] hover:bg-[var(--tip-1)]',
    'feedback-tabs':
      'mt-5 mb-3 inline-flex max-w-full flex-wrap gap-1 rounded-2 border border-[var(--switcher-border)] bg-[var(--bg-soft)] p-1 lt-sm:w-full',
    'feedback-type-tabs': 'mt-0 ml-[0.35rem] lt-sm:ml-0 lt-sm:mt-0',
    'feedback-tab':
      'feedback-action min-h-[2.25rem] cursor-pointer rounded-2 border-0 bg-transparent px-3 py-2 text-[var(--text-medium)] hover:bg-[var(--switcher-item-hover)] hover:text-[var(--info-1)] motion-reduce:transition-none',
    'feedback-tab-active': 'bg-[var(--bg-alt)] font-700 text-[var(--info-1)]',
    'feedback-grid': 'mt-5 grid grid-cols-1 gap-4 min-[641px]:grid-cols-2 min-[901px]:grid-cols-3',
    'feedback-pagination': 'mt-5 flex items-center justify-center gap-2 lt-sm:gap-1',
    'feedback-page-button':
      'feedback-secondary min-h-[2.35rem] min-w-[2.35rem] px-2 py-2 text-[0.84rem]',
    'feedback-page-button-active':
      'border-[var(--btn-primary-bg)] bg-[var(--info-soft)] text-[var(--info-1)]',
    'feedback-page-arrow': 'feedback-secondary min-h-[2.35rem] px-3 py-2 text-[0.84rem] lt-sm:px-2',
    'feedback-card':
      'min-w-0 overflow-hidden rounded-2 border border-[var(--switcher-border)] bg-[var(--bg-white)] transition-colors duration-150 ease-out hover:border-[var(--info-1)] motion-reduce:transition-none',
    'feedback-card-meta': 'flex flex-wrap gap-[0.4rem]',
    'feedback-cover':
      'block h-full w-full object-cover [filter:var(--content-image-filter)] transition-[filter] duration-200 motion-reduce:transition-none',
    'feedback-meta':
      'rounded-1 bg-[var(--info-soft)] px-[0.45rem] py-[0.2rem] text-[0.78rem] text-[var(--info-1)]',
    'feedback-source-link':
      'inline-flex min-h-[1.8rem] items-center rounded-1 border border-[var(--switcher-border)] bg-[var(--link-bg)] px-[0.55rem] py-[0.28rem] text-[0.78rem] font-500 text-[var(--info-1)] no-underline transition-colors duration-150 ease-out hover:border-[var(--info-1)] hover:bg-[var(--link-bg-hover)] motion-reduce:transition-none',
    'feedback-state':
      'mt-5 mb-0 rounded-2 border border-dashed border-[var(--switcher-border)] bg-[var(--bg-soft)] p-6 text-center text-[var(--text-muted)]',
    'feedback-widget':
      'fixed z-30 right-[max(1rem,env(safe-area-inset-right))] top-[clamp(11rem,40vh,26rem)] inline-flex min-h-12 items-center gap-[0.45rem] cursor-grab select-none touch-none rounded-full border border-[color-mix(in_srgb,#c4b5fd_62%,transparent)] bg-[color-mix(in_srgb,#7c3aed_88%,transparent)] px-2 py-1.5 pl-3 text-white shadow-[var(--vp-shadow-1)] backdrop-blur-2 transition-colors duration-150 ease-out lt-sm:right-[max(0.75rem,env(safe-area-inset-right))] lt-sm:top-[7rem] lt-sm:max-w-[calc(100vw_-_1.5rem)] lt-sm:text-[0.82rem] motion-reduce:transition-none',
    'feedback-widget-hoverable': 'hover:border-[#c4b5fd] hover:bg-[#6d28d9]',
    'feedback-widget-dragging': 'cursor-grabbing opacity-80 transition-none',
    'feedback-widget-docked': 'h-12 w-12 min-h-12 justify-center overflow-visible rounded-none p-0',
    'feedback-widget-docked-left': 'rounded-r-full',
    'feedback-widget-docked-right': 'rounded-l-full',
    'feedback-widget-docked-hoverable': 'hover:border-[#c4b5fd] hover:bg-[#6d28d9]',
    'feedback-widget-tooltip':
      'pointer-events-none invisible absolute bottom-[calc(100%+0.55rem)] left-1/2 z-40 w-max max-w-[min(18rem,calc(100vw_-_2rem))] -translate-x-1/2 rounded-3 border border-[color-mix(in_srgb,var(--text-white)_24%,transparent)] bg-[color-mix(in_srgb,var(--text-dark)_92%,transparent)] px-3 py-2 text-[0.78rem] font-500 leading-[1.35] text-[var(--text-white)] opacity-0 shadow-[var(--vp-shadow-1)] transition-opacity duration-150 group-hover:visible group-hover:opacity-100',
    'feedback-widget-main':
      'inline-flex min-h-[2.35rem] items-center justify-center gap-[0.55rem] border-0 bg-transparent px-[0.45rem] py-[0.42rem] pl-0 text-center font-inherit text-[0.9rem] font-600 leading-[1.2] text-inherit cursor-pointer whitespace-nowrap focus-visible:rounded-1 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-[var(--btn-primary-bg)] focus-visible:outline-offset-2',
    'feedback-widget-docked-main': 'h-full w-full p-0',
    'feedback-widget-close':
      'inline-flex h-[1.85rem] w-[1.85rem] items-center justify-center rounded-1 border-0 bg-transparent p-0 text-[0.9rem] text-[color-mix(in_srgb,#fff_72%,transparent)] cursor-pointer touch-manipulation focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-[#fff] focus-visible:outline-offset-2 hover:bg-[color-mix(in_srgb,#fff_18%,transparent)] hover:text-white',
  },
  rules: [['animate-whirling', { animation: '4s whirling linear infinite alternate' }]],
  preflights: [
    {
      getCSS: () => `
@keyframes whirling {
  from {
    transform: rotate3d(0, 1, 0, -90deg) scale(0.9);
  }
  to {
    transform: rotate3d(0, 1, 0, 90deg) scale(1);
  }
}
`,
    },
  ],
})
