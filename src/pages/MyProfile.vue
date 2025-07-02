<script>
// Importa el componente del encabezado principal
import MainH1 from "../components/MainH1.vue";

// Importa la función que permite escuchar cambios en el usuario autenticado
import { subscribeToAuthUserChanges } from "../services/auth";

export default {
  name: "MyProfile", // Nombre del componente

  components: { MainH1 }, // Registra los componentes que se usan en el template

  data() {
    return {
      // Objeto que representa al usuario actual
      user: {
        id: null,
        email: null,
        hobbies: null,            // Hobbies o descripción personal
        display_name: null,   // Nombre de usuario visible
        curso: null,         // Curso escolar
        age: null,            // Edad
      },
    };
  },

  // Cuando se monta el componente, se suscribe a los cambios del usuario autenticado
  mounted() {
    subscribeToAuthUserChanges((newUserData) => (this.user = newUserData));
  },
};
</script>

<template>
  <div>
    <!-- Encabezado y botón para ir a editar el perfil -->
    <div class="flex items-center justify-between mb-6">
      <MainH1>Mi perfil</MainH1>
      <RouterLink
        to="/mi-perfil/editar"
        class="text-blue-600 font-medium hover:underline text-sm"
      >
        Editar perfil
      </RouterLink>
    </div>

    <!-- Tarjeta que muestra la información del usuario -->
    <div class="bg-white shadow-md rounded-lg p-6 border border-gray-200">
      
      <!-- Sección de hobbies -->
      <dt class="font-semibold text-gray-500 uppercase tracking-wide">
        Hobbies
      </dt>
      <p class="text-gray-600 italic mb-6">
        {{ user.hobbies || "Acá va mis hobbies..." }}
      </p>

      <!-- Detalles del perfil -->
      <dl class="space-y-4 text-sm text-gray-800">
        
        <!-- Email -->
        <div>
          <dt class="font-semibold text-gray-500 uppercase tracking-wide">
            Email
          </dt>
          <dd>{{ user.email }}</dd>
        </div>

        <!-- Nombre de usuario -->
        <div>
          <dt class="font-semibold text-gray-500 uppercase tracking-wide">
            Nombre de usuario
          </dt>
          <dd>{{ user.display_name || "Sin especificar" }}</dd>
        </div>

        <!-- Edad -->
        <div>
          <dt class="font-semibold text-gray-500 uppercase tracking-wide">
            Edad
          </dt>
          <dd>{{ user.age || "Sin especificar" }}</dd>
        </div>

        <!-- Curso -->
        <div>
          <dt class="font-semibold text-gray-500 uppercase tracking-wide">
            Curso
          </dt>
          <dd>{{ user.curso || "Sin especificar" }}</dd>
        </div>
        
      </dl>
    </div>
  </div>
</template>

