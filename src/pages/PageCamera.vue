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
				:disable="imgCaptured"
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

<script>
import { uid } from 'quasar'

export default {
	name: 'PageCamera',
	data() {
		const data = this.$q.localStorage.getItem('userData')
		const userData = JSON.parse(data)
		console.log(userData)
		return {
			post: {
				id: uid(),
				caption: '',
				location: '',
				photo: null,
				date: Date.now(),
				userId: userData.uid
			},
			imgCaptured: false,
			imgUpload: [],
			hasCamera: true,
			isLoading: false
		}
	},

	computed: {
		isSupported() {
			if ('geolocation' in navigator) return true
			return false
		},
		isSyncSupported() {
			if ('serviceWorker' in navigator && 'SyncManager' in window) return true
			return false
		}
	},

	methods: {
		getCamera() {
			navigator.mediaDevices
				.getUserMedia({
					video: true
				})
				.then(stream => (this.$refs.video.srcObject = stream))
				.catch(_err => (this.hasCamera = false))
		},
		getImage() {
			let video = this.$refs.video
			let canvas = this.$refs.canvas
			canvas.width = video.getBoundingClientRect().width
			canvas.height = video.getBoundingClientRect().height
			canvas
				.getContext('2d')
				.drawImage(video, 0, 0, canvas.width, canvas.height)
			this.imgCaptured = true
			this.post.photo = this.dataURItoBlob(canvas.toDataURL())
			this.disableCamera()
		},

		getImageFile(file) {
			this.post.photo = file
			let canvas = this.$refs.canvas

			var reader = new FileReader()
			reader.onload = event => {
				var img = new Image()
				img.onload = () => {
					canvas.width = img.width
					canvas.height = img.height
					canvas.getContext('2d').drawImage(img, 0, 0)
					this.imgCaptured = true
				}
				img.src = event.target.result
			}
			reader.readAsDataURL(file)
		},
		disableCamera() {
			this.$refs.video.srcObject.getVideoTracks().forEach(track => track.stop())
		},

		dataURItoBlob(dataURI) {
			var byteString = atob(dataURI.split(',')[1])
			var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
			var ab = new ArrayBuffer(byteString.length)
			var ia = new Uint8Array(ab)
			for (var i = 0; i < byteString.length; i++) {
				ia[i] = byteString.charCodeAt(i)
			}
			var blob = new Blob([ab], { type: mimeString })
			return blob
		},

		getLocation() {
			console.log('getLocation')
			this.isLoading = true
			navigator.geolocation.getCurrentPosition(
				position => {
					this.getMyPosition(position)
				},
				_err => {
					this.locationError()
				},
				{ timeout: 7000 }
			)
		},

		getMyPosition(position) {
			const url = `https://geocode.maps.co/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}`
			this.$axios
				.get(url)
				.then(res => {
					this.positionDisplay(res)
				})
				.catch(_err => this.locationError())
		},
		positionDisplay(res) {
			this.post.location = res.data.address.city
			if (res.data.address.country)
				this.post.location += `, ${res.data.address.country}`
			this.isLoading = false
		},
		locationError() {
			const locationErrorMessage = 'Your location not found'
			if (this.$q.platform.is.mac) {
				locationErrorMessage +=
					' You might be able to fix this in System Preferences > Security & Privacy > Location Services'
			}
			this.$q.dialog({
				title: 'Error',
				message: locationErrorMessage
			})
			this.isLoading = false
		},
		addPost() {
			this.$q.loading.show()

			const postCreated = this.$q.localStorage.getItem('postCreated')

			if (this.$q.platform.is.android && !postCreated && !navigator.onLine) {
				this.addPostError()
				this.$q.loading.hide()
			} else {
				const postData = new FormData()
				postData.append('id', this.post.id)
				postData.append('caption', this.post.caption)
				postData.append('location', this.post.location)
				postData.append('date', this.post.date)
				postData.append('file', this.post.photo, this.post.id + '.png')
				postData.append('userId', this.post.userId)
				console.log(postData)
				this.$axios
					.post(`${process.env.API}/createPost`, postData)
					.then(_res => {
						this.$q.localStorage.set('postCreated', true)
						this.$router.push('/')
						this.$q.notify({
							message: 'Post created!',
							actions: [
								{
									label: 'Dismiss',
									color: 'white'
								}
							]
						})
						this.$q.loading.hide()
						if (this.$q.platform.is.safari) {
							setTimeout(() => {
								window.location.href = '/'
							}, 1000)
						}
					})
					.catch(err => {
						console.log(err)
						if (!navigator.onLine && this.isSyncSupported && postCreated) {
							this.$q.notify('Post created offline')
							this.$router.push('/')
						} else {
							this.addPostError()
						}
						this.$q.loading.hide()
					})
			}
		},
		addPostError() {
			this.$q.dialog({
				title: 'Error',
				message: 'Sory, could not create post'
			})
		}
	},
	mounted() {
		this.getCamera()
	},
	beforeUnmount() {
		if (this.hasCamera) {
			this.disableCamera()
		}
	}
}
</script>
<style lang="sass">
.camera
  border: 2px solid $grey-10
  border-radius: 10px
</style>
