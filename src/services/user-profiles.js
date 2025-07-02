import supabase from "./supabase";

export async function createUserProfile(data) {
  const { error } = await supabase
    .from('user_profiles')       // accede a la tabla "user_profiles"
    .insert(data);               // inserta los datos del nuevo perfil

  if (error) {
    console.error('[user-profiles.js createUserProfile] Error al crear el perfil del usuario: ', error);
    throw error; // lanza el error para que lo maneje quien llama la función
  }
}


export async function updateUserProfile(id, data) {
  const { error } = await supabase
    .from('user_profiles')       // accede a la tabla
    .update(data)                // actualiza las columnas con el contenido de "data"
    .eq('id', id);               // donde el id del usuario coincida

  if (error) {
    console.error('[user-profiles.js updateUserProfile] Error al actualizar el perfil del usuario: ', error);
    throw error;
  }
}


export async function getUserProfileById(id) {
  const { data, error } = await supabase
    .from('user_profiles')       // accede a la tabla
    .select()                    // selecciona todas las columnas
    .eq('id', id);               // donde el id coincida

  if (error) {
    console.error('[user-profiles.js getUserProfileById] Error al obtener el perfil del usuario: ', error);
    throw error;
  }
  return data[0]; // retorna el primer (y único) resultado
}
