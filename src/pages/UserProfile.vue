<script>
import { getUserProfileById } from '../services/user-profiles'; // Función para buscar perfil por ID
import { getPostsByUserId } from '../services/post';
import MainH1 from '../components/MainH1.vue';
import MainLoader from '../components/MainLoader.vue';

export default {
  name: 'UserProfile',
  components: { MainH1, MainLoader },
  data() {
    return {
      user: {
        id: null,
        email: null,
        hobbies: null,
        display_name: null,
        curso: null,
        age: null,
        avatar_url: null, // NUEVO: Campo para la URL del avatar
      },
      loadingUser: false, // Estado de carga del perfil
      userPosts: [],
      loadingPosts: false,
    };
  },
  async mounted() {
    try {
      this.loadingUser = true;
      const userId = this.$route.params.id;
      // Asegúrate de que getUserProfileById ya selecciona 'avatar_url'
      this.user = await getUserProfileById(userId);
      if (this.user && this.user.id) {
        await this.loadUserPosts(this.user.id);
      }
    } catch (error) {
      console.error("Error al cargar perfil de usuario:", error);
    } finally {
      this.loadingUser = false;
    }
  },
  methods: {
    async loadUserPosts(userId) {
      this.loadingPosts = true;
      try {
        this.userPosts = await getPostsByUserId(userId);
      } catch (error) {
        console.error("Error al cargar las publicaciones del usuario:", error);
        this.userPosts = [];
      } finally {
        this.loadingPosts = false;
      }
    },
  },
};
</script>

<template>
  <div>
    <template v-if="!loadingUser">
      <MainH1>Perfil de {{ user.display_name || user.email }}</MainH1>

      <!-- Tarjeta de perfil -->
      <div class="bg-white shadow-md rounded-lg p-6 border border-gray-200 mt-6">
        <!-- Sección de Imagen de Perfil -->
        <div class="flex justify-center mb-6">
          <img
            v-if="user.avatar_url"
            :src="user.avatar_url"
            alt="Avatar de perfil"
            class="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
          />
          <img
            v-else
            src="../img/estudiante.png"
            alt="Avatar por defecto"
            class="w-32 h-32 rounded-full object-cover border-4 border-gray-300 shadow-lg"
          />
        </div>

        <dt class="font-semibold text-gray-500 uppercase tracking-wide">Hobbies</dt>
        <p class="text-gray-600 italic mb-6">
          {{ user.hobbies || 'Acá va los hobbies de este usuario...' }}
        </p>

        <dl class="space-y-4 text-sm text-gray-800">
          <div>
            <dt class="font-semibold text-gray-500 uppercase tracking-wide">Email</dt>
            <dd>{{ user.email }}</dd>
          </div>
          <div>
            <dt class="font-semibold text-gray-500 uppercase tracking-wide">Nombre de usuario</dt>
            <dd>{{ user.display_name || 'Sin especificar' }}</dd>
          </div>
          <div>
            <dt class="font-semibold text-gray-500 uppercase tracking-wide">Edad</dt>
            <dd>{{ user.age|| 'Sin especificar' }}</dd>
          </div>
          <div>
            <dt class="font-semibold text-gray-500 uppercase tracking-wide">Curso</dt>
            <dd>{{ user.curso || 'Sin especificar' }}</dd>
          </div>
        </dl>
      </div>

      <!-- SECCIÓN DE PUBLICACIONES DEL USUARIO (ya la tienes implementada) -->
      <!-- ... (tu código existente para mostrar las publicaciones del usuario) ... -->

    </template>

    <MainLoader v-else />
  </div>
</template>

