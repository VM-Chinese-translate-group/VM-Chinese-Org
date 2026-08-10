export type TranslationFeedbackWidgetLocale = 'zh-CN' | 'zh-TW' | 'en-US'

export interface TranslationFeedbackWidgetCopy {
  first: string
  messages: readonly string[]
}

export const translationFeedbackWidgetCopy: Record<
  TranslationFeedbackWidgetLocale,
  TranslationFeedbackWidgetCopy
> = {
  'zh-CN': {
    first: '没有想要的汉化？点我给汉化组提建议',
    messages: [
      '整合包、地图，还是别的 Minecraft 内容？都可以提！',
      '别让好内容只有英文，来给汉化组找点事吧。',
      '没有想要的汉化？来看看别人都在提什么吧。',
    ],
  },
  'zh-TW': {
    first: '沒有想要的漢化？點我給漢化組提建議',
    messages: [
      '模組包、地圖，還是其他 Minecraft 內容？都可以提！',
      '別讓好項目只有英文，來給漢化組找點事吧。',
      '沒有想要的漢化？來看看別人都在提什麼吧。',
    ],
  },
  'en-US': {
    first: 'Don’t see a translation you want? Click me to suggest one to the translation group.',
    messages: [
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
