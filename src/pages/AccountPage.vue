<template>
	<div id="accountMenu">
		<q-page class="q-pa-md">
			<q-item-section>
				<q-btn
					ref="buttonRef"
					round
					color="primary"
					class="avatar-btn"
					@click.prevent="getFile"
				>
					<q-avatar size="150px">
						<img :src="avatar" />
					</q-avatar>
				</q-btn>
				<q-input ref="fileRef" style="display: none" type="file"></q-input>
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
				<q-input
					filled
					v-model="password"
					label="Password"
					:type="isPwd ? 'password' : 'text'"
					stack-label
					:error-message="errors.password.errorMsg"
					:error="errors.password.errorType"
				>
					<template v-slot:append>
						<q-icon
							:name="isPwd ? 'visibility_off' : 'visibility'"
							class="cursor-pointer"
							@click="isPwd = !isPwd"
						/>
					</template>
				</q-input>
				<div>
					<q-btn
						:disable="!email || !name || !password"
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
import { auth } from '../services/firebase-service'
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
const password = ref('')
const isPwd = ref(true)

const errors = reactive({
	name: { errorMsg: null, errorType: null },
	email: { errorMsg: null, errorType: null },
	password: { errorMsg: null, errorType: null }
})

onMounted(() => {
	console.log('Mounted-----------------------')
	onAuthStateChanged(auth, user => {
		if (user) {
			name.value = user.displayName
			email.value = user.email
			avatar.value = user.photoURL ? user.photoURL : imageUser
		}
	})
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

	// Password
	if (password.value.length < 1) {
		errors.password.errorMsg = 'Please enter your password'
		errors.password.errorType = true
		isError = true
	} else if (password.value.length > 0 && password.value.length < 6) {
		errors.password.errorMsg = 'The minimum password length is 6 characters'
		errors.password.errorType = true
		isError = true
	} else {
		errors.password.errorMsg = null
		errors.password.errorType = null
	}
	// Password END
	return isError
}

const userError = (message = 'Upps...', title = 'Error') => {
	$q.dialog({
		message,
		title
	})
}

const getFile = () => {
	console.log(5)
	console.log(fileRef.value)
}

const userUpdateData = async user => {
	await updateProfile(user, {
		photoURL: null,
		displayName: name.value
	})
}
const userUpdateEmail = async user => {
	await updateEmail(user, email.value)
}
const userUpdatePassword = async user => {
	await updatePassword(user, password.value)
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
	if (password.value) {
		promises.push(userUpdatePassword(currentUser))
	}
	try {
		await Promise.all(promises)
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
		} else if (err.code === 'auth/weak-password') {
			userError('Password should be at least 6 characters!')
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
</style>
