<template>
	<q-layout view="lHh Lpr lFf">
		<q-header class="bg-white text-grey-10" bordered>
			<q-toolbar class="desktop-screen">
				<q-btn
					to="/camera"
					class="large-screen-only q-mr-sm"
					flat
					round
					dense
					size="18px"
					icon="eva-camera-outline"
				/>
				<q-separator class="large-screen-only" spaced vertical />
				<q-toolbar-title class="text-grand-hotel text-bold">
					Instagram
				</q-toolbar-title>
				<q-btn
					to="/"
					class="large-screen-only"
					flat
					round
					dense
					size="18px"
					icon="eva-home-outline"
				/>
			</q-toolbar>
		</q-header>

		<q-footer class="bg-white" bordered>
			<transition
				appear
				enter-active-class="animated fadeIn"
				leave-active-class="animated fadeOut"
			>
				<div v-if="showInstallApp" class="banner-container bg-primary">
					<div class="constrain">
						<q-banner inline-actions dense class="bg-primary text-white">
							<template v-slot:avatar>
								<q-avatar
									color="white"
									icon="eva-camera-outline"
									text-color="grey-10"
									font-size="22px"
								/>
							</template>
							Install App?
							<template v-slot:action>
								<q-btn
									@click="installApp"
									flat
									label="Yes"
									dense
									class="q-px-sm"
								/>
								<q-btn
									@click="showInstallApp = false"
									flat
									label="Later"
									dense
									class="q-px-sm"
								/>
								<q-btn
									@click="neverShowAppInstall"
									flat
									label="Never"
									dense
									class="q-px-sm"
								/>
							</template>
						</q-banner>
					</div>
				</div>
			</transition>

			<q-tabs
				class="text-grey-10 small-screen-only"
				active-color="primary"
				indicator-color="transparent"
			>
				<q-route-tab to="/" icon="eva-home-outline" />
				<q-route-tab to="/camera" icon="eva-camera-outline" />
			</q-tabs>
		</q-footer>
		<q-page-container class="bg-grey-1">
			<router-view />
		</q-page-container>
	</q-layout>
</template>

<script>
let deferredPrompt
export default {
	name: 'MainPage',

	data() {
		return {
			showInstallApp: false
		}
	},

	methods: {
		installApp() {
			this.showInstallApp = false
			deferredPrompt.prompt()
			deferredPrompt.userChoice.then(result => {
				if (result.outcome === 'accepted') {
					console.log('User accepted the install prompt')
				} else {
					console.log('User dismissed the install prompt')
				}
			})
		},

		neverShowAppInstall() {
			this.showInstallApp = false
			this.$q.localStorage.set('neverShowAppInstall', true)
		}
	},
	mounted() {
		const dontShowAppInstall = this.$q.localStorage.getItem(
			'neverShowAppInstall'
		)

		if (!dontShowAppInstall) {
			window.addEventListener('dblclick', e => {
				// beforeinstallprompt ---????????
				e.preventDefault()
				deferredPrompt = e

				setTimeout(() => {
					this.showInstallApp = true
				}, 3000)
			})
		}
	}
}
</script>

<style lang="sass">

.q-toolbar
  @media (min-width: $breakpoint-sm-min)
    height: 77px
.q-toolbar__title
  @media (max-width: $breakpoint-xs-max)
   text-align: center
   font-size: 30px

.q-footer
  .q-tab__icon
   font-size: 30px
</style>
