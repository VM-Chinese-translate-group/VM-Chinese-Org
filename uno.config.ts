import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  content: {
    filesystem: ['index.html', 'src/**/*.{vue,ts,js,md}'],
  },
  presets: [presetUno()],
  shortcuts: {
    'vm-link-underline':
      "relative inline-block text-[var(--text-medium)] no-underline transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-0 after:[background:var(--footer-underline-gradient)] after:transition-width after:duration-300 hover:text-[var(--footer-link-hover)] hover:after:w-full",
    'vm-card-external-icon':
      'after:content-[\'\'] after:absolute after:top-4 after:right-[18px] after:h-4 after:w-4 after:bg-[var(--text-muted)] after:opacity-40 after:[--card-icon:url("data:image/svg+xml,%3Csvg%20viewBox=%270%200%2024%2024%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath%20d=%27M6%207c0%20.55.45%201%201%201h7.59l-8.88%208.88a.996.996%200%201%200%201.41%201.41L16%209.41V17c0%20.55.45%201%201%201s1-.45%201-1V7c0-.55-.45-1-1-1H7c-.55%200-1%20.45-1%201z%27/%3E%3C/svg%3E")] after:[-webkit-mask:var(--card-icon)_no-repeat_center/contain] after:[mask:var(--card-icon)_no-repeat_center/contain]',
  },
  rules: [
    ['animate-whirling', { animation: '4s whirling linear infinite alternate' }],
  ],
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
