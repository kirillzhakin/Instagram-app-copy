const routes = [
  {
    path: "/",
    component: () => import("layouts/MainPage.vue"),
    children: [
      { path: "", component: () => import("pages/PageHome.vue") },
      { path: "/camera", component: () => import("pages/PageCamera.vue") },
    ],
  },

  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
