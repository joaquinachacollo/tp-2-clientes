import supabase from "./supabase";
import { createUserProfile, getUserProfileById, updateUserProfile } from "./user-profiles";

// Estado global del usuario autenticado
let user = {
    id: null,
    email: null,
    hobbies: null,
    display_name: null,
    curso: null,
};

// Lista de funciones (callbacks) que se ejecutan cuando cambia el usuario
let observers = [];

// Al cargar el archivo se intenta recuperar automáticamente el usuario actual
getCurrentAuthUser();

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
    fetchCurrentUserExtendedProfile();

    return data.user;
}


async function fetchCurrentUserExtendedProfile() {
    try {
        // Trae información extendida como hobbies, display_name y curso
        const profile = await getUserProfileById(user.id);

        updateUser({
            hobbies: profile.hobbies,
            display_name: profile.display_name,
            curso: profile.curso,
        });
    } catch (error) {
        console.error('[auth.js fetchCurrentUserExtendedProfile] Error al obtener perfil extendido: ', error);
    }
}


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
        });
    } catch (error) {
        console.error('[auth.js register] Error al crear el perfil del usuario: ', error);
    }

    updateUser({
        id: data.user.id,
        email: data.user.email,
    });

    return data.user;
}


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
    fetchCurrentUserExtendedProfile();

    return data.user;
}

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
    });
}

export async function updateCurrentUserProfile(data) {
    try {
        // Actualiza los datos en user_profiles
        await updateUserProfile(user.id, data);
    } catch (error) {
        console.error('[auth.js updateCurrentUserProfile] Error al actualizar perfil: ', error);
        throw error;
    }

    // Actualiza también el estado global
    updateUser({ ...data });
}


/*-------------------------------------------------------
| Funciones para el Observer
+--------------------------------------------------------*/

export function subscribeToAuthUserChanges(callback) {
    observers.push(callback);   // Guardamos el callback
    notify(callback);           // Lo llamamos inmediatamente con el estado actual
}

function notify(callback) {
    callback({ ...user }); // Le pasamos una copia del estado del usuario
}

function notifyAll() {
    observers.forEach(callback => notify(callback)); // Notifica a todos
}

function updateUser(data) {
    user = {
        ...user,  // mantiene lo anterior
        ...data,  // y actualiza lo nuevo
    };
    notifyAll(); // Notifica a todos los que están escuchando
}

