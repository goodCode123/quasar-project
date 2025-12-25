import type { RouteRecordRaw } from "vue-router";
import HomePage from "pages/Home.vue";
import barcode from "../components/barcode.vue";
import RefExample from "pages/RefAndReactive/RefExample.vue";
import ToRefs from "pages/ToRefs/ToRefs.vue";
import User from "pages/User.vue";
import UserEditPage from "pages/UserEdit.vue";
import Roles from "pages/Role.vue";
import RoleEditPage from "pages/RoleEditPage.vue";
import Menu from "pages/Menu.vue";
import col from "../components/col.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/IndexPage.vue") },
      {
        path: "/home",
        component: HomePage,
      },
      {
        path: "/barcode",
        component: barcode,
      },
      {
        path: "/refpage",
        component: RefExample,
      },
      {
        path: "/col",
        component: col,
      },
      {
        path: "/Roles",
        component: Roles,
        meta: { flow: "role", CacheName: "Role" },
      },
      {
        path: "/Roles/edit/:id",
        component: RoleEditPage,
        meta: { flow: "role", CacheName: "Role" },
      },
      {
        path: "/toRefs",
        component: ToRefs,
      },
      {
        path: "/User",
        component: User,
        meta: { flow: "user", CacheName: "User" },
      },
      {
        path: "/User/edit/:id",
        component: UserEditPage,
        meta: { flow: "user", CacheName: "User" },
      },
      {
        path: "/Menu",
        component: Menu,
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
