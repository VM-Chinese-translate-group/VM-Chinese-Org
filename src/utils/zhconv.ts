import { ConverterFactory } from 'opencc-js/core'
import { from, to } from 'opencc-js/preset'

const converter = ConverterFactory(from.cn, to.tw)

const originalMap = new WeakMap<Element, string>()

function walkAndConvert(root: Element) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
  let node: Node | null

  // 边遍历边转换，减少中间数组 [nodesToChange] 的内存占用
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
      // 仅在首次转换前备份
      if (!originalMap.has(el)) {
        originalMap.set(el, el.innerHTML)
      }
      walkAndConvert(el)
    })
  } else {
    // 恢复原始内容并清理内存
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
