import supabase from "./supabase";
import { createUserProfile, getUserProfileById, updateUserProfile } from "./user-profiles";

// Estado global del usuario autenticado
let user = {
    id: null,
    email: null,
    hobbies: null,
    display_name: null,
    curso: null,
    avatar_url: null, // Asegúrate de que avatar_url también esté en el estado global si lo usas
};

// Lista de funciones (callbacks) que se ejecutan cuando cambia el usuario
let observers = [];

// Al cargar el archivo se intenta recuperar automáticamente el usuario actual
getCurrentAuthUser();

/**
 * Obtiene el usuario autenticado actual de Supabase y actualiza el estado global.
 * @returns {Promise<Object|null>} El objeto del usuario autenticado o null si no hay.
 */
export async function getCurrentAuthUser() {
    // Supabase obtiene el usuario actual (si está autenticado)
    const { data, error } = await supabase.auth.getUser();

    if (error) {
        console.error('[auth.js getCurrentAuthUser] Error al obtener el usuario autenticado: ', error);
        return null; // si falla, salimos
    }

    // Guardamos el id y email en el estado global
    updateUser({
        id: data.user.id,
        email: data.user.email,
    });

    // Cargamos datos adicionales desde la tabla user_profiles
    await fetchCurrentUserExtendedProfile(); // Usar await para asegurar que el perfil extendido se carga antes de retornar

    return data.user;
}

/**
 * Carga los datos extendidos del perfil del usuario autenticado desde la tabla user_profiles.
 */
async function fetchCurrentUserExtendedProfile() {
    try {
        // Trae información extendida como hobbies, display_name, curso y avatar_url
        const profile = await getUserProfileById(user.id);

        if (profile) { // Asegurarse de que el perfil exista
            updateUser({
                hobbies: profile.hobbies,
                display_name: profile.display_name,
                curso: profile.curso,
                avatar_url: profile.avatar_url, // Incluir avatar_url
                age: profile.age, // Incluir age si lo manejas en el perfil
            });
        }
    } catch (error) {
        console.error('[auth.js fetchCurrentUserExtendedProfile] Error al obtener perfil extendido: ', error);
    }
}

/**
 * Registra un nuevo usuario en Supabase Auth y crea su perfil inicial.
 * @param {string} email El email del usuario.
 * @param {string} password La contraseña del usuario.
 * @returns {Promise<Object>} El objeto del usuario registrado.
 */
export async function register(email, password) {
    // Registra al usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error('[auth.js register] Error al registrar el usuario: ', error);
        throw error;
    }

    try {
        // Creamos el perfil correspondiente en user_profiles (mismo id)
        await createUserProfile({
            id: data.user.id,
            email: data.user.email,
            display_name: null,
            hobbies: null,
            curso: null,
            age: null, // Asegúrate de inicializar age si es un campo requerido
            avatar_url: null, // Inicializa avatar_url
        });
    } catch (error) {
        console.error('[auth.js register] Error al crear el perfil del usuario: ', error);
        // Opcional: Si falla la creación del perfil, ¿se debe eliminar el usuario de auth?
        // Por ahora, solo logueamos el error.
    }

    updateUser({
        id: data.user.id,
        email: data.user.email,
    });

    return data.user;
}

/**
 * Inicia sesión de un usuario en Supabase Auth.
 * @param {string} email El email del usuario.
 * @param {string} password La contraseña del usuario.
 * @returns {Promise<Object>} El objeto del usuario que inició sesión.
 */
export async function login(email, password) {
    // Login tradicional con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('[auth.js login] Error al iniciar sesión: ', error);
        throw error;
    }

    // Actualizamos estado del usuario
    updateUser({
        id: data.user.id,
        email: data.user.email,
    });

    // Obtenemos datos extendidos (hobbies, etc.)
    await fetchCurrentUserExtendedProfile(); // Usar await

    return data.user;
}

/**
 * Cierra la sesión del usuario en Supabase.
 */
export async function logout() {
    // Cierra sesión en Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('[auth.js logout] Error al cerrar sesión: ', error);
        throw error;
    }

    // Limpiamos el estado del usuario
    updateUser({
        id: null,
        email: null,
        hobbies: null,
        display_name: null,
        curso: null,
        avatar_url: null, // Limpiar avatar_url también
        age: null, // Limpiar age
    });
}

/**
 * Actualiza los datos del perfil del usuario actual en la tabla user_profiles.
 * @param {Object} data Los datos a actualizar en el perfil.
 */
export async function updateCurrentUserProfile(data) {
    try {
        // Actualiza los datos en user_profiles
        // Nota: updateUserProfile en user-profiles.js ya maneja avatar_url
        await updateUserProfile(user.id, data);
    } catch (error) {
        console.error('[auth.js updateCurrentUserProfile] Error al actualizar perfil: ', error);
        throw error;
    }

    // Actualiza también el estado global
    updateUser({ ...data });
}

/**
 * Actualiza la contraseña del usuario autenticado.
 * Supabase solo requiere la nueva contraseña.
 * @param {string} newPassword La nueva contraseña.
 * @returns {Promise<Object>} Los datos del usuario actualizado.
 */
export async function updatePassword(newPassword) {
    try {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            console.error('[auth.js updatePassword] Error al actualizar la contraseña:', error);
            throw error;
        }
        return data.user;
    } catch (error) {
        console.error('[auth.js updatePassword] Excepción al actualizar la contraseña:', error);
        throw error;
    }
}


/*-------------------------------------------------------
| Funciones para el Observer
+--------------------------------------------------------*/

/**
 * Suscribe un callback a los cambios en el estado del usuario autenticado.
 * El callback se llama inmediatamente con el estado actual del usuario.
 * @param {Function} callback La función a ejecutar cuando el usuario cambia.
 */
export function subscribeToAuthUserChanges(callback) {
    observers.push(callback); // Guardamos el callback
    notify(callback);         // Lo llamamos inmediatamente con el estado actual
}

/**
 * Notifica a un callback específico con el estado actual del usuario.
 * @param {Function} callback El callback a notificar.
 */
function notify(callback) {
    callback({ ...user }); // Le pasamos una copia del estado del usuario
}

/**
 * Notifica a todos los callbacks suscritos con el estado actual del usuario.
 */
function notifyAll() {
    observers.forEach(callback => notify(callback)); // Notifica a todos
}

/**
 * Actualiza el estado global del usuario y notifica a todos los suscriptores.
 * @param {Object} data Los datos del usuario a actualizar.
 */
function updateUser(data) {
    user = {
        ...user,   // mantiene lo anterior
        ...data,   // y actualiza lo nuevo
    };
    notifyAll(); // Notifica a todos los que están escuchando
}
