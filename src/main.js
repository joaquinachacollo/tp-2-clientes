import './style.css';
import { createApp } from 'vue'; // Importamos la función para crear la aplicación de Vue.
import App from './App.vue'; // Importamos el componente raíz.
import router from './router/router';

// Creamos la aplicación, pasando el componente raíz.
const app = createApp(App);

// Registramos el router en la aplicación.
app.use(router);

// Montamos la aplicación en el div#app del [index.html].
app.mount('#app');