const customDict: [string, string][] = [
  ['整合包', '模組包'],
  ['文件夹', '資料夾'],
  ['软件', '軟體'],
  ['程序', '程式'],
  ['代码', '程式碼'],
  ['配置', '設定'],
  ['服务端', '伺服端'],
  ['服务器', '伺服器'],
]

let cachedConverter: ((text: string) => string) | null = null

async function getConverter() {
  if (cachedConverter) return cachedConverter

  const { ConverterFactory } = await import('opencc-js/core')
  const { from, to } = await import('opencc-js/preset')

  cachedConverter = ConverterFactory(from.cn, to.twp.concat([customDict]))
  return cachedConverter
}

const cache = new Map<string, string>()

export async function convertInlineText(text: string, locale: string): Promise<string> {
  if (!text || locale !== 'zh-TW') return text

  const key = locale + text
  if (cache.has(key)) return cache.get(key)!

  const converter = await getConverter()
  const result = converter(text)
  cache.set(key, result)
  return result
}

const originalMap = new WeakMap<Element, string>()

export async function convertMarkdownContainers(targetLocale: string, root?: HTMLElement) {
  const containers = root ? [root] : document.querySelectorAll('.markdown-body')

  if (!containers.length) return

  const converter = await getConverter()

  if (targetLocale === 'zh-TW') {
    containers.forEach((el) => {
      if (!originalMap.has(el)) originalMap.set(el, el.innerHTML)

      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null)
      let node: Node | null

      while ((node = walker.nextNode())) {
        const textNode = node as Text
        const rawText = textNode.nodeValue?.trim()

        if (rawText) {
          textNode.nodeValue = converter(textNode.nodeValue!)
        }
      }
    })
  } else {
    containers.forEach((el) => {
      const original = originalMap.get(el)

      if (original) {
        el.innerHTML = original
        originalMap.delete(el)
      }
    })
  }
}
