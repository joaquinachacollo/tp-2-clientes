<script>
// Importamos componentes reutilizables
import MainButton from "../components/MainButton.vue";
import MainH1 from "../components/MainH1.vue";
import MainLabel from "../components/MainLabel.vue";

// Importamos funciones para manejar autenticación y datos del perfil
import { subscribeToAuthUserChanges, updateCurrentUserProfile } from "../services/auth";

export default {
  name: "MyProfileEdit", // Nombre del componente

  components: { MainH1, MainLabel, MainButton }, // Registro de componentes hijos

  data() {
    return {
      // Datos del formulario de perfil
      profile: {
        hobies: "", // Hobbies o descripción personal
        display_name: "", // Nombre visible del usuario
        curso: "", // Curso escolar
        age: "", // Edad del estudiante
      },
      editing: false, // Estado para indicar si se está guardando
    };
  },

  methods: {
    // Método que se ejecuta al enviar el formulario
    async handleSubmit() {
      try {
        this.editing = true; // Marca que está en modo "guardando"
        await updateCurrentUserProfile({ ...this.profile }); // Actualiza el perfil en la base de datos
      } catch (error) {
        console.error("Error al actualizar perfil:", error); // Muestra el error en consola si algo sale mal
      }
      this.editing = false; // Finaliza el modo "guardando"
    },
  },

  mounted() {
    // Al montar el componente, escucha los cambios del usuario autenticado
    // y carga la información en el formulario
    subscribeToAuthUserChanges((newUserState) => {
      this.profile = {
        hobies: newUserState.hobies,
        display_name: newUserState.display_name,
        curso: newUserState.curso,
        age: newUserState.age,
      };
    });
  },
};
</script>

<template>
  <!-- Contenedor principal con estilos -->
  <div
    class="bg-white shadow-md border border-gray-200 rounded-lg p-6 max-w-xl mx-auto"
  >
    <!-- Título -->
    <MainH1>Editar mi perfil</MainH1>

    <!-- Formulario para editar el perfil -->
    <form @submit.prevent="handleSubmit" class="space-y-6 mt-4">
      <!-- Campo para hobbies (hobies) -->
      <div>
        <MainLabel for="hobies">Hobbies</MainLabel>
        <textarea
          v-model="profile.hobies"
          id="hobies"
          rows="4"
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
          placeholder="Contanos algo sobre vos..."
        ></textarea>
      </div>

      <!-- Campo para nombre de usuario -->
      <div>
        <MainLabel for="display_name">Nombre de usuario</MainLabel>
        <input
          v-model="profile.display_name"
          type="text"
          id="display_name"
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Ej. lucas.martinez"
        />
      </div>

      <!-- Campo para edad -->
      <div>
        <MainLabel for="age">Edad</MainLabel>
        <input
          v-model="profile.age"
          type="number"
          id="age"
          min="10"
          max="99"
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Ej. 16"
        />
      </div>

      <!-- Campo para curso -->
      <div>
        <MainLabel for="curso">Curso</MainLabel>
        <input
          v-model="profile.curso"
          type="text"
          id="curso"
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Ej. Diseño multimedial"
        />
      </div>

      <!-- Botón de enviar -->
      <MainButton :disabled="editing" type="submit">
        {{ editing ? "Guardando..." : "Actualizar mi perfil" }}
      </MainButton>
    </form>
  </div>
</template>
