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
		component: () => import('layouts/MainLayout.vue'),
		children: [
			{ path: '/', component: () => import('pages/PageHome.vue') },
			{ path: '/camera', component: () => import('pages/PageCamera.vue') }
		]
	},

	{
		path: '/:catchAll(.*)*',
		component: () => import('pages/ErrorNotFound.vue')
	}
]

export default routes
