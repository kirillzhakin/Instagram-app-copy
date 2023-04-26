<template>
	<q-page class="desktop-screen q-pa-md">
		<transition
			appear
			enter-active-class="animated fadeIn"
			leave-active-class="animated fadeOut"
		>
			<div
				v-if="showNotifications && isNotificationsSupported"
				class="banner-container bg-primary"
			>
				<div class="constrain">
					<q-banner inline-actions class="bg-grey-3 q-mb-md">
						<template v-slot:avatar>
							<q-icon name="eva-bell-outline" color="primary" />
						</template>
						Enable notifications?
						<template v-slot:action>
							<q-btn
								@click="getNotifications"
								color="primary"
								flat
								label="Yes"
								dense
								class="q-px-sm"
							/>
							<q-btn
								@click="showNotifications = false"
								color="primary"
								flat
								label="Later"
								dense
								class="q-px-sm"
							/>
							<q-btn
								@click="neverShowNotifications"
								color="primary"
								flat
								label="Never"
								dense
								class="q-px-sm"
							/>
						</template>
					</q-banner>
				</div>
			</div>
		</transition>

		<div class="row q-col-gutter-lg">
			<div class="col-12 col-sm-8">
				<template v-if="!isLoading && posts.length">
					<q-card
						v-for="post in posts"
						:key="post.id"
						class="my-card q-mb-md"
						:class="{ 'bg-red-1': post.offline }"
						flat
						bordered
					>
						<q-badge
							v-if="post.offline"
							class="badge-offline absolute-top-right"
							color="red"
							>Offline post</q-badge
						>
						<q-item>
							<q-item-section avatar>
								<q-avatar>
									<img src="./../assets/my-avatar.jpg" />
								</q-avatar>
							</q-item-section>

							<q-item-section>
								<q-item-label class="text-bold">kirill_ivanov</q-item-label>
								<q-item-label caption> {{ post.location }} </q-item-label>
							</q-item-section>
						</q-item>

						<q-separator />

						<q-img :src="post.imageUrl" />

						<q-card-section>
							<div>{{ post.caption }}</div>
							<div class="text-caption text-gray">
								{{ viewDate(post.date) }}
							</div>
						</q-card-section>
					</q-card>
				</template>

				<template v-else-if="!isLoading && !posts.length">
					<h5 class="text-center text-grey">No posts</h5>
				</template>

				<template v-else>
					<q-card flat bordered>
						<q-item>
							<q-item-section avatar>
								<q-skeleton type="QAvatar" animation="fade" size="40px" />
							</q-item-section>

							<q-item-section>
								<q-item-label>
									<q-skeleton type="text" animation="fade" />
								</q-item-label>
								<q-item-label caption>
									<q-skeleton type="text" animation="fade" />
								</q-item-label>
							</q-item-section>
						</q-item>

						<q-skeleton height="200px" square animation="fade" />

						<q-card-section>
							<q-skeleton type="text" class="text-subtitle2" animation="fade" />
							<q-skeleton
								type="text"
								class="text-subtitle2"
								width="50%"
								animation="fade"
							/>
						</q-card-section>
					</q-card>
				</template>
			</div>
			<div class="col-4 large-screen">
				<q-item class="fixed">
					<q-item-section avatar>
						<q-avatar size="48px">
							<img src="./../assets/my-avatar.jpg" />
						</q-avatar>
					</q-item-section>

					<q-item-section>
						<q-item-label class="text-bold">kirill_ivanov</q-item-label>
						<q-item-label caption>Kirill Ivanov </q-item-label>
					</q-item-section>
				</q-item>
			</div>
		</div>
	</q-page>
</template>

<script>
import { date } from 'quasar'
import { openDB } from 'idb'
import qs from 'qs'
import { vapidPublicKey } from '../utils/constants.js'

