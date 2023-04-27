import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import {
	StaleWhileRevalidate,
	NetworkFirst,
	CacheFirst
} from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'
import { Queue } from 'workbox-background-sync'

/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.conf > pwa > workboxPluginMode is set to "InjectManifest"
 */

// PreCaching
precacheAndRoute(self.__WB_MANIFEST)

// Queue - createPost
const backgroundSyncSupported = 'sync' in self.registration ? true : false
let createPost = null

if (backgroundSyncSupported) {
	createPost = new Queue('createPost', {
		onSync: async ({ queue }) => {
			let entry
			while ((entry = await queue.shiftRequest())) {
				try {
					await fetch(entry.request)
					console.log('Replay successful for request', entry.request)
					const channel = new BroadcastChannel('sw-message')
					channel.postMessage({ message: 'offline-post-uploaded' })
				} catch (error) {
					console.error('Replay failed for request', entry.request, error)

					// Put the entry back in the queue and re-throw the error:
					await queue.unshiftRequest(entry)
					throw error
				}
			}
			console.log('Replay complete!')
		}
	})
}

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

// Events - fetch
if (backgroundSyncSupported) {
	self.addEventListener('fetch', event => {
		if (event.request.url.endsWith('/createPost')) {
			// Клонируем запрос для безопасного чтения
			// при добавлении в очередь
			if (!self.navigator.onLine) {
				const promiseChain = fetch(event.request.clone()).catch(_err => {
					return createPost.pushRequest({ request: event.request })
				})
				event.waitUntil(promiseChain)
			}
		}
	})
}

self.addEventListener('push', event => {
	if (event.data) {
		const data = JSON.parse(event.data.text())
		console.log(data)

		event.waitUntil(
			self.registration.showNotification(data.title, {
				body: data.body,
				icon: '/icons/favicon-128x128.png',
				badge: '/icons/favicon-128x128.png',
				image: data.imageUrl,
				data: {
					openUrl: data.openUrl
				}
			})
		)
	}
})

self.addEventListener('notificationclick', event => {
	console.log(event.notification)
	console.log(event.notification.data)
	if (event.action === 'hello') {
		console.log(event.action)
	} else if (event.action === 'goodbye') {
		console.log(event.action)
	} else {
		event.waitUntil(
			clients.matchAll().then(clis => {
				const clientUsingApp = clis.find(
					cli => cli.visibilityState === 'visible'
				)
				if (clientUsingApp) {
					clientUsingApp.navigate(event.notification.data.openUrl)
					clientUsingApp.focus()
				} else {
					clients.openWindow(event.notification.data.openUrl)
				}
			})
		)
	}
	event.notification.close()
})

self.addEventListener('notificationclick', event => {
	console.log('On notification click: ', event)
})
