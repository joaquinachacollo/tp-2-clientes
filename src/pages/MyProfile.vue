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
        hobbies: null,
        display_name: null,
        curso: null,
        age: null,
        avatar_url: null, // NUEVO: Campo para la URL del avatar
      },
    };
  },

  // Cuando se monta el componente, se suscribe a los cambios del usuario autenticado
  mounted() {
    // Asegúrate de que newUserData que recibe el callback contenga 'avatar_url'
    // Esto depende de cómo 'subscribeToAuthUserChanges' en services/auth.js obtiene los datos del perfil.
    // Si subscribeToAuthUserChanges usa getUserProfileById, y getUserProfileById ya selecciona avatar_url,
    // entonces esto funcionará.
    subscribeToAuthUserChanges((newUserData) => {
      this.user = newUserData;
    });
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

    <!-- Sección de Publicaciones del Usuario (ya la tienes implementada) -->
    <!-- Asegúrate de que esta sección se muestre debajo de la información del perfil -->
    <!-- ... (tu código existente para mostrar las publicaciones del usuario) ... -->
  </div>
</template>

