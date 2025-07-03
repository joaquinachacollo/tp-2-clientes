<script>
import MainButton from "../components/MainButton.vue";
import MainH1 from "../components/MainH1.vue";
import MainLabel from "../components/MainLabel.vue";
import { register } from "../services/auth"; // Importa la función que registra un nuevo usuario

export default {
  name: "Register",
  components: { MainH1, MainLabel, MainButton },
  data() {
    return {
      user: {
        email: "", // Email del nuevo usuario
        password: "", // Contraseña del nuevo usuario
      },
      loading: false, // Estado de carga mientras se crea la cuenta
      errorMsg: "", // Mensaje de error para mostrar al usuario
    };
  },
  methods: {
    // Maneja el envío del formulario
    async handleSubmit() {
      try {
        this.loading = true;
        this.errorMsg = ""; // Limpia el error anterior si había
        await register(this.user.email, this.user.password); // Llama a la función que registra
        this.loading = false;

        // Redirige al usuario al login luego de registrarse
        this.$router.push("/publicacion");
      } catch (error) {
        console.error("Error al crear la cuenta:", error);
        this.errorMsg =
          "Ocurrió un error al crear la cuenta. Verificá tus datos o intentá de nuevo.";
        this.loading = false;
      }
    },
  },
};
</script>

<template>
  <div>
    <MainH1>Crear una cuenta</MainH1>

    <div v-if="errorMsg" class="text-red-600 mb-4">
      {{ errorMsg }}
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="mb-4">
        <MainLabel for="email">Email</MainLabel>
        <input
          v-model="user.email"
          type="email"
          id="email"
          required
          class="w-full p-2 border border-gray-500 rounded"
          :disabled="loading"
        />
      </div>

      <div class="mb-4">
        <MainLabel for="password">Contraseña</MainLabel>
        <input
          v-model="user.password"
          type="password"
          id="password"
          required
          minlength="6"
          class="w-full p-2 border border-gray-500 rounded"
          :disabled="loading"
        />
      </div>
 
      <MainButton :disabled="loading" type="submit">
        {{ loading ? "Creando cuenta..." : "Crear cuenta" }}
      </MainButton>
    </form>
  </div>
</template>
