export interface Env {
  FEEDBACK_DB: D1Database
  ID_HASH_SECRET?: string
  CORS_ORIGINS?: string
  CURSEFORGE_API_KEY?: string
  CURSEFORGE_GAME_ID?: string
}

type Category = 'modpack' | 'map' | 'other'

const SUBTYPES: Record<Category, string[]> = {
  modpack: ['technology', 'adventure', 'kitchen_sink', 'magic', 'other'],
  map: ['puzzle', 'minigame', 'adventure', 'horror', 'parkour', 'other'],
  other: ['other'],
}

const ALLOWED_PLATFORMS = [
  { platform: 'CurseForge', hosts: ['curseforge.com'], patterns: ['/minecraft/'] },
  { platform: 'Modrinth', hosts: ['modrinth.com'], patterns: ['/'] },
  { platform: 'Planet Minecraft', hosts: ['planetminecraft.com'], patterns: ['/'] },
  { platform: 'Minecraft Maps', hosts: ['minecraftmaps.com'], patterns: ['/'] },
  { platform: 'MapVerse', hosts: ['mapverse.net', 'mapverse.gg', 'mapverse.com'], patterns: ['/'] },
]

const TRACKING_PARAMS = new Set(['fbclid', 'gclid', 'mc_cid', 'mc_eid'])
const MODRINTH_API_BASE = 'https://api.modrinth.com/v2'
const CURSEFORGE_API_BASE = 'https://api.curseforge.com/v1'
const DEFAULT_CURSEFORGE_GAME_ID = '432'
const CURSEFORGE_POPULARITY_SORT_FIELD = '2'
const COVER_REQUEST_TIMEOUT_MS = 3500

function json(data: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  })
}

