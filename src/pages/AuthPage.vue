<template>
	<q-layout view="lHh Lpr lFf">
		<q-header class="bg-white text-grey-10" bordered>
			<q-toolbar class="desktop-screen">
				<q-toolbar-title class="toolbar-title__auth text-grand-hotel text-bold">
					Instagram
				</q-toolbar-title>
			</q-toolbar>
		</q-header>
		<q-page-container class="bg-grey-1">
			<router-view v-slot="{ Component }">
				<transition appear enter-active-class="animated bounceInLeft">
					<component :is="Component" />
				</transition>
			</router-view>
		</q-page-container>
	</q-layout>
</template>

<script>
import { defineComponent } from 'vue'
export default defineComponent({
	name: 'AuthPage'
})
</script>

<style lang="sass">
.toolbar-title__auth
  text-align: center
  font-size: 30px
</style>
