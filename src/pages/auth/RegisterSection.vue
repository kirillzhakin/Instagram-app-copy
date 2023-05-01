<template>
	<div id="registrationPage">
		<q-page class="q-pa-md">
			<q-toolbar class="toolbar-style">
				<q-toolbar-title>Sign Up to share your photos!</q-toolbar-title>
			</q-toolbar>
			<q-form @submit="onSubmit" class="form-style">
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
					<q-btn label="Sign up" type="submit" color="primary" />
				</div>
			</q-form>
		</q-page>
	</div>
</template>
<script setup></script>

<style lang="scss">
#registrationPage {
	.q-field {
		margin-bottom: 5px;
	}
	.q-btn {
		width: 100%;
		text-transform: none;
	}
	.toolbar-style {
		text-align: center;
		margin: 0 auto;
		max-width: 500px;
	}
	.form-style {
		margin: 0 auto;
		height: calc(100vh - 180px);
		max-width: 500px;
	}

	@media (min-width: $breakpoint-sm-max) {
		.form-style {
			margin: 0 auto;
			height: calc(100vh - 100px);
			max-width: 500px;
		}
	}
}
</style>
