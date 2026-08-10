export type TranslationFeedbackWidgetLocale = 'zh-CN' | 'zh-TW' | 'en-US'

export interface TranslationFeedbackWidgetCopy {
  first: string
  messages: readonly string[]
}

/**
 * Keep the helper's rotating copy in one small, easy-to-edit configuration
 * file instead of burying it in the larger locale dictionaries.
 */
export const translationFeedbackWidgetCopy: Record<
  TranslationFeedbackWidgetLocale,
  TranslationFeedbackWidgetCopy
> = {
  'zh-CN': {
    first: '发现想汉化的内容了吗？点我去告诉汉化组。',
    messages: [
      '你知道吗？我叫捂脸，是这个网站的主开发者。',
      '整合包、地图，还是别的 Minecraft 内容？都可以提！',
      '别让好内容只有英文，来给汉化组找点事吧。',
      '没有想汉化的内容？来看看别人都在提什么吧。',
    ],
  },
  'zh-TW': {
    first: '發現想漢化的項目了嗎？點我去告訴漢化組。',
    messages: [
      '你知道嗎？我叫捂臉，是這個網站的主開發者。',
      '模組包、地圖，還是其他 Minecraft 內容？都可以提！',
      '別讓好項目只有英文，來給漢化組找點事吧。',
      '沒有想漢化的項目？來看看別人都在提什麼吧。',
    ],
  },
  'en-US': {
    first: 'Found a project we should translate? Click me to tell the translation group.',
    messages: [
      'I’m Wulian233, the main developer of this website.',
      'Modpack, map, or another Minecraft project? Send it our way!',
      'Found something great that is only in English? Send it to us.',
      'Don’t have a project in mind? Check out what others are suggesting.',
    ],
  },
}

export function getTranslationFeedbackWidgetCopy(locale: string) {
  return (
    translationFeedbackWidgetCopy[locale as TranslationFeedbackWidgetLocale] ??
    translationFeedbackWidgetCopy['zh-CN']
  )
}
