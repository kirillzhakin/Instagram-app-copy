<template>
	<div id="accountMenu">
		<q-page class="q-pa-md">
			<q-item-section>
				<q-btn round color="primary" class="avatar-btn">
					<q-avatar size="150px">
						<img src="./../assets/my-avatar.jpg" />
					</q-avatar>
				</q-btn>
			</q-item-section>

			<q-form @submit="onSubmit">
				<q-input
					filled
					v-model="login"
					label="Your login"
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

<script>
export default {}
</script>

<style lang="sass">

#accountMenu

  .q-page
    margin: 0 auto
    max-width: 500px

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
