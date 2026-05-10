const CACHE_NAME = 'vmct-image-cache-v1'
const MAX_ENTRIES = 240

const IMAGE_EXTENSIONS = /\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#]|$)/i

function isCacheableImageRequest(request) {
  if (request.method !== 'GET') return false
  if (request.destination === 'image') return true

  try {
    return IMAGE_EXTENSIONS.test(new URL(request.url).pathname)
  } catch {
    return false
  }
}

async function trimCache(cache) {
  const keys = await cache.keys()
  if (keys.length <= MAX_ENTRIES) return

  await Promise.all(keys.slice(0, keys.length - MAX_ENTRIES).map((request) => cache.delete(request)))
}

async function cacheImage(request, response) {
  if (!response || (!response.ok && response.type !== 'opaque')) return

  const cache = await caches.open(CACHE_NAME)
  await cache.put(request, response.clone())
  await trimCache(cache)
}

async function respondWithCachedImage(event) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(event.request)

  if (cached) {
    event.waitUntil(
      fetch(event.request)
        .then((response) => cacheImage(event.request, response))
        .catch(() => undefined),
    )

    return cached
  }

  try {
    const response = await fetch(event.request)
    event.waitUntil(cacheImage(event.request, response.clone()).catch(() => undefined))
    return response
  } catch (error) {
    const fallback = await cache.match(event.request)
    if (fallback) return fallback
    throw error
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith('vmct-image-cache-') && name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (!isCacheableImageRequest(event.request)) return

  event.respondWith(respondWithCachedImage(event))
})
