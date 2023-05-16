import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase-service'
let isAuth = false
onAuthStateChanged(auth, user => (user ? (isAuth = true) : (isAuth = false)))
console.log('isAuth')
console.log(isAuth)

const routes = [
	{
		path: '/auth',
		component: () => import('pages/AuthPage.vue'),
		children: [
			{ path: '', component: () => import('pages/auth/LoginSection.vue') },
			{
				path: 'register',
				component: () => import('pages/auth/RegisterSection.vue')
			}
		]
	},
	{
		path: '/',
		beforeEnter: (to, from) => {
			isAuth ? true : false
		},
		component: () => import('layouts/MainLayout.vue'),
		children: [
			{ path: '/', component: () => import('pages/PageHome.vue') },
			{ path: '/camera', component: () => import('pages/PageCamera.vue') },
			{
				path: '/account',
				component: () => import('pages/AccountPage.vue')
			}
		]
	},

	{
		path: '/:catchAll(.*)*',
		component: () => import('pages/ErrorNotFound.vue')
	}
]

export default routes