function originList(env: Env) {
  return (env.CORS_ORIGINS || 'https://v4.vmct-cn.top,https://vmct-cn.top,http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

function corsHeaders(request: Request, env: Env) {
  const origin = request.headers.get('Origin')
  const headers = new Headers()
  headers.set('Vary', 'Origin')
  if (origin && originList(env).includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Access-Control-Allow-Credentials', 'true')
  }
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')
  headers.set('Access-Control-Max-Age', '86400')
  return headers
}

function withCors(response: Response, request: Request, env: Env, cookie?: string) {
  const headers = new Headers(response.headers)
  corsHeaders(request, env).forEach((value, key) => headers.set(key, value))
  if (cookie) headers.append('Set-Cookie', cookie)
  return new Response(response.body, { status: response.status, headers })
}

function parseCookie(request: Request, name: string) {
  const raw = request.headers.get('Cookie') || ''
  const pair = raw
    .split(';')
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${name}=`))
  if (!pair) return null

  try {
    return decodeURIComponent(pair.slice(name.length + 1))
  } catch {
    return null
  }
}

function createVisitorId() {
  return crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '')
}

function visitorCookie(request: Request) {
  const current = parseCookie(request, 'feedback_vid')
  if (current) return { value: current, setCookie: undefined as string | undefined }
  const value = createVisitorId()
  const requestUrl = new URL(request.url)
  const origin = request.headers.get('Origin')
  const crossSite = origin
    ? (() => {
        try {
          return new URL(origin).hostname !== requestUrl.hostname
        } catch {
          return false
        }
      })()
    : false
  const secure = requestUrl.protocol === 'https:' || crossSite ? '; Secure' : ''
  const sameSite = crossSite ? 'None' : 'Lax'
  return {
    value,
    setCookie: `feedback_vid=${encodeURIComponent(value)}; Max-Age=31536000; Path=/; HttpOnly; SameSite=${sameSite}${secure}`,
  }
}

async function hashVisitor(value: string, env: Env) {
  const bytes = new TextEncoder().encode(
    `${env.ID_HASH_SECRET || 'development-only-secret'}:${value}`,
  )
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function normalizeName(value: string) {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase()
    .trim()
    .replace(/[\s\u3000]+/g, ' ')
    .replace(/[“”"'‘’]/g, '')
    .replace(/[，。、；：！？（）【】「」]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeUrl(value: string) {
  const url = new URL(value)
  url.hash = ''
  for (const key of [...url.searchParams.keys()]) {
    if (key.toLowerCase().startsWith('utm_') || TRACKING_PARAMS.has(key.toLowerCase()))
      url.searchParams.delete(key)
  }
  url.hostname = url.hostname.toLowerCase()
  url.pathname = url.pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/'
  return url.toString()
}

function safeCoverUrl(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

async function fetchJson<T>(url: string, headers: HeadersInit = {}) {
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json', ...headers },
      signal: AbortSignal.timeout(COVER_REQUEST_TIMEOUT_MS),
    })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

type CoverResult = { platform: 'CurseForge' | 'Modrinth'; url: string }

async function fetchModrinthCover(source: {
  externalId: string | null
}): Promise<CoverResult | null> {
  if (!source.externalId) return null
  const project = await fetchJson<{ icon_url?: unknown }>(
    `${MODRINTH_API_BASE}/project/${encodeURIComponent(source.externalId)}`,
  )
  const url = safeCoverUrl(project?.icon_url)
  return url ? { platform: 'Modrinth', url } : null
}

async function fetchCurseForgeCover(
  source: { externalId: string | null },
  env: Env,
): Promise<CoverResult | null> {
  const apiKey = env.CURSEFORGE_API_KEY?.trim()
  const slug = source.externalId?.trim()
  if (!apiKey || !slug) return null

  const gameId = env.CURSEFORGE_GAME_ID?.trim() || DEFAULT_CURSEFORGE_GAME_ID
  if (!/^\d+$/.test(gameId)) return null

  const params = new URLSearchParams({
    gameId,
    searchFilter: slug,
    sortField: CURSEFORGE_POPULARITY_SORT_FIELD,
    sortOrder: 'desc',
    pageSize: '50',
  })
  const search = await fetchJson<{
    data?: Array<{
      id?: number
      slug?: string
      assets?: { coverUrl?: unknown; iconUrl?: unknown; tileUrl?: unknown }
    }>
  }>(`${CURSEFORGE_API_BASE}/mods/search?${params}`, { 'x-api-key': apiKey })
  const match = search?.data?.find((entry) => entry.slug?.toLowerCase() === slug.toLowerCase())
  const assetUrl = safeCoverUrl(match?.assets?.coverUrl)
  if (assetUrl) return { platform: 'CurseForge', url: assetUrl }

  if (typeof match?.id !== 'number') return null
  const details = await fetchJson<{
    data?: { logo?: { url?: unknown; thumbnailUrl?: unknown } }
  }>(`${CURSEFORGE_API_BASE}/mods/${match.id}`, { 'x-api-key': apiKey })
  const logoUrl = safeCoverUrl(details?.data?.logo?.url || details?.data?.logo?.thumbnailUrl)
  return logoUrl ? { platform: 'CurseForge', url: logoUrl } : null
}

async function updateMissingCover(
  env: Env,
  item: { id: string; cover_url?: string | null },
  sources: Array<{ platform: string; externalId: string | null }>,
  updatedAt: string,
) {
  if (item.cover_url) return

  for (const source of sources) {
    const cover =
      source.platform === 'Modrinth'
        ? await fetchModrinthCover(source)
        : source.platform === 'CurseForge'
          ? await fetchCurseForgeCover(source, env)
          : null
    if (!cover) continue

    try {
      await env.FEEDBACK_DB.prepare(
        "UPDATE feedback_items SET cover_url = ?, cover_platform = ?, updated_at = ? WHERE id = ? AND (cover_url IS NULL OR cover_url = '')",
      )
        .bind(cover.url, cover.platform, updatedAt, item.id)
        .run()
    } catch {
      // Cover enrichment is optional; a database update failure must not reject a submission.
    }
    return
  }
}

function platformForUrl(value: string) {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return null
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
  const hostname = url.hostname.toLowerCase().replace(/^www\./, '')
  const config = ALLOWED_PLATFORMS.find((item) =>
    item.hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`)),
  )
  if (!config || !config.patterns.some((pattern) => url.pathname.startsWith(pattern))) return null
  const parts = url.pathname.split('/').filter(Boolean)
  const disallowed = new Set([
    'search',
    'download',
    'downloads',
    'api',
    'login',
    'signup',
    'categories',
    'category',
  ])
  const last = (parts.at(-1) || '').toLowerCase()
  if (
    parts.length < 1 ||
    (config.platform === 'CurseForge' && parts.length < 3) ||
    disallowed.has(last) ||
    /\.(zip|jar|rar|7z|mcworld|exe|apk)$/i.test(last)
  )
    return null
  return { platform: config.platform, externalId: parts.at(-1) || null }
}

