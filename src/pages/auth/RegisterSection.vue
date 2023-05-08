<template>
	<div id="registrationPage">
		<q-page class="q-pa-md page">
			<q-form @submit.prevent="registerUser">
				<q-input
					filled
					v-model="email"
					label="Your email"
					lazy-rules
					:rules="[val => (val && val.length > 0) || 'Please type something']"
				/>
				<q-input
					filled
					v-model="name"
					label="Your name"
					lazy-rules
					:rules="[val => (val && val.length > 0) || 'Please type something']"
				/>

				<q-input
					filled
					v-model="password"
					label="Password"
					type="password"
					lazy-rules
					:rules="[val => (val && val.length > 0) || 'Please type password']"
				/>

				<div>
					<q-btn
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
import { ref } from 'vue'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'

import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
const router = useRouter()
const $q = useQuasar()

const email = ref('')
const name = ref('')
const password = ref('')

const userError = message => {
	$q.dialog({
		title: 'Error',
		message
	})
}

const registerUser = () => {
	$q.loading.show()
	createUserWithEmailAndPassword(auth, email.value.trim(), password.value)
		.then(dataUser => {
			const { user } = dataUser
			updateProfile(user, {
				displayName: name.value
			}).then(_res => {
				const user = auth.currentUser
				if (user !== null) {
					console.log(`User ${user.displayName} account created!`)
					router.push('/')
					$q.notify({
						message: `User ${user.displayName} account created!`,
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
		})
		.catch(err => {
			if (err.code === 'auth/email-already-in-use') {
				console.log(err.message)
				console.log('That email address is already in use!')
				userError('That email address is already in use!')
			}

			if (err.code === 'auth/invalid-email') {
				console.log(err.message)
				console.log('That email address is invalid!')
				userError('That email address is invalid!')
			}
			$q.loading.hide()
			console.error(err)
		})
}
</script>

<style lang="sass"></style>
