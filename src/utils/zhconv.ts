import { ConverterFactory } from 'opencc-js/core'
import { from, to } from 'opencc-js/preset'

const customTerms: Record<string, string> = {
  整合包: '模組包',
  文件夹: '資料夾',
  软件: '軟體',
  程序: '程式',
  代码: '程式碼',
  配置: '設定',
  服务端: '伺服端',
  服务器: '伺服器',
}

const termConverter = (text: string) => {
  let result = text
  for (const [key, value] of Object.entries(customTerms)) {
    result = result.replaceAll(key, value)
  }
  return result
}

const standardConverter = ConverterFactory(from.cn, to.tw)

const converter = (text: string) => {
  if (!text) return text
  return standardConverter(termConverter(text))
}

const originalMap = new WeakMap<Element, string>()

function walkAndConvert(root: Element) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
  let node: Node | null

  while ((node = walker.nextNode())) {
    const textNode = node as Text
    const val = textNode.nodeValue
    if (val && val.trim()) {
      try {
        textNode.nodeValue = converter(val)
      } catch (e) {
        // 转换失败则保持原样
      }
    }
  }
}

export function convertMarkdownContainers(targetLocale: string) {
  const containers = document.querySelectorAll('.markdown-body')
  if (!containers.length) return

  if (targetLocale === 'zh-TW') {
    containers.forEach((el) => {
      if (!originalMap.has(el)) {
        originalMap.set(el, el.innerHTML)
      }
      walkAndConvert(el)
    })
  } else {
    containers.forEach((el) => {
      const original = originalMap.get(el)
      if (original !== undefined) {
        el.innerHTML = original
        originalMap.delete(el)
      }
    })
  }
}

export function convertInlineTextIfNeeded(text: string, targetLocale: string): string {
  if (targetLocale !== 'zh-TW' || !text) return text
  try {
    return converter(text)
  } catch (e) {
    return text
  }
}

export default {
  convertMarkdownContainers,
  convertInlineTextIfNeeded,
}
