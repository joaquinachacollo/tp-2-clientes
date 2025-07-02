<script>
// Importamos funciones necesarias desde los servicios
import { getCurrentAuthUser } from "../services/auth.js";
import {
  getAllPosts,
  createPost,
  deletePostAndComments,
  subscribeToPostChanges,
} from "../services/post.js";

// Componentes personalizados
import MainH1 from "../components/MainH1.vue";
import MainButton from "../components/MainButton.vue";

export default {
  name: "Feed",
  components: { MainH1, MainButton },

  data() {
    return {
      posts: [], // Lista de publicaciones
      newPost: "", // Contenido de la nueva publicación
      selectedCategory: "", // Categoría seleccionada (Tarea, Ayuda, etc.)
      user: null, // Usuario autenticado
    };
  },

  methods: {
    // Carga todas las publicaciones desde Supabase
    async loadPosts() {
      this.posts = await getAllPosts();
    },

    // Maneja la creación de una nueva publicación
    async handleCreatePost() {
      // Validación: no permitir publicación vacía o sin categoría
      if (!this.newPost.trim() || !this.selectedCategory) {
        alert("Completá el mensaje y seleccioná una categoría.");
        return;
      }

      try {
        // Crear la publicación y luego limpiar el formulario
        await createPost(this.user.id, this.newPost, this.selectedCategory);
        this.newPost = "";
        this.selectedCategory = "";
        await this.loadPosts(); // Recargar publicaciones
      } catch (error) {
        alert("Error al crear la publicación");
      }
    },

    // Maneja la eliminación de una publicación (y sus comentarios)
    async handleDeletePost(postId) {
      try {
        await deletePostAndComments(postId, this.user.id);
        await this.loadPosts();
      } catch (error) {
        console.error("Error al eliminar publicación:", error);
      }
    },

    // Inicializa el feed: obtiene el usuario, carga publicaciones y activa subscripción
    async initFeed() {
      this.user = await getCurrentAuthUser();
      await this.loadPosts();
      subscribeToPostChanges(this.loadPosts); // Recarga en tiempo real
    },
  },

  // Hook que se ejecuta al cargar el componente
  async mounted() {
    await this.initFeed();
  },
};
</script>

<template>
  <div>
    <!-- Título principal -->
    <MainH1>Publicaciones</MainH1>

    <!-- Formulario para crear publicación -->
    <form @submit.prevent="handleCreatePost" class="mb-4 space-y-4">
      <!-- Selector de categoría -->
      <select
        v-model="selectedCategory"
        class="w-full p-2 border border-gray-300 rounded bg-white"
      >
        <option disabled value="">Seleccioná una categoría...</option>
        <option value="Tarea">📚 Tarea</option>
        <option value="Ayuda">🤝 Ayuda</option>
        <option value="Anuncio">📣 Anuncio</option>
        <option value="Proyecto">🎨 Proyecto</option>
      </select>

      <!-- Texto del post -->
      <textarea
        v-model="newPost"
        class="w-full p-2 border rounded"
        placeholder="Escribí tu publicación..."
      ></textarea>

      <!-- Botón de publicar -->
      <MainButton type="submit" class="mt-2">Publicar</MainButton>
    </form>

    <!-- Lista de publicaciones -->
    <ul class="space-y-4">
      <li
        v-for="post in posts"
        :key="post.id"
        class="bg-white rounded-xl shadow-md p-4 border border-gray-200 hover:shadow-lg transition"
      >
        <!-- Encabezado: autor y fecha -->
        <p class="text-sm text-gray-500 mb-1">
          <RouterLink
            :to="`/usuario/${post.user_id}`"
            class="text-blue-700 font-semibold hover:underline"
          >
            {{ post.user_profiles.display_name || post.user_profiles.email }}
          </RouterLink>
          • {{ new Date(post.created_at).toLocaleString() }}
        </p>

        <!-- Categoría -->
        <span
          v-if="post.category"
          class="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800 mb-2"
        >
          {{ post.category }}
        </span>

        <!-- Contenido del post -->
        <p class="text-gray-800 text-base">{{ post.body }}</p>

        <!-- Botón para eliminar (solo si es del usuario logueado) -->
        <div v-if="post.user_id === user.id" class="mt-2">
          <button
            @click="handleDeletePost(post.id)"
            class="text-red-600 text-sm hover:underline"
          >
            Eliminar publicación
          </button>
        </div>

        <!-- Enlace para comentar -->
        <RouterLink
          :to="`/publicacion/${post.id}`"
          class="inline-flex items-center gap-2 mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4.39-1.02L3 20l1.34-3.35A7.97 7.97 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Comentar
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
