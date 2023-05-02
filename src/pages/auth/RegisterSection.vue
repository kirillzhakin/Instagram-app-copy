<template>
	<div id="registrationPage">
		<q-page class="q-pa-md page">
			<q-form @submit="onSubmit">
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
				<!-- <p class="option__text">Have an account?</p> -->
				<!-- <q-btn unelevated class="option__btn" to="/auth" label="Log in" /> -->
				<p class="option__text">
					Have an account? <a class="option__btn" href="/#/auth">Log in</a>
				</p>
			</div>
		</q-page>
	</div>
</template>
<script setup></script>

<style lang="sass"></style>
