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

interface ConvertedText {
  converted: string
  source: string
}

const originalTextMap = new WeakMap<Text, ConvertedText>()

function shouldConvertTextNode(node: Text) {
  const value = node.nodeValue
  if (!value?.trim()) return false

  const parent = node.parentElement
  if (!parent) return true

  return !parent.closest('script, style, noscript')
}

function getTextNodes(root: Element) {
  const nodes: Text[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return shouldConvertTextNode(node as Text)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT
    },
  })

  let node: Node | null
  while ((node = walker.nextNode())) {
    nodes.push(node as Text)
  }

  return nodes
}

export async function convertMarkdownContainers(targetLocale: string, root?: HTMLElement) {
  const containers = root ? [root] : document.querySelectorAll('.markdown-body')

  if (!containers.length) return

  if (targetLocale === 'zh-TW') {
    const converter = await getConverter()

    containers.forEach((el) => {
      for (const textNode of getTextNodes(el)) {
        const current = textNode.nodeValue || ''
        const previous = originalTextMap.get(textNode)
        const source = previous && current === previous.converted ? previous.source : current
        const converted = converter(source)

        originalTextMap.set(textNode, { source, converted })
        textNode.nodeValue = converted
      }
    })
  } else {
    containers.forEach((el) => {
      for (const textNode of getTextNodes(el)) {
        const original = originalTextMap.get(textNode)

        if (original) {
          textNode.nodeValue = original.source
          originalTextMap.delete(textNode)
        }
      }
    })
  }
}