export default {
	name: 'PageHome',
	data() {
		return {
			posts: [],
			isLoading: false,
			showNotifications: false
		}
	},

	methods: {
		getPosts() {
			this.isLoading = true

			let timestamp = ''
			if (this.$q.platform.is.ie) {
				timestamp = '?timestamp=' + Date.now()
			}

			this.$axios
				.get(`${process.env.API}/posts${timestamp}`)
				.then(({ data }) => {
					this.posts = data
					this.isLoading = false
					if (!navigator.onLine) {
						this.getOfflinePosts()
					}
				})
				.catch(_err => {
					this.$q.dialog({
						title: 'Error',
						message: 'Posts not found'
					})
					this.isLoading = false
				})
		},
		getOfflinePosts() {
			const db = openDB('workbox-background-sync').then(db => {
				db.getAll('requests')
					.then(badRequests => {
						{
							badRequests.forEach(req => {
								if (req.queueName === 'createPost') {
									const request = new Request(
										req.requestData.url,
										req.requestData
									)
									request.formData().then(formData => {
										let offlinePost = {}
										offlinePost.id = formData.get('id')
										offlinePost.caption = formData.get('caption')
										offlinePost.location = formData.get('location')
										offlinePost.date = parseInt(formData.get('date'))
										offlinePost.offline = true

										let reader = new FileReader()
										reader.readAsDataURL(formData.get('file'))
										reader.onloadend = () => {
											offlinePost.imageUrl = reader.result
											this.posts.unshift(offlinePost)
										}
									})
								}
							})
						}
					})
					.catch(err => {
						console.log('Error IndexDB:', err)
					})
			})
		},
		listenForOfflinePostUploaded() {
			if (this.isSupported) {
				const channel = new BroadcastChannel('sw-message')
				channel.addEventListener('message', event => {
					console.log('Recived', event.data)
					if (event.data.message === 'offline-post-uploaded') {
						const offlinePostsLength = this.posts.filter(
							post => post.offline === true
						).length
						this.posts[offlinePostsLength - 1].offline = false
					}
				})
			}
		},
		initNotifications() {
			const dontShowNotifications = this.$q.localStorage.getItem(
				'neverShowNotifications'
			)

			if (!dontShowNotifications) {
				this.showNotifications = true
			}
		},
		getNotifications() {
			if (this.isNotificationsSupported) {
				Notification.requestPermission(res => {
					console.log(res)
					this.neverShowNotifications()
					if (res === 'granted') {
						// this.viewGrantedNotifications()
						this.checkPushSubscribtion()
					}
				})
			}
		},
		checkPushSubscribtion() {
			if (this.isSupported && this.isNotificationsSupported) {
				let registration
				navigator.serviceWorker.ready
					.then(sw => {
						registration = sw
						return sw.pushManager.getSubscription()
					})
					.then(sub => {
						if (!sub) {
							this.createPushSubscription(registration)
						}
					})
			}
		},
		createPushSubscription(registration) {
			const publicKey = vapidPublicKey
			registration.pushManager
				.subscribe({
					userVisibleOnly: true,
					applicationServerKey: publicKey
				})
				.then(sub => {
					const subData = sub.toJSON()
					const subDataQS = qs.stringify(subData)
					return this.$axios.post(
						`${process.env.API}/createSubscription?${subDataQS}`
					)
				})
				.then(res => {
					console.log(res)
					this.viewGrantedNotifications()
				})
				.catch(err => console.log(err))
		},
		viewGrantedNotifications() {
			// new Notification("You're subscribed to notifications", {
			// 	body: 'Thanks for subscribing',
			// 	icon: '/icons/favicon-128x128.png',
			// 	badge: '/icons/favicon-128x128.png',
			// 	dir: 'ltr',
			// 	lang: 'en-US',
			// 	vibrate: [100, 50, 200],
			// 	tag: 'confirm-notifications',
			// 	renotify: true
			// })

			if (this.isSupported && this.isNotificationsSupported) {
				navigator.serviceWorker.ready.then(sw =>
					sw.showNotification("You're subscribed to notifications", {
						body: 'Thanks for subscribing',
						icon: '/icons/favicon-128x128.png',
						badge: '/icons/favicon-128x128.png',
						dir: 'ltr',
						lang: 'en-US',
						vibrate: [100, 50, 200],
						tag: 'confirm-notifications',
						renotify: true,
						actions: [
							{
								action: 'hello',
								title: 'Hello',
								icon: '/icons/favicon-128x128.png'
							},
							{
								action: 'goodbye',
								title: 'Goodbye',
								icon: '/icons/favicon-128x128.png'
							}
						]
					})
				)
			}
		},
		neverShowNotifications() {
			this.showNotifications = false
			this.$q.localStorage.set('neverShowNotifications', true)
		}
	},
	computed: {
		viewDate() {
			return value => date.formatDate(value, 'DD MMM YYYY')
		},
		isSupported() {
			if ('serviceWorker' in navigator) return true
			return false
		},
		isNotificationsSupported() {
			if ('PushManager' in window) return true
			return false
		}
	},
	activated() {
		this.getPosts()
	},
	created() {
		this.listenForOfflinePostUploaded()
		this.initNotifications()
	}
}
</script>

<style lang="sass">
.my-card
  .badge-offline
    border-top-left-radius: 0 !important
  .q-img
    min-height: 200px
</style>
