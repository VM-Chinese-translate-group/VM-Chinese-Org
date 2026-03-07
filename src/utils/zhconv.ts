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

const originalMap = new WeakMap<Element, string>()

export async function convertMarkdownContainers(targetLocale: string) {
  const containers = document.querySelectorAll('.markdown-body')
  if (!containers.length) return

  if (targetLocale === 'zh-TW') {
    const converter = await getConverter()

    containers.forEach((el) => {
      if (!originalMap.has(el)) {
        originalMap.set(el, el.innerHTML)
      }

      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null)
      let node: Node | null
      while ((node = walker.nextNode())) {
        const textNode = node as Text
        if (textNode.nodeValue?.trim()) {
          textNode.nodeValue = converter(textNode.nodeValue)
        }
      }
    })
  } else {
    // 恢复简体
    containers.forEach((el) => {
      const original = originalMap.get(el)
      if (original) {
        el.innerHTML = original
        originalMap.delete(el)
      }
    })
  }
}

export async function convertInlineText(text: string, targetLocale: string): Promise<string> {
  if (targetLocale !== 'zh-TW' || !text) return text
  const converter = await getConverter()
  return converter(text)
}
