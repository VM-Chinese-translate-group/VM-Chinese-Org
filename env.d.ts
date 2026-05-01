declare module 'markdown-it-table-of-contents';

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.md' {
  import type { ComponentOptions } from 'vue'
  const Component: ComponentOptions
  export default Component
}

declare module 'virtual:search-index' {
  export const searchIndex: Array<{
    url: string
    title: string
    titleTW: string
    text: string
    textTW: string
  }>
}

declare module 'virtual:resources' {
  export const modpacks: any[]
  export const maps: any[]
}

declare module 'opencc-js/core' {
  export function ConverterFactory(from: any, to: any): (text: string) => string;
}

declare module 'opencc-js/preset' {
  export const from: { cn: any; tw: any; hk: any; [key: string]: any };
  export const to: { cn: any; tw: any; hk: any; [key: string]: any };
}
