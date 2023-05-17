import { route } from 'quasar/wrappers'
import {
	createRouter,
	createMemoryHistory,
	createWebHistory,
	createWebHashHistory
} from 'vue-router'
import routes from './routes'

import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase-service'

onAuthStateChanged(auth, user => {
	if (user) {
		const { email, displayName, photoURL, uid } = user
		localStorage.setItem(
			'userData',
			JSON.stringify({ email, displayName, photoURL, uid })
		)
		localStorage.setItem('isAuth', true)
	}
})

export default route(function (/* { store, ssrContext } */) {
	const createHistory = process.env.SERVER
		? createMemoryHistory
		: process.env.VUE_ROUTER_MODE === 'history'
		? createWebHistory
		: createWebHashHistory

	const Router = createRouter({
		scrollBehavior: () => ({ left: 0, top: 0 }),
		routes,

		history: createHistory(process.env.VUE_ROUTER_BASE)
	})
	Router.beforeEach((to, from, next) => {
		console.log('beforEach-------------------------')
		const isAuth = localStorage.getItem('isAuth')
		if (to.path !== '/auth' && !isAuth) next('/auth')
		else next()
	})

	return Router
})
