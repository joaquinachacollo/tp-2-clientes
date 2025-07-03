<script>
// Importa los componentes reutilizables de estilo
import MainButton from "../components/MainButton.vue";
import MainH1 from "../components/MainH1.vue";
import MainLabel from "../components/MainLabel.vue";

// Importa la función de login desde el servicio de autenticación
import { login } from "../services/auth";

export default {
  name: "Login",

  components: {
    MainH1,
    MainLabel,
    MainButton,
  },

  data() {
    return {
      // Información del formulario de ingreso
      user: {
        email: "", // Campo de email del usuario
        password: "", // Campo de contraseña del usuario
      },
      loading: false, // Bandera para indicar si se está procesando el login
    };
  },

  methods: {
    // Función que se ejecuta al enviar el formulario
    async handleSubmit() {
      try {
        this.loading = true; // Se activa el estado de carga

        // Intenta hacer login con los datos del usuario
        await login(this.user.email, this.user.password);

        this.loading = false; // Finaliza el estado de carga
        this.$router.push("/publicacion");
      } catch (error) {
        console.error("Error al iniciar sesión:", error); // Captura errores
        alert(
          "Hubo un error al iniciar sesión. Verificá tu email y contraseña."
        );
        this.loading = false;
      }
    },
  },
};
</script>

<template>
  <MainH1>Ingresar a mi cuenta</MainH1>

  <form action="#" @submit.prevent="handleSubmit">
    <div class="mb-4">
      <MainLabel for="email">Email</MainLabel>
      <input
        v-model="user.email"
        type="email"
        id="email"
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
        class="w-full p-2 border border-gray-500 rounded"
        :disabled="loading"
      />
    </div>
    <MainButton type="submit" :disabled="loading">
      {{ loading ? "Ingresando..." : "Ingresar" }}
    </MainButton>
  </form>
</template>
