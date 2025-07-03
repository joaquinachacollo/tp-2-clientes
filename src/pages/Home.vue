<script>
import MainH1 from '../components/MainH1.vue';

export default {
    name: 'Home',
    components: { MainH1 },
}
</script>

<template>
  <div class="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-xl shadow space-y-6">
    <div class="flex items-center gap-3">
      <img src="/src/img/estudiante.png" alt="Estudiantes" class="w-12 h-12" />
      <MainH1>¡Bienvenidos a AulaLink!</MainH1>
    </div>

    <p class="text-gray-700 text-lg">
      Esta es la red social de nuestra escuela secundaria. Acá vas a poder compartir ideas, hacer publicaciones,
      dejar comentarios, y conectarte con tus compañeros y profesores.
    </p>

    <div class="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md shadow">
      <p class="font-semibold">¿Nuevo en AulaLink?</p>
      <p>Empezá creando tu primera publicación o explorá los perfiles de tus compañeros.</p>
    </div>

    <div>
      <p class="text-gray-600 mb-2">En AulaLink podés:</p>
      <ul class="space-y-2 text-gray-800">
        <li class="flex items-center gap-2">
          Ver las publicaciones de toda la comunidad educativa
        </li>
        <li class="flex items-center gap-2">
          Comentar y responder
        </li>
        <li class="flex items-center gap-2">
          Editar tu perfil y mostrar tu curso
        </li>
        <li class="flex items-center gap-2">
          Participar en el chat global
        </li>
      </ul>
    </div>
  </div>
</template>
