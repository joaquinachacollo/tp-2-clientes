<script>
import MainH1 from "../components/MainH1.vue";
import MainButton from "../components/MainButton.vue";
import MainLabel from "../components/MainLabel.vue";
import { subscribeToAuthUserChanges, getCurrentAuthUser, updatePassword } from "../services/auth"; // Importa updatePassword
import { updateUserProfile, uploadProfileImage, getUserProfileById } from "../services/user-profiles";


export default {
  name: "MyProfileEdit",
  components: { MainH1, MainButton, MainLabel },

  data() {
    return {
      user: null,
      profile: {
        display_name: null,
        hobbies: null,
        age: null,
        curso: null,
        avatar_url: null,
      },
      editing: false, // Estado de carga/guardado para el perfil
      
      selectedFile: null,
      previewImageUrl: null,

      // --- NUEVOS ESTADOS PARA CAMBIO DE CONTRASEÑA ---
      currentPassword: '', // Opcional: para validar la contraseña actual (Supabase no lo requiere por defecto, pero es buena UX)
      newPassword: '',
      confirmNewPassword: '',
      changingPassword: false, // Estado de carga/guardado para el cambio de contraseña
      // --- FIN NUEVOS ESTADOS ---
    };
  },

  methods: {
    /**
     * Maneja el evento de cambio del input de tipo 'file' para el avatar.
     * Almacena el archivo seleccionado y crea una URL para previsualización.
     * @param {Event} event El evento de cambio del input.
     */
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
            alert("Por favor, selecciona un archivo de imagen válido.");
            this.clearSelectedFile();
            return;
        }
        this.selectedFile = file;
        this.previewImageUrl = URL.createObjectURL(file);
        if (this._oldPreviewUrl) {
          URL.revokeObjectURL(this._oldPreviewUrl);
        }
        this._oldPreviewUrl = this.previewImageUrl;
      } else {
        this.clearSelectedFile();
      }
    },

    /**
     * Limpia el archivo de imagen seleccionado y la URL de previsualización del avatar.
     */
    clearSelectedFile() {
      this.selectedFile = null;
      if (this.previewImageUrl && this.previewImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.previewImageUrl);
      }
      this.previewImageUrl = null;
      const fileInput = document.getElementById('profile-avatar');
      if (fileInput) {
        fileInput.value = '';
      }
    },

    /**
     * Maneja el envío del formulario de edición de perfil.
     * Incluye la lógica para subir la imagen de perfil si es necesario.
     */
    async handleSubmit() {
      this.editing = true;
      let finalAvatarUrl = null;

      try {
        if (this.selectedFile) {
          finalAvatarUrl = await uploadProfileImage(this.selectedFile, this.user.id);
          if (!finalAvatarUrl) {
            Swal.fire('Error', 'Hubo un problema al subir la imagen de perfil.', 'error');
            this.editing = false;
            return;
          }
        } else {
          if (this.profile.avatar_url && this.previewImageUrl && !this.previewImageUrl.startsWith('blob:')) {
            finalAvatarUrl = this.profile.avatar_url;
          } else if (this.profile.avatar_url && !this.previewImageUrl) {
            finalAvatarUrl = null;
          }
        }

        const profileDataToUpdate = {
          display_name: this.profile.display_name,
          hobbies: this.profile.hobbies,
          age: this.profile.age,
          curso: this.profile.curso,
        };

        await updateUserProfile(this.user.id, profileDataToUpdate, finalAvatarUrl);

        Swal.fire('¡Éxito!', 'Perfil actualizado correctamente.', 'success');
      } catch (error) {
        console.error("Error al actualizar el perfil:", error);
        Swal.fire('Error', 'Hubo un problema al actualizar tu perfil.', 'error');
      } finally {
        this.editing = false;
      }
    },

    /**
     * Maneja el envío del formulario de cambio de contraseña.
     */
    async handleChangePassword() {
      this.changingPassword = true;

      // Validaciones básicas de contraseña
      if (!this.newPassword) {
        alert("La nueva contraseña no puede estar vacía.");
        this.changingPassword = false;
        return;
      }
      if (this.newPassword.length < 6) {
        alert("La nueva contraseña debe tener al menos 6 caracteres.");
        this.changingPassword = false;
        return;
      }
      if (this.newPassword !== this.confirmNewPassword) {
        alert("Las contraseñas no coinciden.");
        this.changingPassword = false;
        return;
      }

      try {
        // Supabase no requiere la contraseña actual por defecto para updateUser
        await updatePassword(this.newPassword);
        Swal.fire('¡Éxito!', 'Contraseña actualizada correctamente.', 'success');
        // Limpiar campos de contraseña después del éxito
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
      } catch (error) {
        console.error("Error al cambiar la contraseña:", error);
        Swal.fire('Error', 'Hubo un problema al cambiar la contraseña. Asegúrate de que tu sesión esté activa.', 'error');
      } finally {
        this.changingPassword = false;
      }
    },

    /**
     * Carga los datos del perfil del usuario autenticado.
     */
    async loadProfile() {
      this.user = await getCurrentAuthUser();
      if (this.user) {
        const userProfileData = await getUserProfileById(this.user.id);
        if (userProfileData) {
          this.profile.display_name = userProfileData.display_name;
          this.profile.hobbies = userProfileData.hobbies;
          this.profile.age = userProfileData.age;
          this.profile.curso = userProfileData.curso;
          this.profile.avatar_url = userProfileData.avatar_url;
          this.previewImageUrl = userProfileData.avatar_url;
        }
      }
    },
  },

  // Hook mounted: se ejecuta cuando el componente es montado
  async mounted() {
    await this.loadProfile();
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

    <!-- Formulario para editar el perfil (datos y avatar) -->
    <form @submit.prevent="handleSubmit" class="space-y-6 mt-4">
      <!-- Campo para la imagen de perfil (Avatar) -->
      <div>
        <MainLabel for="profile-avatar">Imagen de perfil :</MainLabel>
        <div class="flex items-center space-x-4 mt-2">
          <!-- Previsualización del avatar -->
          <img
            v-if="previewImageUrl"
            :src="previewImageUrl"
            alt="Avatar de perfil"
            class="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-lg"
          />
          <img
            v-else
            src="../img/estudiante.png"
            alt="Avatar por defecto"
            class="w-24 h-24 rounded-full object-cover border-4 border-gray-300 shadow-lg"
          />
          
          <!-- Input de archivo y botón de borrar -->
          <div class="flex-grow">
            <input
              type="file"
              id="profile-avatar"
              @change="handleFileChange"
              accept="image/*"
              class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              v-if="selectedFile || previewImageUrl"
              @click="clearSelectedFile"
              type="button"
              class="text-red-600 hover:text-red-800 text-sm font-medium mt-2"
            >
              Borrar imagen
            </button>
          </div>
        </div>
      </div>

      <!-- Campo para hobbies -->
      <div>
        <MainLabel for="hobbies">Hobbies</MainLabel>
        <textarea
          v-model="profile.hobbies"
          id="hobbies"
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

    <hr class="my-8 border-gray-300" /> <!-- Separador visual -->

    <!-- Formulario para cambiar contraseña -->
    <MainH1 class="!text-xl mb-4">Cambiar Contraseña</MainH1> <!-- Título más pequeño para esta sección -->
    <form @submit.prevent="handleChangePassword" class="space-y-6">
      <!-- Campo para nueva contraseña -->
      <div>
        <MainLabel for="new_password">Nueva Contraseña</MainLabel>
        <input
          v-model="newPassword"
          type="password"
          id="new_password"
          minlength="6"
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <!-- Campo para confirmar nueva contraseña -->
      <div>
        <MainLabel for="confirm_new_password">Confirmar Nueva Contraseña</MainLabel>
        <input
          v-model="confirmNewPassword"
          type="password"
          id="confirm_new_password"
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Repite la nueva contraseña"
        />
      </div>

      <!-- Botón para cambiar contraseña -->
      <MainButton :disabled="changingPassword" type="submit">
        {{ changingPassword ? "Cambiando..." : "Cambiar Contraseña" }}
      </MainButton>
    </form>
  </div>
</template>
