import supabase from "./supabase";
import { v4 as uuidv4 } from 'uuid';

export async function createUserProfile(data) {
  const { error } = await supabase
    .from('user_profiles')       // accede a la tabla "user_profiles"
    .insert(data);               // inserta los datos del nuevo perfil

  if (error) {
    console.error('[user-profiles.js createUserProfile] Error al crear el perfil del usuario: ', error);
    throw error; // lanza el error para que lo maneje quien llama la función
  }
}

// Sube un archivo de imagen de perfil al Storage de Supabase.
export async function uploadProfileImage(file, userId) {
    if (!file) return null;

    const fileExtension = file.name.split('.').pop();
    // Usa el ID del usuario como nombre de archivo para asegurar que solo haya una imagen de perfil por usuario
    // o un nombre único dentro de la carpeta del usuario. Aquí usaremos el UID para el nombre del archivo.
    // Esto sobrescribirá la imagen anterior si el usuario sube una nueva.
    const fileName = `${userId}.${fileExtension}`; // O `${userId}-${uuidv4()}.${fileExtension}` si quieres múltiples versiones
    const filePath = `profile-images/${userId}/${fileName}`; // Asegúrate de que 'profile-images' es el nombre de tu bucket

    try {
        // Sube el archivo al bucket 'profile-images'
        const { data, error } = await supabase.storage
            .from('profile-images') // Nombre del bucket de Storage para perfiles
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true // Importante: sobrescribe si el archivo ya existe (para actualizar imagen de perfil)
            });

        if (error) {
            console.error("Error al subir imagen de perfil a Supabase Storage:", error.message, error);
            throw error;
        }

        // Obtener la URL pública del archivo subido
        const { data: publicUrlData } = supabase.storage
            .from('profile-images') // Mismo nombre de bucket
            .getPublicUrl(filePath);

        if (publicUrlData) {
            return publicUrlData.publicUrl;
        } else {
            console.error("No se pudo obtener la URL pública de la imagen de perfil.");
            return null;
        }

    } catch (error) {
        console.error("Excepción en uploadProfileImage:", error.message, error);
        return null;
    }
}

// Actualiza el perfil de un usuario.
export async function updateUserProfile(userId, profileData, avatarUrl = undefined) {
    const updatePayload = { ...profileData }; // Copia los datos existentes

    // Si avatarUrl es proporcionado (no undefined), lo añade al payload.
    // Esto permite explícitamente establecerlo a null para borrar la imagen.
    if (avatarUrl !== undefined) {
        updatePayload.avatar_url = avatarUrl;
    }

    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .update(updatePayload)
            .eq('id', userId)
            .single();

        if (error) {
            console.error("Error al actualizar perfil de usuario:", error.message, error);
            throw error;
        }
        return data;
    } catch (error) {
        console.error("Excepción en updateUserProfile:", error.message, error);
        throw error;
    }
}

// Obtiene el perfil de un usuario por su ID.
export async function getUserProfileById(userId) {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('id, email, display_name, hobbies, curso, age, avatar_url') // Asegúrate de seleccionar avatar_url
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 es "no rows found"
            console.error("Error al obtener perfil de usuario:", error.message, error);
            throw error;
        }
        return data; // Retorna el perfil o null si no se encontró
    } catch (error) {
        console.error("Excepción en getUserProfileById:", error.message, error);
        return null;
    }
}
