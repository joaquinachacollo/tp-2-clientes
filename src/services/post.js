import supabase from './supabase';

// crea una nueva publicación
export async function createPost(userId, body, category) {
  const { error } = await supabase
    .from("posts")                     // Accede a la tabla 'posts'
    .insert({                         // Inserta un nuevo registro con:
      user_id: userId,                // - ID del usuario que publica
      body,                           // - Contenido del post
      category,                       // - Categoría del post (Tarea, Ayuda, etc.)
    });

  if (error) {
    console.error("[posts.js createPost] Error al crear publicación", error);
    throw error; // Lanza el error para que el componente que llama lo maneje
  }
}

// obtiene todas las publicaciones
export async function getAllPosts() {
  const { data, error } = await supabase
    .from('posts') // Accede a la tabla 'posts'
    .select('*, user_profiles(id, email, display_name, hobbies, curso)') // Hace join con los perfiles de usuario
    .order('created_at', { ascending: false }); // Ordena por fecha descendente

  if (error) {
    console.error('[posts.js] Error al obtener publicaciones:', error);
    throw error;
  }

  return data;
}

export async function fetchPostById(postId) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (error) throw error;
  return data;
}

export async function removeCommentById(commentId, userId) {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", userId);

  if (error) throw error;
}

export function subscribeToPostComments(postId, callback) {
  return supabase
    .channel("comments_channel")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "comments",
        filter: `post_id=eq.${postId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
}

// Recarga las publicaciones
export async function deletePostAndComments(postId, userId) {
  // Elimina comentarios primero (para evitar errores por clave foránea)
  const { error: commentError } = await supabase
    .from("comments")
    .delete()
    .eq("post_id", postId);

  if (commentError) throw commentError;

  // Luego elimina el post, asegurando que sea del usuario
  const { error: postError } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", userId);

  if (postError) throw postError;
}

// Suscripción en tiempo real a camhobbiess en "posts"
export function subscribeToPostChanges(callback) {
  return supabase
    .channel("realtime_posts")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "posts",
      },
      callback
    )
    .subscribe();
}


