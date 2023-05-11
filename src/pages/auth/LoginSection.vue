<template>
	<div id="loginPage">
		<q-page style="min-height: 0" class="q-pa-md">
			<q-form @submit.prevent="loginUser">
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
					type="password"
					stack-label
					:error-message="errors.password.errorMsg"
					:error="errors.password.errorType"
				/>

				<div>
					<q-btn
						:disable="!email || !password"
						class="form-btn"
						label="Log in"
						type="submit"
						color="primary"
					/>
				</div>
			</q-form>
			<div class="option">
				<p class="option__text">
					Don't have an account?
					<router-link class="option__btn" to="/auth/register"
						>Sign up</router-link
					>
				</p>
			</div>
		</q-page>
	</div>
</template>
<script setup>
import { auth } from '../../services/firebase-service'
import { ref, reactive } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'

import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { emailPattern } from '../../utils/constants'

const router = useRouter()
const $q = useQuasar()

const email = ref('')
const password = ref('')

const errors = reactive({
	email: { errorMsg: null, errorType: null },
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

const loginUser = async () => {
	const isError = validation()

	if (isError === true) return false

	$q.loading.show()
	if (!navigator.onLine) {
		const message =
			'Your login was unsuccessful. Please make sure that you are connected to the internet.'
		const title = 'Offline'
		userError(message, title)
		$q.loading.hide()
	}

	try {
		const { user } = await signInWithEmailAndPassword(
			auth,
			email.value,
			password.value
		)
		console.log(user)
		if (user !== null) {
			console.log(`Welcome back ${user.displayName}!`)
			router.push('/')
			$q.notify({
				type: 'positive',
				color: 'primary',
				message: `Welcome back ${user.displayName}!`
			})
		}
		$q.loading.hide()
		if ($q.platform.is.safari) {
			setTimeout(() => {
				window.location.href = '/'
			}, 1000)
		}
	} catch (err) {
		if (err.code === 'auth/user-not-found') {
			userError('User with this email does not exist!')
		} else if (err.code === 'auth/wrong-password') {
			userError('Incorrect password!')
		} else if (err) userError(err.message)
		$q.loading.hide()
		console.error(err)
	}
}
</script>

<style lang="sass"></style>
