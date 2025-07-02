// Importamos el plugin para Vue
import vue from '@vitejs/plugin-vue';
import tailwind from '@tailwindcss/vite';

// Como suele suceder en todo archivo .config.js, exportamos el objeto de
// configuración.
export default {
    // Declaramos el uso del plugin de Vue y de Tailwind.
    plugins: [vue(), tailwind()],
}