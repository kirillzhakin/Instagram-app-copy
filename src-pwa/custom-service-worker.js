import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import {
	StaleWhileRevalidate,
	NetworkFirst,
	CacheFirst
} from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'
/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.conf > pwa > workboxPluginMode is set to "InjectManifest"
 */

// PreCaching
precacheAndRoute(self.__WB_MANIFEST)

// Caching strategies

registerRoute(
	({ url }) => url.host.startsWith('fonts.g'),
	new CacheFirst({
		cacheName: 'google-fonts',
		plugins: [
			new CacheableResponsePlugin({
				statuses: [0, 200]
			}),
			new ExpirationPlugin({
				maxEntries: 30
			})
		]
	})
)

registerRoute(
	({ url }) => url.pathname.startsWith('/posts'),
	new NetworkFirst()
)

registerRoute(
	({ url }) => url.href.startsWith('http'),
	new StaleWhileRevalidate()
)
