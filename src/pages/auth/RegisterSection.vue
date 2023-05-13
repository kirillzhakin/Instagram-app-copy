<template>
	<div id="registrationPage">
		<q-page style="min-height: 0" class="q-pa-md">
			<q-form @submit.prevent="registerUser">
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

				<q-input
					filled
					v-model="password"
					label="Password"
					type="password"
					stack-label
					:error-message="errors.password.errorMsg"
					:error="errors.password.errorType"
				/>

				<div>
					<q-btn
						:disable="!email || !name || !password"
						class="form-btn"
						label="Sign up"
						type="submit"
						color="primary"
					/>
				</div>
			</q-form>
			<div class="option">
				<p class="option__text">
					Have an account?
					<router-link class="option__btn" to="/auth">Log in</router-link>
				</p>
			</div>
		</q-page>
	</div>
</template>

<script setup>
import { auth } from '../../services/firebase-service'
import { ref, reactive } from 'vue'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { emailPattern } from '../../utils/constants'

const router = useRouter()
const $q = useQuasar()

const email = ref('')
const name = ref('')
const password = ref('')

const errors = reactive({
	email: { errorMsg: null, errorType: null },
	name: { errorMsg: null, errorType: null },
	password: { errorMsg: null, errorType: null }
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

const registerUser = async () => {
	const isError = validation()

	if (isError === true) return false

	$q.loading.show()
	if (!navigator.onLine) {
		const message =
			'Your registration was unsuccessful. Please make sure you are connection to the internet.'
		const title = 'Offline'
		userError(message, title)
		$q.loading.hide()
	}

	try {
		const { user } = await createUserWithEmailAndPassword(
			auth,
			email.value,
			password.value
		)
		await updateProfile(user, {
			displayName: name.value
		})

		const currentUser = auth.currentUser
		console.log(currentUser)
		if (currentUser !== null) {
			console.log(`User ${user.displayName} account created!`)
			router.push('/')
			$q.notify({
				type: 'positive',
				color: 'primary',
				message: `User ${user.displayName} account created!`
			})
		}
		$q.loading.hide()
		if ($q.platform.is.safari) {
			setTimeout(() => {
				window.location.href = '/'
			}, 1000)
		}
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

<style lang="sass"></style>
