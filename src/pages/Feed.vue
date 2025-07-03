<script>
// Importamos funciones necesarias desde los servicios
import { getCurrentAuthUser } from "../services/auth.js";
import {
  getAllPosts,
  createPost,
  updatePost,
  deletePostAndComments,
  subscribeToPostChanges,
  uploadPostImage,
} from "../services/post.js";

// Componentes personalizados
import MainH1 from "../components/MainH1.vue";
import MainButton from "../components/MainButton.vue";

export default {
  name: "Feed", // Nombre del componente
  components: { MainH1, MainButton }, // Componentes utilizados en el template

  data() {
    return {
      posts: [], // Array que almacena todas las publicaciones a mostrar en el feed
      newPost: "", // Contenido del campo de texto para crear una nueva publicación
      selectedCategory: "", // Categoría seleccionada en el dropdown para una nueva publicación
      user: null, // Objeto del usuario autenticado actualmente

      // Estados para la funcionalidad de edición de publicaciones
      editingPostId: null, // ID de la publicación que se está editando (null si no se está editando)
      editingPostContent: "", // Contenido de la publicación en edición
      editingPostCategory: "", // Categoría de la publicación en edición

      // Estados para la gestión de imágenes
      selectedFile: null, // Objeto File del archivo de imagen seleccionado por el usuario
      previewImageUrl: null, // URL temporal para mostrar una vista previa de la imagen (blob: o URL de Supabase)
    };
  },

  // Propiedades computadas para manejar el v-model condicionalmente (crear vs. editar)
  computed: {
    // Maneja el v-model del selector de categoría
    postCategory: {
      get() {
        // Si se está editando, devuelve la categoría de edición; si no, la de nueva publicación.
        return this.editingPostId ? this.editingPostCategory : this.selectedCategory;
      },
      set(value) {
        // Cuando el valor cambia, actualiza la propiedad de datos correspondiente.
        if (this.editingPostId) {
          this.editingPostCategory = value;
        } else {
          this.selectedCategory = value;
        }
      }
    },
    // Maneja el v-model del textarea de contenido del post
    postContent: {
      get() {
        // Si se está editando, devuelve el contenido de edición; si no, el de nueva publicación.
        return this.editingPostId ? this.editingPostContent : this.newPost;
      },
      set(value) {
        // Cuando el valor cambia, actualiza la propiedad de datos correspondiente.
        if (this.editingPostId) {
          this.editingPostContent = value;
        } else {
          this.newPost = value;
        }
      }
    }
  },

  methods: {
    /**
     * Carga todas las publicaciones desde Supabase y las asigna a 'posts'.
     */
    async loadPosts() {
      this.posts = await getAllPosts();
    },

    /**
     * Maneja el evento de cambio del input de tipo 'file'.
     * Almacena el archivo seleccionado y crea una URL para previsualización.
     * @param {Event} event El evento de cambio del input.
     */
    handleFileChange(event) {
      const file = event.target.files[0]; // Obtiene el primer archivo seleccionado
      if (file) {
        // Valida que el archivo sea una imagen
        if (!file.type.startsWith('image/')) {
            alert("Por favor, selecciona un archivo de imagen válido.");
            this.clearSelectedFile(); // Limpia la selección si no es imagen
            return;
        }

        this.selectedFile = file; // Almacena el archivo
        // Crea una URL de objeto temporal para mostrar la previsualización
        this.previewImageUrl = URL.createObjectURL(file);

        // Revoca la URL de objeto anterior para liberar memoria si se selecciona un nuevo archivo
        if (this._oldPreviewUrl) {
          URL.revokeObjectURL(this._oldPreviewUrl);
        }
        this._oldPreviewUrl = this.previewImageUrl; // Guarda la URL actual para futura revocación
      } else {
        this.clearSelectedFile(); // Si no se selecciona archivo, limpia todo
      }
    },

    /**
     * Limpia el archivo de imagen seleccionado y la URL de previsualización.
     * También resetea el input de tipo 'file'.
     */
    clearSelectedFile() {
      this.selectedFile = null; // Elimina la referencia al archivo
      if (this.previewImageUrl && this.previewImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.previewImageUrl); // Revoca la URL de objeto para liberar memoria
      }
      this.previewImageUrl = null; // Elimina la URL de previsualización
      // Resetea el valor del input de tipo 'file' para permitir seleccionar el mismo archivo de nuevo
      const fileInput = document.getElementById('post-image');
      if (fileInput) {
        fileInput.value = '';
      }
    },

    /**
     * Maneja el envío del formulario para crear o actualizar una publicación.
     * Incluye la lógica para subir la imagen si es necesario.
     */
    async handleSavePost() {
      // Obtiene el contenido y la categoría a guardar (desde las propiedades computadas)
      let contentToSave = this.postContent;
      let categoryToSave = this.postCategory;

      // Validaciones básicas del formulario
      if (!contentToSave.trim()) {
        alert("El contenido de la publicación no puede estar vacío.");
        return;
      }
      if (!categoryToSave) {
        alert("Por favor, seleccioná una categoría.");
        return;
      }

      let finalImageUrl = null; // Variable para almacenar la URL final de la imagen a guardar en DB

      try {
        // Lógica para subir la imagen al Storage ANTES de guardar el post en la DB
        if (this.selectedFile) {
          // Si hay un archivo nuevo seleccionado, se sube
          finalImageUrl = await uploadPostImage(this.selectedFile, this.user.id);
          if (!finalImageUrl) {
            alert("Error al subir la imagen. Por favor, intentá de nuevo.");
            return; // Detiene el proceso si la subida de imagen falla
          }
        } else if (this.editingPostId) {
          // Si estamos editando y NO se seleccionó un nuevo archivo
          const currentPost = this.posts.find(p => p.id === this.editingPostId);
          if (currentPost && currentPost.image_url) {
            if (this.previewImageUrl && !this.previewImageUrl.startsWith('blob:')) {
              // Si la previsualización es la URL existente de Supabase (no un blob nuevo),
              // significa que el usuario no cambió la imagen, se mantiene la existente.
              finalImageUrl = currentPost.image_url;
            } else if (!this.previewImageUrl) {
              // Si la imagen existente fue borrada (previewImageUrl es null),
              // se establece a null para eliminarla de la base de datos.
              finalImageUrl = null;
            }
          }
        }
        // Si estamos creando y no hay selectedFile, finalImageUrl ya es null, lo cual es correcto.

        // Llama a la función de Supabase para actualizar o crear la publicación
        if (this.editingPostId) {
          // Si hay un ID de post en edición, se actualiza
          await updatePost(
            this.editingPostId,
            contentToSave,
            categoryToSave,
            this.user.id,
            finalImageUrl // Pasa la URL final de la imagen (puede ser null)
          );
          this.cancelEdit(); // Limpia el modo edición después de guardar
        } else {
          // Si no hay ID de post en edición, se crea una nueva publicación
          await createPost(this.user.id, contentToSave, categoryToSave, finalImageUrl);
          this.newPost = ""; // Limpia el campo de texto
          this.selectedCategory = ""; // Limpia la categoría
        }
        this.clearSelectedFile(); // Limpia el input de archivo después de guardar
      } catch (error) {
        console.error("Error general al guardar la publicación:", error);
        alert("Error al guardar la publicación."); // Mantiene un alert para errores
      }
    },

    /**
     * Maneja la eliminación de una publicación (y sus comentarios) con una confirmación de SweetAlert2.
     * @param {string} postId El ID de la publicación a eliminar.
     */
    async handleDeletePost(postId) {
      // Muestra un SweetAlert2 para confirmar la eliminación
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminarla!',
        cancelButtonText: 'Cancelar'
      });

      if (!result.isConfirmed) {
        return; // Si el usuario cancela, no se hace nada
      }

      try {
        // Llama a la función del servicio para eliminar la publicación y sus comentarios
        await deletePostAndComments(postId, this.user.id);
      
      } catch (error) {
        console.error("Error al eliminar publicación:", error);
        // Muestra un SweetAlert2 de error
        Swal.fire(
          'Error',
          'Hubo un problema al eliminar la publicación. Asegúrate de ser el autor.',
          'error'
        );
      }
    },

    /**
     * Inicia el modo de edición para una publicación específica.
     * Precarga los datos de la publicación en el formulario.
     * @param {Object} post El objeto de la publicación a editar.
     */
    startEdit(post) {
      this.editingPostId = post.id; // Establece el ID del post en edición
      this.editingPostContent = post.body; // Carga el contenido del post
      this.editingPostCategory = post.category; // Carga la categoría del post

      this.previewImageUrl = post.image_url; // Muestra la imagen existente del post
      this.selectedFile = null; // Asegura que no haya un nuevo archivo seleccionado

      // Resetea el input de tipo 'file' por seguridad y UX
      const fileInput = document.getElementById('post-image');
      if (fileInput) {
        fileInput.value = '';
      }

      // Limpia los campos de "nueva publicación" para evitar confusión
      this.newPost = "";
      this.selectedCategory = "";
    },

    /**
     * Cancela el modo de edición y resetea el formulario a su estado de creación.
     */
    cancelEdit() {
      this.editingPostId = null; // Desactiva el modo edición
      this.editingPostContent = ""; // Limpia el contenido de edición
      this.editingPostCategory = ""; // Limpia la categoría de edición

      this.newPost = ""; // Limpia el campo de nueva publicación
      this.selectedCategory = ""; // Limpia la categoría de nueva publicación
      this.clearSelectedFile(); // Limpia la imagen y previsualización
    },

    /**
     * Inicializa el feed: obtiene el usuario autenticado, carga las publicaciones
     * y activa la suscripción en tiempo real a los cambios en las publicaciones.
     */
    async initFeed() {
      this.user = await getCurrentAuthUser(); // Obtiene el usuario actual
      await this.loadPosts(); // Carga las publicaciones iniciales
      // Suscribe a los cambios de publicaciones en tiempo real.
      // Cuando hay un cambio (creación, edición, eliminación), loadPosts() se llama automáticamente.
      subscribeToPostChanges(this.loadPosts);
    },
  },

  /**
   * Hook de ciclo de vida: Se ejecuta cuando el componente es montado en el DOM.
   * Llama a initFeed para configurar el componente.
   */
  async mounted() {
    await this.initFeed();
  },
};
</script>

