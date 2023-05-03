<template>
	<div id="authPage">
		<q-layout view="lHh Lpr lFf">
			<q-page-container>
				<h1 class="page-title text-grand-hotel text-bold">Instagram</h1>
				<router-view v-slot="{ Component }">
					<transition appear enter-active-class="animated bounceInLeft">
						<component :is="Component" />
					</transition>
				</router-view>
			</q-page-container>
		</q-layout>
	</div>
</template>

<script>
import { defineComponent } from 'vue'
export default defineComponent({
	name: 'AuthPage'
})
</script>

<style lang="sass">
#authPage
  .page-title
    margin: 150px auto 0 auto
    text-align: center
    font-size: 40px
  .q-field
    margin-bottom: 5px
  .q-page
    margin: 0 auto
    max-width: 500px

  .q-btn
    width: 100%
    height: 50px
    text-transform: none

  .option
    display: flex
    margin: 15px auto 0 auto
    width: 100%
    height: 20px
    justify-content: center

  .option__text
    align-items: center
    text-align: end

  .option__btn
    color: $primary
    text-align: start
    text-decoration: none
</style>
