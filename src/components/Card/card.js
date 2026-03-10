import { container } from '@mdit/plugin-container'

const CARD_PROPS = ['title', 'desc', 'logo', 'link']

function isPlainObject(val) {
  return typeof val === 'object' && val !== null && !Array.isArray(val)
}

function isString(val) {
  return typeof val === 'string'
}

function stringifyProp(obj) {
  return JSON.stringify(obj).replace(/"/g, '&quot;')
}

function parseYAML(str) {
  const result = {}

  for (const line of str.split('\n')) {
    const l = line.trim()
    if (!l || l.startsWith('#')) continue

    const i = l.indexOf(':')
    if (i === -1) continue

    const key = l.slice(0, i).trim()
    let value = l.slice(i + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    result[key] = value
  }

  return result
}

function checkCardProps(config) {
  if (isPlainObject(config) && isString(config.title)) {
    return Object.fromEntries(
      Object.entries(config).filter(([key, value]) => CARD_PROPS.includes(key) && isString(value)),
    )
  }

  return null
}

function cardRender(tokens, index, _options, { relativePath }) {
  const token = tokens[index]
  const { content, info } = token

  const language = info.trim().split(':', 2)[1] || 'yml'
  let config = null

  if (language === 'yaml' || language === 'yml') {
    try {
      config = parseYAML(content)
    } catch (err) {
      console.error('Parsing card YAML config failed:', err)
    }
  } else if (language === 'json') {
    try {
      config = JSON.parse(content)
    } catch (err) {
      console.error('Parsing card JSON config failed:', err)
    }
  } else {
    console.error(
      `Can not parse card config ${language}${relativePath ? `, found in ${relativePath}` : ''}.`,
    )
  }

  const cardData = checkCardProps(config)

  if (cardData) {
    return `<Card v-bind='${stringifyProp(cardData)}' />`
  }

  console.error(
    `Invalid card config${relativePath ? ` found in ${relativePath}` : ''}:\n${content}\n`,
  )

  return ''
}

const MarkdownItCard = (md) => {
  md.use(container, {
    name: 'card',
    openRender: () => `<div class="card-container">\n`,
  })

  const defaultFence =
    md.renderer.rules.fence ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options)
    }

  md.renderer.rules.fence = (...args) => {
    const [tokens, index, options, env] = args
    const { info } = tokens[index]

    const realInfo = info.split(':', 2)[0]?.trim() || ''

    if (realInfo === 'card') {
      return cardRender(tokens, index, options, env)
    }

    return defaultFence(...args)
  }

  md.renderer.rules.card = cardRender
}

export default MarkdownItCard
