declare module 'markdown-it-table-of-contents';

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'virtual:modpacks' {
  export const modpacks: any[]
}

declare module 'virtual:search-index' {
  export const searchIndex: Array<{
    url: string
    title: string
    text: string
  }>
}
