import supabase from "./supabase";
import { v4 as uuidv4 } from "uuid"; // Importa la función para generar IDs únicos


  //Sube un archivo de imagen al Storage de Supabase.
export async function uploadPostImage(file, userId) {
  if (!file) {
    return null; // Si no hay archivo, no se hace nada
  }

  const fileExtension = file.name.split(".").pop(); // Obtiene la extensión del archivo
  const fileName = `${uuidv4()}.${fileExtension}`; // Genera un nombre único para el archivo
  // Define la ruta en el bucket de Storage (ej: 'post-images/user_id/nombre_unico.jpg')
  const filePath = `post-images/${userId}/${fileName}`; // 'post-images' debe ser el nombre de tu bucket

  try {
    // 📤 Subir archivo al bucket
    const { error: uploadError } = await supabase.storage
      .from("post-images") // Nombre del bucket de Storage
      .upload(filePath, file);

    if (uploadError) {
      console.error("[uploadPostImage] Error al subir imagen:", uploadError.message);
      throw uploadError; // Lanza el error para que sea manejado por la función que llama
    }

    // 🔗 Obtener URL pública del archivo subido
    const { data, error: publicUrlError } = supabase.storage
      .from("post-images") // Mismo nombre de bucket
      .getPublicUrl(filePath);

    if (publicUrlError) {
      console.error("[uploadPostImage] Error al obtener URL pública:", publicUrlError.message);
      throw publicUrlError; // Lanza el error
    }

    return data.publicUrl; // Devuelve la URL pública
  } catch (error) {
    console.error("[uploadPostImage] Excepción durante la subida de imagen:", error.message, error);
    return null; // Captura y maneja cualquier excepción durante el proceso
  }
}


 //Crea una nueva publicación en la base de datos.
export async function createPost(userId, body, category, imageUrl = null) {
  const { error } = await supabase
    .from("posts") // Accede a la tabla 'posts'
    .insert({
      // Inserta un nuevo registro con los datos proporcionados
      user_id: userId,
      body,
      category,
      image_url: imageUrl, // Guarda la URL de la imagen (puede ser null)
    });

  if (error) {
    console.error("[createPost] Error al crear publicación:", error.message, error);
    throw error; // Lanza el error para que el componente que llama lo maneje
  }
}


 //Obtiene todas las publicaciones de la base de datos, incluyendo información del perfil del usuario.
export async function getAllPosts() {
  const { data, error } = await supabase
    .from("posts") // Accede a la tabla 'posts'
    // Selecciona todas las columnas de 'posts' y hace un join con 'user_profiles'
    .select("*, user_profiles(id, email, display_name, hobbies, curso)")
    .order("created_at", { ascending: false }); // Ordena por fecha de creación (más recientes primero)

  if (error) {
    console.error("[getAllPosts] Error al obtener publicaciones:", error.message, error);
    throw error;
  }
  return data;
}


//Obtiene una publicación específica por su ID.
export async function fetchPostById(postId) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId) // Filtra por el ID de la publicación
    .single(); // Espera un solo resultado

  if (error) {
    console.error("[fetchPostById] Error al obtener post por ID:", error.message, error);
    throw error;
  }
  return data;
}


 //Elimina un comentario específico por su ID.
export async function removeCommentById(commentId, userId) {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId) // Filtra por el ID del comentario
    .eq("user_id", userId); // Asegura que solo el autor pueda eliminar (RLS)

  if (error) {
    console.error("[removeCommentById] Error al eliminar comentario:", error.message, error);
    throw error;
  }
}


 //Suscribe a cambios en tiempo real (INSERT) en la tabla 'comments' para un post específico.
export function subscribeToPostComments(postId, callback) {
  return supabase
    .channel("comments_channel") // Nombre del canal de tiempo real
    .on(
      "postgres_changes", // Escucha cambios en la base de datos
      {
        event: "INSERT", // Solo para inserciones
        schema: "public",
        table: "comments", // En la tabla 'comments'
        filter: `post_id=eq.${postId}`, // Filtra por el ID del post
      },
      (payload) => callback(payload.new) // Llama al callback con los nuevos datos
    )
    .subscribe(); // Inicia la suscripción
}


 //Elimina una publicación y todos sus comentarios asociados.
export async function deletePostAndComments(postId, userId) {
  // Primero, elimina todos los comentarios asociados a la publicación
  const { error: commentError } = await supabase
    .from("comments")
    .delete()
    .eq("post_id", postId); // Elimina comentarios que pertenecen a este post

  if (commentError) {
    console.error("[deletePostAndComments] Error al eliminar comentarios:", commentError.message, commentError);
    throw commentError;
  }

  // Luego, elimina la publicación principal
  const { error: postError } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId) // Filtra por el ID del post
    .eq("user_id", userId); // Asegura que solo el autor pueda eliminar (RLS)

  if (postError) {
    console.error("[deletePostAndComments] Error al eliminar post:", postError.message, postError);
    throw postError;
  }
}


 //Suscribe a cambios en tiempo real (INSERT, UPDATE, DELETE) en la tabla 'posts'.
export function subscribeToPostChanges(callback) {
  return supabase
    .channel("realtime_posts") // Nombre del canal de tiempo real
    .on(
      "postgres_changes", // Escucha cambios en la base de datos
      {
        event: "*", // Para todos los eventos (INSERT, UPDATE, DELETE)
        schema: "public",
        table: "posts", // En la tabla 'posts'
      },
      callback // Llama al callback con los datos del payload
    )
    .subscribe(); // Inicia la suscripción
}


 //Obtiene todas las publicaciones de un usuario específico.
export async function getPostsByUserId(userId) {
  try {
    const { data, error } = await supabase
      .from("posts") // Accede a la tabla 'posts'
      .select("*") // Selecciona todas las columnas
      .eq("user_id", userId) // Filtra por el ID del usuario
      .order("created_at", { ascending: false }); // Ordena por fecha de creación descendente

    if (error) {
      console.error("[getPostsByUserId] Error al obtener publicaciones por ID de usuario:", error.message, error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error("[getPostsByUserId] Excepción en getPostsByUserId:", error.message, error);
    throw error;
  }
}


 //Actualiza una publicación existente en la base de datos.
 
export async function updatePost(
  postId,
  newContent,
  newCategory,
  userId,
  newImageUrl = undefined
) {
  try {
    const updateData = { body: newContent, category: newCategory };
    // Solo actualiza la URL de la imagen si se proporciona un valor (incluido null)
    if (newImageUrl !== undefined) {
      updateData.image_url = newImageUrl;
    }

    const { data, error } = await supabase
      .from("posts")
      .update(updateData) // Actualiza los campos especificados
      .eq("id", postId) // Donde el ID de la publicación coincida
      .eq("user_id", userId); // Y donde el user_id coincida (para que solo el dueño edite)

    if (error) {
      console.error("[updatePost] Error al actualizar la publicación:", error.message, error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error("[updatePost] Excepción en updatePost:", error.message, error);
    throw error;
  }
}
