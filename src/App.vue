<script>
import Home from './pages/Home.vue'; 
import { logout, subscribeToAuthUserChanges } from './services/auth'; // Funciones de autenticación

export default {
  name: 'App',
  components: { Home }, 

  data() {
    return {
      user: {
        id: null,
        email: null,
      }, // Estado del usuario autenticado
    };
  },

  methods: {
    handleLogout() {
      // Cierra la sesión
      logout();
      // Redirige al login
      this.$router.push('/iniciar-sesion');
    },
  },

  async mounted() {
    // Suscribe al cambio de sesión del usuario y actualiza `user` automáticamente
    subscribeToAuthUserChanges(newUserData => this.user = newUserData);
  },
};
</script>


<template>
  <div class="min-h-screen flex flex-col bg-gray-100 text-gray-800 font-sans">
    <!-- NAVIGATION -->
    <nav class="bg-blue-600 text-white px-6 py-4 shadow-md">
      <div class="container mx-auto flex justify-between items-center">
        <RouterLink to="/" class="text-2xl font-bold tracking-tight hover:opacity-90 transition">AulaLink</RouterLink>
        <ul class="flex gap-6 text-sm items-center">
          <li>
            <RouterLink to="/" class="hover:underline">Inicio</RouterLink>
          </li>
          <template v-if="user.id !== null">
            <li>
              <RouterLink to="/publicacion" class="hover:underline">Publicaciones</RouterLink>
            </li>
            <li>
              <RouterLink to="/mi-perfil" class="hover:underline">Mi perfil</RouterLink>
            </li>
            <li>
              <form @submit.prevent="handleLogout">
                <button class="hover:underline text-sm" type="submit">
                  {{ user.email }} (Cerrar sesión)
                </button>
              </form>
            </li>
          </template>
          <template v-else>
            <li>
              <RouterLink to="/iniciar-sesion" class="hover:underline">Ingresar</RouterLink>
            </li>
            <li>
              <RouterLink to="/crear-cuenta" class="hover:underline">Crear cuenta</RouterLink>
            </li>
          </template>
        </ul>
      </div>
    </nav>

    <!-- MAIN CONTENT -->
    <main class="container mx-auto p-6 flex-1">
      <RouterView />
    </main>

    <!-- FOOTER -->
    <footer class="bg-blue-800 text-white text-center py-4">
      <p>AulaLink &copy; 2025</p>
    </footer>
  </div>
</template>
