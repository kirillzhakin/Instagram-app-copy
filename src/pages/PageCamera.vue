<template>
	<q-page class="desktop-screen-medium q-pa-md">
		<div class="camera q-pa-md">
			<video v-show="!imgCaptured" ref="video" class="full-width" autoplay />
			<canvas
				v-show="imgCaptured"
				ref="canvas"
				class="full-width"
				height="240"
			/>
		</div>
		<div class="text-center q-pa-md">
			<q-btn
				v-if="hasCamera"
				@click="getImage"
				:disable="isCamera"
				round
				color="grey-10"
				icon="eva-camera"
			/>
			<q-file
				v-else
				outlined
				@update:model-value="getImageFile"
				v-model="imgUpload"
				label="Choose an image"
				accept="image/*"
			>
				<template v-slot:prepend>
					<q-icon name="eva-attach-outline" />
				</template>
			</q-file>
			<div class="row justify-center q-ma-md">
				<q-input
					class="col col-sm-6"
					v-model="post.caption"
					label="Caption *"
					dense
				/>
			</div>
			<div class="row justify-center q-ma-md">
				<q-input
					class="col col-sm-6"
					:loading="isLoading"
					v-model="post.location"
					label="Location"
					dense
				>
					<template v-slot:append>
						<q-btn
							v-if="!isLoading && isSupported"
							@click="getLocation"
							round
							dense
							flat
							icon="eva-navigation-2-outline"
						/>
					</template>
				</q-input>
			</div>

			<div class="row justify-center q-mt-lg">
				<q-btn
					@click="addPost"
					:disable="!post.caption || !post.photo"
					unelevated
					rounded
					color="primary"
					label="Post Image"
				/>
			</div>
		</div>
	</q-page>
</template>

<script setup>
import { uid } from 'quasar'

import axios from 'axios'
import { date } from 'quasar'
import { openDB } from 'idb'
import { onMounted, onBeforeUnmount, computed, ref } from 'vue'

import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

const data = localStorage.getItem('userData')
const userData = JSON.parse(data)

const post = ref({
	id: uid(),
	caption: '',
	location: '',
	photo: null,
	date: Date.now(),
	userId: userData.uid
})

const canvas = ref(null)
const video = ref(null)
const imgUpload = ref([])
const isLoading = ref(false)
const imgCaptured = ref(false)
const isCamera = ref(true)
const hasCamera = ref(true)

const isSupported = computed(() => ('geolocation' in navigator ? true : false))

const isSyncSupported = computed(() =>
	'serviceWorker' in navigator && 'SyncManager' in window ? true : false
)

const getCamera = () => {
	navigator.mediaDevices
		.getUserMedia({
			video: true
		})
		.then(stream => {
			video.value.srcObject = stream
			isCamera.value = false
		})
		.catch(err => {
			console.log(err)
			hasCamera.value = false
		})
}

const getImage = () => {
	canvas.value.width = video.value.getBoundingClientRect().width
	canvas.value.height = video.value.getBoundingClientRect().height
	canvas.value
		.getContext('2d')
		.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height)
	imgCaptured.value = true
	post.value.photo = dataURItoBlob(canvas.value.toDataURL())
	disableCamera()
	isCamera.value = true
}

const getImageFile = file => {
	post.value.photo = file
	var reader = new FileReader()
	reader.onload = event => {
		var img = new Image()
		img.onload = () => {
			canvas.value.width = img.width
			canvas.value.height = img.height
			canvas.value.getContext('2d').drawImage(img, 0, 0)
			imgCaptured.value = true
		}
		img.src = event.target.result
	}
	reader.readAsDataURL(file)
}

const disableCamera = () => {
	video.value.srcObject.getVideoTracks().forEach(track => track.stop())
}

const dataURItoBlob = dataURI => {
	var byteString = atob(dataURI.split(',')[1])
	var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
	var ab = new ArrayBuffer(byteString.length)
	var ia = new Uint8Array(ab)
	for (var i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i)
	}
	var blob = new Blob([ab], { type: mimeString })
	return blob
}

const getLocation = () => {
	isLoading.value = true
	navigator.geolocation.getCurrentPosition(
		position => {
			getMyPosition(position)
		},
		_err => {
			locationError()
		},
		{ timeout: 7000 }
	)
}

const getMyPosition = position => {
	const url = `https://geocode.maps.co/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}`
	axios
		.get(url)
		.then(res => {
			positionDisplay(res)
		})
		.catch(_err => locationError())
}
const positionDisplay = res => {
	post.value.location = res.data.address.city
	if (res.data.address.country)
		post.value.location += `, ${res.data.address.country}`
	isLoading.value = false
}

const locationError = () => {
	const locationErrorMessage = 'Your location not found'
	if ($q.platform.is.mac) {
		locationErrorMessage +=
			' You might be able to fix this in System Preferences > Security & Privacy > Location Services'
	}
	$q.dialog({
		title: 'Error',
		message: locationErrorMessage
	})
	isLoading.value = false
}

const addPostError = () => {
	$q.dialog({
		title: 'Error',
		message: 'Sory, could not create post'
	})
}

const addPost = () => {
	$q.loading.show()

	const postCreated = localStorage.getItem('postCreated')

	if ($q.platform.is.android && !postCreated && !navigator.onLine) {
		addPostError()
		$q.loading.hide()
	} else {
		const postData = new FormData()
		postData.append('id', post.value.id)
		postData.append('caption', post.value.caption)
		postData.append('location', post.value.location)
		postData.append('date', post.value.date)
		postData.append('file', post.value.photo, post.value.id + '.png')
		postData.append('userId', post.value.userId)
		axios
			.post(`${process.env.API}/createPost`, postData)
			.then(_res => {
				localStorage.setItem('postCreated', true)
				router.push('/')
				$q.notify({
					message: 'Post created!',
					actions: [
						{
							label: 'Dismiss',
							color: 'white'
						}
					]
				})
				$q.loading.hide()
				if ($q.platform.is.safari) {
					setTimeout(() => {
						window.location.href = '/'
					}, 1000)
				}
			})
			.catch(err => {
				console.log(err)
				if (!navigator.onLine && isSyncSupported && postCreated) {
					$q.notify('Post created offline')
					router.push('/')
				} else {
					addPostError()
				}
				$q.loading.hide()
			})
	}
}

onMounted(() => {
	getCamera()
})

onBeforeUnmount(() => {
	if (hasCamera.value) {
		disableCamera()
	}
})
</script>
<style lang="sass">
.camera
  border: 2px solid $grey-10
  border-radius: 10px
</style>
