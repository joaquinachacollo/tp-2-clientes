import { createRouter, createWebHistory } from "vue-router";
import { subscribeToAuthUserChanges } from "../services/auth";
import Home from '../pages/Home.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import MyProfile from "../pages/MyProfile.vue";
import MyProfileEdit from "../pages/MyProfileEdit.vue";
import UserProfile from "../pages/UserProfile.vue";
import Feed from "../pages/Feed.vue";
import PostDetalle from "../pages/PostDetalle.vue";

const routes = [
    { path: '/',                    component: Home, },
    { path: '/iniciar-sesion',      component: Login, },
    { path: '/crear-cuenta',        component: Register, },
    // Rutas protegidas (requieren sesión)
    { path: '/publicacion',         component: Feed, meta: { requiresAuth: true, }, },
    { path: '/publicacion/:id',     component: PostDetalle, meta: { requiresAuth: true, }, },
    { path: '/mi-perfil',           component: MyProfile,       meta: { requiresAuth: true, }, },
    { path: '/mi-perfil/editar',    component: MyProfileEdit,   meta: { requiresAuth: true, }, },
    { path: '/usuario/:id',         component: UserProfile,     meta: { requiresAuth: true, }, },
];

const router = createRouter({
  routes,
  history: createWebHistory(), 
});

// estado local del usuario
let user = {
    id: null,
    email: null,
}

// Nos suscribimos al cambio del estado del usuario desde el sistema de auth
subscribeToAuthUserChanges(newUserData => user = newUserData);

router.beforeEach((to, from) => {
  // Si la ruta requiere autenticación y no hay usuario logueado...
  if (to.meta.requiresAuth && user.id === null) {
    return '/iniciar-sesion'; // Redirigimos a login
  }
});

// Exportamos el router.
export default router;