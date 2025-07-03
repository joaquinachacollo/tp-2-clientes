<script>
import { getCommentsByPost, createComment } from "../services/comments";
import {
  fetchPostById,
  removeCommentById,
  subscribeToPostComments,
} from "../services/post";
import { getCurrentAuthUser } from "../services/auth";
import MainButton from "../components/MainButton.vue";
import MainH1 from "../components/MainH1.vue";

export default {
  name: "PostDetalle",
  components: { MainH1, MainButton },
  data() {
    return {
      post: null, // El post que se va a mostrar
      comments: [], // Lista de comentarios del post
      newComment: "", // Comentario nuevo que escribe el usuario
      user: null, // Usuario logueado
    };
  },
  methods: {
    // Enviar un nuevo comentario
    async handleComment() {
      if (!this.newComment.trim()) return; // No envía si está vacío

      try {
        await createComment(this.post.id, this.user.id, this.newComment); // Inserta en Supabase
        this.newComment = ""; // Limpia el textarea
        this.comments = await getCommentsByPost(this.post.id); // Recarga la lista de comentarios
      } catch (err) {
        console.error("Error al comentar:", err); // Muestra error si algo falla
      }
    },

    // Eliminar un comentario (solo si es del usuario)
    async handleDeleteComment(commentId) {
      try {
        await removeCommentById(commentId, this.user.id); // Elimina si el usuario es dueño
        this.comments = await getCommentsByPost(this.post.id); // Recarga comentarios
      } catch (err) {
        console.error("Error al eliminar comentario:", err);
      }
    },
  },

  async mounted() {
    const postId = this.$route.params.id; // Obtiene el ID del post desde la URL (ruta dinámica)
    this.user = await getCurrentAuthUser(); // Obtiene el usuario autenticado actual

    try {
      this.post = await fetchPostById(postId); // Carga los datos del post
      this.comments = await getCommentsByPost(postId); // Carga los comentarios del post

      // Suscripción a nuevos comentarios en tiempo real
      subscribeToPostComments(postId, (newComment) => {
        this.comments.push(newComment); // Agrega el nuevo comentario en vivo
      });
    } catch (err) {
      console.error("Error al cargar post o comentarios:", err);
    }
  },
};
</script>

<template>
  <div>
    <!-- Título principal -->
    <MainH1>Publicación</MainH1>

    <!-- Si ya se cargó el post, se muestra su contenido -->
    <div v-if="post">
      <p class="mb-6">{{ post.body }}</p>

      <!-- NUEVO: Mostrar imagen si existe en la publicación detallada -->
      <div v-if="post.image_url" class="mb-4">
        <img
          :src="post.image_url"
          :alt="post.body || 'Imagen de publicación'"
          class="max-w-md h-auto object-contain rounded-lg shadow-md block mx-auto"
          @error="console.error('Error al cargar imagen del post en detalle:', $event.target.src)"
        />
      </div>
      <!-- FIN NUEVO -->

    </div>

    <!-- Si todavía se está cargando, muestra texto alternativo -->
    <div v-else class="text-gray-500">Cargando publicación...</div>

    <h2 class="text-xl font-semibold mb-2">Comentarios</h2>

    <!-- Lista de comentarios si hay alguno -->
    <ul v-if="comments.length > 0" class="mb-4 space-y-2">
      <li
        v-for="comment in comments"
        :key="comment.id"
        class="p-3 border border-gray-300 rounded-md bg-gray-50"
      >
        <!-- Encabezado del comentario: nombre del usuario y fecha -->
        <p class="text-sm text-gray-600 mb-1">
          <RouterLink
            :to="`/usuario/${comment.user_id}`"
            class="text-blue-600 font-semibold hover:underline"
          >
            {{
              comment.user_profiles?.display_name ||
              comment.user_profiles?.email
            }}
          </RouterLink>
          — {{ new Date(comment.created_at).toLocaleString() }}
        </p>

        <!-- Contenido del comentario -->
        <p class="text-gray-800">{{ comment.body }}</p>

        <!-- Si el comentario es del usuario logueado, muestra el botón de eliminar -->
        <div v-if="comment.user_id === user?.id" class="mt-2">
          <button
            @click="handleDeleteComment(comment.id)"
            class="text-red-600 text-sm hover:underline"
          >
            Eliminar
          </button>
        </div>
      </li>
    </ul>

    <!-- Si no hay comentarios -->
    <p v-else class="text-gray-500">No hay comentarios aún.</p>

    <form @submit.prevent="handleComment" class="mt-4">
      <!-- Área de texto para el nuevo comentario -->
      <textarea
        v-model="newComment"
        class="w-full p-2 border rounded mb-2"
        placeholder="Escribí tu comentario..."
      ></textarea>

      <!-- Botón para enviar el comentario -->
      <MainButton type="submit"> Comentar </MainButton>
    </form>
  </div>
</template>