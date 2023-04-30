<template>
	<div id="registrationPage">
		<q-page class="q-pa-md">
			<q-form @submit="onSubmit" class="q-gutter-md form-style">
				<q-input
					filled
					v-model="name"
					label="Your name *"
					hint="Name and surname"
					lazy-rules
					:rules="[val => (val && val.length > 0) || 'Please type something']"
				/>

				<q-input
					filled
					type="number"
					v-model="age"
					label="Your age *"
					lazy-rules
					:rules="[
						val => (val !== null && val !== '') || 'Please type your age',
						val => (val > 0 && val < 100) || 'Please type a real age'
					]"
				/>

				<div>
					<q-btn label="Submit" type="submit" color="primary" />
				</div>
			</q-form>
		</q-page>
	</div>
</template>
<script setup></script>

<style lang="scss">
#registrationPage {
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