function safeSources(values: unknown) {
  if (!Array.isArray(values)) throw new Error('urls must be an array')
  const urls = [
    ...new Set(
      values
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ]
  if (urls.length < 1 || urls.length > 3)
    throw new Error('provide between one and three source URLs')
  return urls.map((url) => {
    const normalizedUrl = normalizeUrl(url)
    const platform = platformForUrl(normalizedUrl)
    if (!platform)
      throw new Error(
        'only CurseForge, Modrinth, Planet Minecraft, Minecraft Maps, and MapVerse URLs are supported',
      )
    return { ...platform, url, normalizedUrl }
  })
}

function validateCategory(category: unknown): asserts category is Category {
  if (category !== 'modpack' && category !== 'map' && category !== 'other')
    throw new Error('invalid category')
}

function parseSubtypes(category: unknown, value: unknown) {
  validateCategory(category)
  const values = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : []
  const subtypes = [
    ...new Set(
      values
        .filter((entry): entry is string => typeof entry === 'string')
        .map((entry) => entry.trim())
        .filter(Boolean),
    ),
  ]
  if (!subtypes.length || subtypes.some((subtype) => !SUBTYPES[category].includes(subtype)))
    throw new Error('invalid subtype')
  return subtypes
}

function similarity(left: string, right: string) {
  if (left === right) return 1
  if (!left || !right) return 0
  const grams = (value: string) =>
    new Set(
      [...value]
        .map((_, index) => value.slice(index, index + 2))
        .filter((gram) => gram.length === 2),
    )
  const a = grams(left)
  const b = grams(right)
  const intersection = [...a].filter((gram) => b.has(gram)).length
  return (2 * intersection) / (a.size + b.size || 1)
}

async function suggestions(env: Env, params: URLSearchParams) {
  const category = params.get('category') as Category
  const requestedSubtypes = parseSubtypes(
    category,
    params.get('subtypes') || params.get('subtype') || '',
  )
  const name = normalizeName(params.get('name') || '')
  if (!name) return []
  validateCategory(category)
  const result = await env.FEEDBACK_DB.prepare(
    'SELECT id, category, subtype, subtypes, display_name, normalized_name FROM feedback_items WHERE category = ? AND status != ? ORDER BY vote_count DESC, created_at ASC LIMIT 200',
  )
    .bind(category, 'hidden')
    .all<any>()
  const candidateIds = result.results.map((row: any) => row.id)
  const submittedUrls = params
    .getAll('url')
    .map((value) => {
      try {
        return normalizeUrl(value)
      } catch {
        return ''
      }
    })
    .filter(Boolean)
  const submittedPlatforms = submittedUrls
    .map((value) => ({ url: value, platform: platformForUrl(value) }))
    .filter((entry) => entry.platform)
  const sourceRowsPromise =
    candidateIds.length && submittedUrls.length
      ? env.FEEDBACK_DB.prepare(
          `SELECT item_id, normalized_url, platform, external_id FROM feedback_sources WHERE item_id IN (${candidateIds.map(() => '?').join(',')})`,
        )
          .bind(...candidateIds)
          .all<any>()
      : Promise.resolve({ results: [] })
  const aliasRowsPromise = candidateIds.length
    ? env.FEEDBACK_DB.prepare(
        `SELECT item_id, normalized_alias FROM feedback_aliases WHERE item_id IN (${candidateIds.map(() => '?').join(',')})`,
      )
        .bind(...candidateIds)
        .all<any>()
    : Promise.resolve({ results: [] })
  const [sourceRows, aliasRows] = await Promise.all([sourceRowsPromise, aliasRowsPromise])
  const sourceMap = new Map<string, any[]>()
  for (const source of sourceRows.results as any[]) {
    const list = sourceMap.get(source.item_id) || []
    list.push(source)
    sourceMap.set(source.item_id, list)
  }
  const aliasMap = new Map<string, string[]>()
  for (const alias of aliasRows.results as any[]) {
    const list = aliasMap.get(alias.item_id) || []
    list.push(String(alias.normalized_alias || ''))
    aliasMap.set(alias.item_id, list)
  }
  return result.results
    .map((row: any) => {
      const candidateSubtypes = String(row.subtypes || row.subtype || '')
        .split(',')
        .filter(Boolean)
      if (!requestedSubtypes.some((subtype) => candidateSubtypes.includes(subtype))) return null
      const score = Math.max(
        similarity(name, row.normalized_name),
        ...(aliasMap.get(row.id) || []).map((alias) => similarity(name, alias)),
      )
      const candidateSources = sourceMap.get(row.id) || []
      const exactUrl = candidateSources.find((source) =>
        submittedUrls.includes(source.normalized_url),
      )
      const samePlatformId = candidateSources.find((source) =>
        submittedPlatforms.some(
          (entry) =>
            entry.platform?.platform === source.platform &&
            entry.platform?.externalId === source.external_id,
        ),
      )
      const reason = exactUrl
        ? 'same-url'
        : samePlatformId
          ? 'platform-id'
          : score === 1
            ? 'same-name'
            : score >= 0.42
              ? 'similar-name'
              : null
      return reason ? { ...row, confidence: exactUrl || samePlatformId ? 1 : score, reason } : null
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.confidence - a.confidence)
    .slice(0, 5)
    .map((row: any) => ({
      id: row.id,
      displayName: row.display_name,
      category: row.category,
      subtypes: String(row.subtypes || row.subtype || '')
        .split(',')
        .filter(Boolean),
      confidence: row.confidence,
      reason: row.reason,
      sources: (sourceMap.get(row.id) || []).map((source: any) => ({
        platform: source.platform,
        url: source.url,
      })),
    }))
}

async function loadItems(env: Env, request: Request, visitorHash: string) {
  const url = new URL(request.url)
  const category = url.searchParams.get('category')
  const subtype = url.searchParams.get('subtype')
  const clauses = ['status != ?']
  const bindings: unknown[] = ['hidden']
  if (category) {
    clauses.push('category = ?')
    bindings.push(category)
  }
  if (subtype) {
    clauses.push("(',' || subtypes || ',') LIKE '%,' || ? || ',%'")
    bindings.push(subtype)
  }
  const rows = await env.FEEDBACK_DB.prepare(
    `SELECT id, category, subtype, subtypes, display_name, cover_url, cover_platform, vote_count, status, created_at FROM feedback_items WHERE ${clauses.join(' AND ')} ORDER BY vote_count DESC, created_at ASC LIMIT 200`,
  )
    .bind(...bindings)
    .all<any>()
  const ids = rows.results.map((row: any) => row.id)
  const [votes, sources] = await Promise.all([
    ids.length
      ? env.FEEDBACK_DB.prepare(
          `SELECT item_id FROM feedback_votes WHERE voter_hash = ? AND active = 1 AND item_id IN (${ids.map(() => '?').join(',')})`,
        )
          .bind(visitorHash, ...ids)
          .all<any>()
      : Promise.resolve({ results: [] }),
    ids.length
      ? env.FEEDBACK_DB.prepare(
          `SELECT item_id, platform, url FROM feedback_sources WHERE item_id IN (${ids.map(() => '?').join(',')}) ORDER BY is_primary DESC, created_at ASC`,
        )
          .bind(...ids)
          .all<any>()
      : Promise.resolve({ results: [] }),
  ])
  const voted = new Set(votes.results.map((row: any) => row.item_id))
  const sourceMap = new Map<string, { platform: string; url: string }[]>()
  for (const source of sources.results as any[]) {
    const list = sourceMap.get(source.item_id) || []
    list.push({ platform: source.platform, url: source.url })
    sourceMap.set(source.item_id, list)
  }
  return rows.results.map((row: any, index: number) => ({
    id: row.id,
    category: row.category,
    subtypes: String(row.subtypes || row.subtype || '')
      .split(',')
      .filter(Boolean),
    displayName: row.display_name,
    coverUrl: row.cover_url,
    coverPlatform: row.cover_platform,
    voteCount: row.vote_count,
    rank: index + 1,
    status: row.status,
    sources: sourceMap.get(row.id) || [],
    votedByCurrentVisitor: voted.has(row.id),
  }))
}

async function loadSingleItem(env: Env, id: string, visitorHash: string) {
  const result = await env.FEEDBACK_DB.prepare(
    'SELECT id, category, subtype, subtypes, display_name, cover_url, cover_platform, vote_count, status FROM feedback_items WHERE id = ?',
  )
    .bind(id)
    .first<any>()
  if (!result) throw new Error('item not found')
  const [sources, vote] = await Promise.all([
    env.FEEDBACK_DB.prepare(
      'SELECT platform, url FROM feedback_sources WHERE item_id = ? ORDER BY is_primary DESC, created_at ASC',
    )
      .bind(id)
      .all<any>(),
    env.FEEDBACK_DB.prepare(
      'SELECT 1 FROM feedback_votes WHERE item_id = ? AND voter_hash = ? AND active = 1',
    )
      .bind(id, visitorHash)
      .first(),
  ])
  return {
    id: result.id,
    category: result.category,
    subtypes: String(result.subtypes || result.subtype || '')
      .split(',')
      .filter(Boolean),
    displayName: result.display_name,
    coverUrl: result.cover_url,
    coverPlatform: result.cover_platform,
    voteCount: result.vote_count,
    rank: 0,
    status: result.status,
    sources: sources.results,
    votedByCurrentVisitor: Boolean(vote),
  }
}

async function handleSubmission(request: Request, env: Env, visitorHash: string) {
  const body = (await request.json()) as any
  if (typeof body.selectedExistingItemId === 'string')
    throw new Error('existing items must be voted for instead of submitted')
  const subtypes = parseSubtypes(body.category, body.subtypes || body.subtype)
  if (
    typeof body.originalName !== 'string' ||
    body.originalName.trim().length < 1 ||
    body.originalName.length > 120
  )
    throw new Error('originalName must be between 1 and 120 characters')
  if (typeof body.note !== 'undefined' && (typeof body.note !== 'string' || body.note.length > 500))
    throw new Error('note is too long')
  const sources = safeSources(body.urls)
  const normalizedName = normalizeName(body.originalName)
  const now = new Date().toISOString()
  let item: any = null
  let result: 'created' | 'merged' = 'created'

  if (!item) {
    const exact = await env.FEEDBACK_DB.prepare(
      `SELECT fi.* FROM feedback_items fi JOIN feedback_sources fs ON fs.item_id = fi.id WHERE fi.status != ? AND fi.category = ? AND fs.normalized_url IN (${sources.map(() => '?').join(',')}) LIMIT 1`,
    )
      .bind('hidden', body.category, ...sources.map((source) => source.normalizedUrl))
      .first<any>()
    item = exact
    if (item) result = 'merged'
  }

  if (!item) {
    const source = sources[0]
    const canonicalKey = `${source.platform.toLowerCase()}:${source.externalId || normalizedName}`
    const existing = await env.FEEDBACK_DB.prepare(
      'SELECT * FROM feedback_items WHERE canonical_key = ?',
    )
      .bind(canonicalKey)
      .first<any>()
    if (existing) {
      item = existing
      result = 'merged'
    } else {
      item = {
        id: crypto.randomUUID(),
        category: body.category,
        subtype: subtypes[0],
        subtypes: subtypes.join(','),
        canonical_key: canonicalKey,
        display_name: body.originalName.trim(),
        normalized_name: normalizedName,
        status: 'candidate',
        cover_url: null,
        cover_platform: source.platform,
        vote_count: 0,
        created_at: now,
        updated_at: now,
      }
      await env.FEEDBACK_DB.prepare(
        'INSERT INTO feedback_items (id, category, subtype, subtypes, canonical_key, display_name, normalized_name, status, cover_url, cover_platform, vote_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      )
        .bind(
          item.id,
          item.category,
          item.subtype,
          item.subtypes,
          item.canonical_key,
          item.display_name,
          item.normalized_name,
          item.status,
          null,
          item.cover_platform,
          0,
          now,
          now,
        )
        .run()
    }
  }

  for (const source of sources) {
    await env.FEEDBACK_DB.prepare(
      'INSERT OR IGNORE INTO feedback_sources (item_id, platform, url, normalized_url, external_id, is_primary, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
      .bind(
        item.id,
        source.platform,
        source.url,
        source.normalizedUrl,
        source.externalId,
        source === sources[0] ? 1 : 0,
        now,
      )
      .run()
  }
  const existingSubtypes = String(item.subtypes || item.subtype || '')
    .split(',')
    .filter(Boolean)
  const mergedSubtypes = [...new Set([...existingSubtypes, ...subtypes])]
  if (mergedSubtypes.join(',') !== existingSubtypes.join(',')) {
    await env.FEEDBACK_DB.prepare(
      'UPDATE feedback_items SET subtype = ?, subtypes = ?, updated_at = ? WHERE id = ?',
    )
      .bind(mergedSubtypes[0], mergedSubtypes.join(','), now, item.id)
      .run()
    item.subtypes = mergedSubtypes.join(',')
    item.subtype = mergedSubtypes[0]
  }
  await env.FEEDBACK_DB.prepare(
    'INSERT OR IGNORE INTO feedback_aliases (item_id, alias, normalized_alias, created_at) VALUES (?, ?, ?, ?)',
  )
    .bind(item.id, body.originalName.trim(), normalizedName, now)
    .run()
  await env.FEEDBACK_DB.prepare(
    'INSERT INTO feedback_submissions (id, item_id, category, subtype, original_name, normalized_name, note, voter_hash, result, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(
      crypto.randomUUID(),
      item.id,
      body.category,
      subtypes.join(','),
      body.originalName.trim(),
      normalizedName,
      typeof body.note === 'string' ? body.note.trim() : null,
      visitorHash,
      result,
      now,
    )
    .run()

  await updateMissingCover(env, item, sources, now)
  return { item: await loadSingleItem(env, item.id, visitorHash), result }
}

async function handleVote(request: Request, env: Env, visitorHash: string) {
  const body = (await request.json()) as any
  if (typeof body.itemId !== 'string' || !['like', 'unlike'].includes(body.action))
    throw new Error('invalid vote payload')
  const item = await env.FEEDBACK_DB.prepare(
    'SELECT id FROM feedback_items WHERE id = ? AND status != ?',
  )
    .bind(body.itemId, 'hidden')
    .first()
  if (!item) throw new Error('item not found')
  const existing = await env.FEEDBACK_DB.prepare(
    'SELECT active FROM feedback_votes WHERE item_id = ? AND voter_hash = ?',
  )
    .bind(body.itemId, visitorHash)
    .first<any>()
  const shouldBeActive = body.action === 'like'
  if (existing && Boolean(existing.active) === shouldBeActive)
    return { item: await loadSingleItem(env, body.itemId, visitorHash) }

  if (!existing && !shouldBeActive)
    return { item: await loadSingleItem(env, body.itemId, visitorHash) }

  const now = new Date().toISOString()
  const activeValue = shouldBeActive ? 1 : 0
  if (existing) {
    const update = await env.FEEDBACK_DB.prepare(
      'UPDATE feedback_votes SET active = ?, updated_at = ? WHERE item_id = ? AND voter_hash = ? AND active != ?',
    )
      .bind(activeValue, now, body.itemId, visitorHash, activeValue)
      .run()
    if (Number(update.meta?.changes || 0) === 0)
      return { item: await loadSingleItem(env, body.itemId, visitorHash) }
  } else {
    const insert = await env.FEEDBACK_DB.prepare(
      'INSERT OR IGNORE INTO feedback_votes (item_id, voter_hash, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    )
      .bind(body.itemId, visitorHash, activeValue, now, now)
      .run()
    if (Number(insert.meta?.changes || 0) === 0)
      return { item: await loadSingleItem(env, body.itemId, visitorHash) }
  }
  await env.FEEDBACK_DB.prepare(
    'UPDATE feedback_items SET vote_count = MAX(0, vote_count + ?), updated_at = ? WHERE id = ?',
  )
    .bind(shouldBeActive ? 1 : -1, now, body.itemId)
    .run()
  return { item: await loadSingleItem(env, body.itemId, visitorHash) }
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url)
    const path = url.pathname.replace(/^\/api\/translation-feedback/, '') || '/'
    if (request.method === 'OPTIONS')
      return withCors(new Response(null, { status: 204 }), request, env)

    const requestOrigin = request.headers.get('Origin')
    if (requestOrigin && !originList(env).includes(requestOrigin) && request.method !== 'GET') {
      return withCors(json({ error: 'origin not allowed' }, 403), request, env)
    }

    const cookie = visitorCookie(request)
    const visitorHash = await hashVisitor(cookie.value, env)

    try {
      if (request.method === 'GET' && path === '/items') {
        const items = await loadItems(env, request, visitorHash)
        return withCors(json({ items, nextCursor: null }), request, env, cookie.setCookie)
      }
      if (request.method === 'GET' && path === '/suggestions') {
        const candidates = await suggestions(env, url.searchParams)
        return withCors(json({ candidates }), request, env, cookie.setCookie)
      }
      if (request.method === 'POST' && path === '/submissions') {
        return withCors(
          json(await handleSubmission(request, env, visitorHash), 201),
          request,
          env,
          cookie.setCookie,
        )
      }
      if (request.method === 'POST' && path === '/votes') {
        return withCors(
          json(await handleVote(request, env, visitorHash)),
          request,
          env,
          cookie.setCookie,
        )
      }
      return withCors(json({ error: 'not found' }, 404), request, env, cookie.setCookie)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'request failed'
      return withCors(json({ error: message }, 400), request, env, cookie.setCookie)
    }
  },
}