<template>
  <div>
    <!-- Título principal de la sección de Publicaciones -->
    <MainH1>Publicaciones</MainH1>

    <!-- Formulario para crear o editar una publicación -->
    <form @submit.prevent="handleSavePost" class="mb-4 space-y-4">
      <!-- Selector de categoría de la publicación -->
      <label for="post-category" class="sr-only">Selecciona una categoría</label>
      <select
        id="post-category"
        v-model="postCategory"
        class="w-full p-2 border border-gray-300 rounded bg-white"
      >
        <option disabled value="">Seleccioná una categoría...</option>
        <option value="Tarea">Tarea</option>
        <option value="Ayuda">Ayuda</option>
        <option value="Anuncio">Anuncio</option>
        <option value="Proyecto">Proyecto</option>
      </select>

      <!-- Campo de texto para el contenido de la publicación -->
      <label for="post-content" class="sr-only">Escribe tu publicación</label>
      <textarea
        id="post-content"
        v-model="postContent"
        class="w-full p-2 border rounded"
        placeholder="Escribí tu publicación..."
      ></textarea>

      <!-- Input para subir una imagen (opcional) -->
      <div class="flex items-center space-x-4">
        <label for="post-image" class="block text-sm font-medium text-gray-700">Imagen (opcional):</label>
        <input
          type="file"
          id="post-image"
          @change="handleFileChange"
          accept="image/*"
          class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <!-- Botón para borrar la imagen seleccionada o la previsualización -->
        <button
          v-if="selectedFile || previewImageUrl"
          @click="clearSelectedFile"
          type="button"
          class="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Borrar imagen
        </button>
      </div>

      <!-- Área para mostrar la previsualización de la imagen seleccionada -->
      <div v-if="previewImageUrl" class="mt-2">
        <img
          :src="previewImageUrl"
          alt="Vista previa de la imagen"
          class="max-w-full h-auto rounded-lg shadow-md"
          @error="console.error('Error al cargar previsualización:', $event.target.src)"
        />
      </div>

      <!-- Botón principal para enviar el formulario (Publicar o Guardar Cambios) -->
      <MainButton type="submit" class="mt-2">
        {{ editingPostId ? "Guardar Cambios" : "Publicar" }}
      </MainButton>

      <!-- Botón para cancelar la edición (visible solo en modo edición) -->
      <MainButton
        v-if="editingPostId"
        @click="cancelEdit"
        type="button"
        class="mt-2 ml-2 bg-gray-500 hover:bg-gray-700"
      >
        Cancelar
      </MainButton>
    </form>

    <!-- Lista de todas las publicaciones -->
    <ul class="space-y-4">
      <li
        v-for="post in posts"
        :key="post.id"
        class="bg-white rounded-xl shadow-md p-4 border border-gray-200 hover:shadow-lg transition"
      >
        <!-- Información del autor y fecha de la publicación -->
        <p class="text-sm text-gray-500 mb-1">
          <RouterLink
            :to="`/usuario/${post.user_id}`"
            class="text-blue-700 font-semibold hover:underline"
          >
            {{ post.user_profiles?.display_name || post.user_profiles?.email }}
          </RouterLink>
          • {{ new Date(post.created_at).toLocaleString() }}
        </p>

        <!-- Categoría de la publicación (si existe) -->
        <span
          v-if="post.category"
          class="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800 mb-2"
        >
          {{ post.category }}
        </span>

        <!-- Contenido principal de la publicación -->
        <p class="text-gray-800 text-base mb-2">{{ post.body }}</p>

        <!-- Muestra la imagen de la publicación si existe -->
        <div v-if="post.image_url" class="mb-4">
          <img
            :src="post.image_url"
            :alt="post.body || 'Imagen de publicación'"
            class="max-w-md h-auto object-contain rounded-lg shadow-md " 
            @error="console.error('Error al cargar imagen del post:', $event.target.src)"
          />
        </div>

        <!-- Botones de acción (Editar y Eliminar) visible solo para el autor de la publicación -->
        <div v-if="post.user_id === user?.id" class="mt-2 flex gap-2">
          <button
            @click="startEdit(post)"
            class="text-blue-600 text-sm hover:underline"
          >
            Editar
          </button>
          <button
            @click="handleDeletePost(post.id)"
            class="text-red-600 text-sm hover:underline"
          >
            Eliminar publicación
          </button>
        </div>

        <!-- Enlace para ver los comentarios de la publicación -->
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
