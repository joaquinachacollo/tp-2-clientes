<script>
import { getUserProfileById } from '../services/user-profiles'; // Función para buscar perfil por ID
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
      },
      loadingUser: false, // Estado de carga
    };
  },
  async mounted() {
    try {
      this.loadingUser = true; // Comienza a cargar
      this.user = await getUserProfileById(this.$route.params.id); // Carga el perfil por ID de la URL
    } catch (error) {
      console.error("Error al cargar perfil de usuario:", error); // Log si falla
    }
    this.loadingUser = false; // Finaliza carga
  },
};
</script>


<template>
  <div>
    <template v-if="!loadingUser">
      <MainH1>Perfil de {{ user.display_name || user.email }}</MainH1>

      <!-- Tarjeta de perfil -->
      <div class="bg-white shadow-md rounded-lg p-6 border border-gray-200 mt-6">
        <dt class="font-semibold text-gray-500 uppercase tracking-wide">Hobbies</dt>
        <p class="text-gray-600 italic mb-6">
          {{ user.hobbies || 'Acá va los obbies de este usuario...' }}
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
    </template>

    <MainLoader v-else />
  </div>
</template>

