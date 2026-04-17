import { createRouter, createWebHistory } from "vue-router";
import MainLayout from "../layouts/MainLayout.vue";
import UserCreateView from "../views/UserCreateView.vue";
import UserEditView from "../views/UserEditView.vue";
import UserListView from "../views/UserListView.vue";

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: MainLayout,
      children: [
        { path: "", redirect: { name: "users" } },
        { path: "users", name: "users", component: UserListView },
        { path: "users/new", name: "user-new", component: UserCreateView },
        {
          path: "users/:id/edit",
          name: "user-edit",
          component: UserEditView,
          props: true,
        },
      ],
    },
    { path: "/:pathMatch(.*)*", redirect: { name: "users" } },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});
