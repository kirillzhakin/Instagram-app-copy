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
				<div class="desktop-screen">
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
				<template v-if="!isLoading && postsLength(posts)">
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
							<router-link class="link-account" to="account">
								<q-item-section avatar>
									<q-avatar>
										<img :src="avatar" />
									</q-avatar>
								</q-item-section>
							</router-link>

							<q-item-section>
								<q-item-label class="text-bold">{{ name }}</q-item-label>
								<q-item-label caption> {{ post.location }} </q-item-label>
							</q-item-section>
						</q-item>

						<q-separator />

						<q-img :src="post.imageUrl" />

						<q-card-section class="row justify-between">
							<div>
								<div>{{ post.caption }}</div>
								<div class="text-caption text-gray">
									{{ viewDate(post.date) }}
								</div>
							</div>
							<q-btn
								flat
								round
								dense
								size="18px"
								icon="eva-trash-outline"
								@click="deletePost(post.id)"
							/>
						</q-card-section>
					</q-card>
				</template>

				<template v-else-if="!isLoading && !postsLength(posts)">
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
			<router-link class="link-account" to="account">
				<div class="col-4">
					<q-item class="fixed">
						<q-item-section avatar>
							<q-avatar size="48px">
								<img :src="avatar" />
							</q-avatar>
						</q-item-section>

						<q-item-section>
							<q-item-label class="text-bold">{{ name }}</q-item-label>
							<q-item-label caption>{{ email }}</q-item-label>
						</q-item-section>
					</q-item>
				</div>
			</router-link>
		</div>
	</q-page>
</template>

<script setup>
import qs from 'qs'
import axios from 'axios'
import { date } from 'quasar'
import { openDB } from 'idb'
import { onActivated, computed, ref } from 'vue'

import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

import { vapidPublicKey } from '../utils/constants.js'
import imageUser from '../assets/user.svg'

const router = useRouter()
const $q = useQuasar()

onActivated(() => {
	getPosts()
	const data = localStorage.getItem('userData')
	const userData = JSON.parse(data)
	email.value = userData.email || ''
	name.value = userData.displayName || ''
	avatar.value = userData.photoURL || imageUser
})

const data = localStorage.getItem('userData')
const userData = JSON.parse(data)

const email = ref(userData.email || '')
const name = ref(userData.displayName || '')
const avatar = ref(userData.photoURL || imageUser)
const userId = ref(userData.uid || '')
const posts = ref([])
const isLoading = ref(false)
const showNotifications = ref(false)

const postsLength = computed(() => posts => posts.length)
const viewDate = computed(() => value => date.formatDate(value, 'DD MMM YYYY'))
const isSupported = computed(() =>
	'serviceWorker' in navigator ? true : false
)
const isNotificationsSupported = computed(() =>
	'PushManager' in window ? true : false
)

const deletePost = id => {
	$q.loading.show()

	if ($q.platform.is.android && !postCreated && !navigator.onLine) {
		addPostError()
		$q.loading.hide()
	} else {
		axios
			.delete(`${process.env.API}/deletePost`, {
				params: {
					id
				}
			})
			.then(res => {
				if (res.status === 200) {
					posts.value = posts.value.filter(post => post.id !== id)
					$q.notify({
						message: 'Post deleted!',
						actions: [
							{
								label: 'Dismiss',
								color: 'white'
							}
						]
					})
				}
				$q.loading.hide()
			})
			.catch(err => {
				console.log(err)
				if (!navigator.onLine) {
					$q.notify('Post deleted offline')
					router.push('/')
				} else {
					addPostError()
				}
				$q.loading.hide()
			})
	}
}

const addPostError = () => {
	$q.dialog({
		title: 'Error',
		message: 'Sory, could not delete post'
	})
}

const getPosts = () => {
	isLoading.value = true

	let timestamp = ''
	if ($q.platform.is.ie) {
		timestamp = '?timestamp=' + Date.now()
	}
	axios
		.get(`${process.env.API}/posts${timestamp}`, {
			params: { userId: userId.value }
		})
		.then(({ data }) => {
			posts.value = [...data]
			isLoading.value = false
			if (!navigator.onLine) {
				getOfflinePosts()
			}
		})
		.catch(_err => {
			$q.dialog({
				title: 'Error',
				message: 'Posts not found'
			})
			isLoading.value = false
		})
}
const getOfflinePosts = () => {
	const db = openDB('workbox-background-sync').then(db => {
		db.getAll('requests')
			.then(badRequests => {
				{
					badRequests.forEach(req => {
						if (req.queueName === 'createPost') {
							const request = new Request(req.requestData.url, req.requestData)
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
									posts.value.unshift(offlinePost)
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
}
const listenForOfflinePostUploaded = () => {
	if (isSupported.value) {
		const channel = new BroadcastChannel('sw-message')
		channel.addEventListener('message', event => {
			console.log('Recived', event.data)
			if (event.data.message === 'offline-post-uploaded') {
				const offlinePostsLength = posts.value.filter(
					post => post.offline === true
				).length
				posts[offlinePostsLength - 1].offline = false
			}
		})
	}
}

const initNotifications = () => {
	const neverShowNotifications = localStorage.getItem('neverShowNotifications')
	if (!neverShowNotifications) {
		showNotifications.value = true
	}
}

const getNotifications = () => {
	if (isNotificationsSupported.value) {
		Notification.requestPermission(res => {
			neverShowNotifications()
			if (res === 'granted') {
				checkPushSubscribtion()
			}
		})
	}
}

const checkPushSubscribtion = async () => {
	if (isSupported.value && isNotificationsSupported.value) {
		let registration
		navigator.serviceWorker.ready
			.then(sw => {
				registration = sw
				return sw.pushManager.getSubscription()
			})
			.then(sub => {
				if (!sub) {
					createPushSubscription(registration)
				}
			})
			.catch(err => console.log(err))
	}
}
const createPushSubscription = registration => {
	const publicKey = vapidPublicKey
	registration.pushManager
		.subscribe({
			userVisibleOnly: true,
			applicationServerKey: publicKey
		})
		.then(sub => {
			const subData = sub.toJSON()
			const subDataQS = qs.stringify(subData)
			return axios.post(`${process.env.API}/createSubscription?${subDataQS}`)
		})
		.then(_res => {
			viewGrantedNotifications()
		})
		.catch(err => console.log(err))
}

const viewGrantedNotifications = () => {
	if (isSupported.value && isNotificationsSupported.value) {
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
}

const neverShowNotifications = () => {
	showNotifications.value = false
	localStorage.setItem('neverShowNotifications', true)
}

listenForOfflinePostUploaded()
initNotifications()
</script>

<style lang="sass">
.my-card
  .badge-offline
    border-top-left-radius: 0 !important
  .q-img
    min-height: 200px

.link-account
  color: $dark
  text-decoration: none
</style>
