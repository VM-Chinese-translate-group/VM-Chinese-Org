import MarkdownIt from 'markdown-it'
import { convertInlineTextIfNeeded } from './zhconv'
import i18n from '@/plugins/i18n'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

export async function renderMarkdown(text: string): Promise<string> {
  const locale = (i18n.global as any).locale?.value ?? 'zh-CN'
  const converted = convertInlineTextIfNeeded(text, locale)
  return md.renderInline(converted)
}

export function renderMarkdownSync(text: string): string {
  return md.renderInline(text)
}
