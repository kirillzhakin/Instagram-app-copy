<template>
	<div id="accountMenu">
		<q-page class="q-pa-md">
			<input
				style="display: none"
				type="file"
				ref="fileInputRef"
				@change="handleFileSelection"
			/>
			<q-item-section>
				<q-btn
					round
					color="primary"
					class="avatar-btn"
					ref="buttonRef"
					@click="openFileInput"
				>
					<q-avatar size="150px">
						<img :src="avatar" />
					</q-avatar>
				</q-btn>
			</q-item-section>

			<q-form @submit.prevent="updateUser">
				<q-input
					filled
					v-model="name"
					label="Your name"
					stack-label
					:error-message="errors.name.errorMsg"
					:error="errors.name.errorType"
				/>
				<q-input
					filled
					v-model="email"
					label="Your email"
					stack-label
					:error-message="errors.email.errorMsg"
					:error="errors.email.errorType"
				/>

				<div>
					<q-btn
						:disable="!email || !name"
						class="form__btn"
						label="Update data"
						type="submit"
						color="primary"
					/>
				</div>
			</q-form>

			<div class="option">
				<p>You can</p>
				<button class="option__btn" @click="logout">Log out</button>
				<p>of your account</p>
			</div>
		</q-page>
	</div>
</template>

<script setup>
import { auth, upload } from '../services/firebase-service'

import { ref, reactive, onMounted, onActivated } from 'vue'
import {
	onAuthStateChanged,
	updateProfile,
	updateEmail,
	updatePassword,
	signOut
} from 'firebase/auth'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { emailPattern } from '../utils/constants'
import imageUser from '../assets/user.svg'

const router = useRouter()
const $q = useQuasar()
const name = ref('')
const email = ref('')
const avatar = ref(imageUser)
const fileInputRef = ref(null)

onMounted(() => {
	const data = localStorage.getItem('userData')
	const userData = JSON.parse(data)
	email.value = userData.email || ''
	name.value = userData.displayName || ''
	avatar.value = userData.photoURL || imageUser
})

const errors = reactive({
	name: { errorMsg: null, errorType: null },
	email: { errorMsg: null, errorType: null },
	password: { errorMsg: null, errorType: null }
})

const isValidEmail = val => {
	return !emailPattern.test(val)
}

const validation = () => {
	let isError = false
	// Name
	if (name.value.length < 1) {
		errors.name.errorMsg = 'Please enter your name'
		errors.name.errorType = true
		isError = true
	} else {
		errors.name.errorMsg = null
		errors.name.errorType = null
	}
	// Name END

	// Email
	if (email.value.length < 1) {
		errors.email.errorMsg = 'Please enter your email'
		errors.email.errorType = true
		isError = true
	} else if (email.value.length > 0 && isValidEmail(email.value)) {
		errors.email.errorMsg = 'The email you entered is not valid'
		errors.email.errorType = true
		isError = true
	} else {
		errors.email.errorMsg = null
		errors.email.errorType = null
	}
	// Email END

	return isError
}

const userError = (message = 'Upps...', title = 'Error') => {
	$q.dialog({
		message,
		title
	})
}

const openFileInput = () => {
	fileInputRef.value.click()
}

const handleFileSelection = async event => {
	$q.loading.show()
	if (event.target.files[0]) {
		const selectedFile = event.target.files[0]
		const currentUser = auth.currentUser
		const avatarPhoto = await upload(selectedFile, currentUser)
		avatar.value = avatarPhoto
		$q.loading.hide()
	} else {
		userError('The file was not loaded')
	}
}

const userUpdateData = async user => {
	await updateProfile(user, {
		photoURL: avatar.value,
		displayName: name.value
	})
}

const userUpdateEmail = async user => {
	await updateEmail(user, email.value)
}

const updateUser = async () => {
	const isError = validation()

	if (isError === true) return false

	$q.loading.show()
	if (!navigator.onLine) {
		const message =
			'Your update was unsuccessful. Please make sure you are connection to the internet.'
		const title = 'Offline'
		userError(message, title)

		$q.loading.hide()
	}
	const currentUser = auth.currentUser
	const promises = []
	if (email.value) {
		promises.push(userUpdateEmail(currentUser))
	}
	if (name.value) {
		promises.push(userUpdateData(currentUser))
	}

	try {
		await Promise.all(promises)
		onAuthStateChanged(auth, user => {
			if (user) {
				const { email, displayName, photoURL, uid } = user
				localStorage.setItem(
					'userData',
					JSON.stringify({ email, displayName, photoURL, uid })
				)
			}
		})
		router.push('/')
		$q.loading.hide()
		$q.notify({
			type: 'positive',
			color: 'primary',
			message: `Your profile has been changed!`
		})
		if ($q.platform.is.safari) {
			setTimeout(() => {
				window.location.href = '/'
			}, 1000)
		}
	} catch (err) {
		if (err.code === 'auth/requires-recent-login') {
			userError('Please re-login to the app!', 'Attention!')
		} else if (err.code === 'auth/user-token-expired') {
			userError('Please re-login to the app', 'Attention!')
		} else if (err.code === 'auth/email-already-in-use') {
			userError('That email address is already in use!')
		} else userError(err.message)
		$q.loading.hide()
		console.error(err)
	}
}

const logout = () => {
	$q.loading.show()
	try {
		signOut(auth)
		$q.localStorage.remove('userData')
		$q.localStorage.remove('isAuth')
		$q.loading.hide()
		router.push('/auth')
		$q.notify({
			type: 'positive',
			color: 'primary',
			message: `You are logged out!`
		})

		$q.loading.hide()
		if ($q.platform.is.safari) {
			setTimeout(() => {
				window.location.href = '/auth'
			}, 1000)
		}
	} catch (err) {
		$q.loading.hide()
		if (err) userError()
		console.error(err)
	}
}
</script>

<style lang="sass">
#accountMenu
  .q-page
    margin: 0 auto
    max-width: 500px

  .q-field
    margin-bottom: 5px

  .avatar-btn
    margin: 40px auto
    background-color: transparent

  .form__btn
    width: 100%
    height: 50px
    text-transform: none

  .option
    display: flex
    justify-content: center
    margin-top: 15px
    max-width: 500px

  .option__btn
    color: $primary
    margin: 0 4px
    padding: 0
    border: none
    font: inherit
    background-color: transparent
    cursor: pointer
    height: 20px

  .option-btn:hover
    opacity: 0.3
</style>
