const routes = [
	{
		path: '/auth',
		name: 'Auth',
		component: () => import('pages/AuthPage.vue'),
		children: [
			{
				path: '',
				name: 'Login',
				component: () => import('pages/auth/LoginSection.vue')
			},
			{
				path: 'register',
				name: 'Register',
				component: () => import('pages/auth/RegisterSection.vue')
			}
		]
	},
	{
		path: '/',
		component: () => import('layouts/MainLayout.vue'),
		children: [
			{
				path: '/',
				name: 'PageHome',
				component: () => import('pages/PageHome.vue')
			},

			{
				path: '/camera',
				name: 'PageCamera',
				component: () => import('pages/PageCamera.vue')
			},
			{
				path: '/account',
				name: 'AccountPage',
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
