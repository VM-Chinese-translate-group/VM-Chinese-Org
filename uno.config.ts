import { defineConfig } from 'unocss'
import { presetWind3 } from '@unocss/preset-wind3'

export default defineConfig({
  content: {
    filesystem: ['index.html', 'src/**/*.{vue,ts,js,md}'],
  },
  presets: [presetWind3()],
  shortcuts: {
    'vm-link-underline':
      "relative inline-block text-[var(--text-medium)] no-underline transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-0 after:[background:var(--footer-underline-gradient)] after:transition-width after:duration-300 hover:text-[var(--footer-link-hover)] hover:after:w-full",
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
