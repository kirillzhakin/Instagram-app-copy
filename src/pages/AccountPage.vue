<template>
	<div id="accountMenu">
		<q-page class="q-pa-md">
			<q-item-section>
				<q-btn round color="primary" class="avatar-btn">
					<q-avatar size="150px">
						<img src="./../assets/user.svg" />
					</q-avatar>
				</q-btn>
			</q-item-section>

			<q-form @submit.prevent="updateUser">
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
					v-model="name"
					label="Your name"
					stack-label
					:error-message="errors.name.errorMsg"
					:error="errors.name.errorType"
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
				<button class="option__btn">Log out</button>
				<p>of your account</p>
			</div>
		</q-page>
	</div>
</template>

<script setup>
import { auth } from '../services/firebase-service'
import { ref, reactive, onMounted } from 'vue'
import { onAuthStateChanged, updateProfile } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { emailPattern } from '../utils/constants'

const router = useRouter()
const $q = useQuasar()

const email = ref('')
const name = ref('')
const password = ref('')

const errors = reactive({
	email: { errorMsg: null, errorType: null },
	name: { errorMsg: null, errorType: null }
})

onMounted(() => {
	const user = $q.localStorage.getItem('userData')
	console.log('currentUser:', user)
	if (user) {
		email.value = user.email || ''
		name.value = user.displayName || ''
	} else {
		router.push('./auth')
	}
})

const isValidEmail = val => {
	return !emailPattern.test(val)
}

const validation = () => {
	let isError = false

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

	return isError
}

const userError = (message = 'Upps...', title = 'Error') => {
	$q.dialog({
		message,
		title
	})
}
const userUpdateData = async user => {
	await updateProfile(user, {
		displayName: name.value,
		photoURL:
			'https://img.freepik.com/premium-photo/confident-handsome-redhead-man-with-arms-crossed-body-smiling-looking-determined-like-professional-standing-casual-clothes-against-white-background_176420-53768.jpg?w=1380'
	})

	if (user !== null) {
		const { email, displayName, photoURL, uid } = user
		$q.localStorage.set('userData', { email, displayName, photoURL, uid })
		console.log(`User ${user.displayName} account updated!`)
		router.push('/')
		$q.notify({
			type: 'positive',
			color: 'primary',
			message: `User ${user.displayName} account updated!`
		})
	}
	$q.loading.hide()
	if ($q.platform.is.safari) {
		setTimeout(() => {
			window.location.href = '/'
		}, 1000)
	}
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

	try {
		await userUpdateData(auth.currentUser)
	} catch (err) {
		if (err.code === 'auth/email-already-in-use') {
			userError('That email address is already in use!')
		}

		if (err.code === 'auth/invalid-email') {
			userError('That email address is invalid!')
		} else if (err.code === 'auth/weak-password') {
			userError('Password should be at least 6 characters!')
		} else if (err) userError(err.message)
		$q.loading.hide()
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
