import supabase from './supabase';

//  crea un nuevo comentario
export async function createComment(postId, userId, body) {
  const { error } = await supabase
    .from('comments')     // Selecciona la tabla 'comments'
    .insert({
      post_id: postId,    // ID del post al que pertenece el comentario
      user_id: userId,    // ID del usuario que comenta
      body,               // Contenido del comentario
    });

  if (error) {
    console.error('[comments.js] Error al crear comentario:', error);
    throw error;
  }
}

// obtiene todos los comentarios
export async function getCommentsByPost(postId) {
  const { data, error } = await supabase
    .from('comments')
    .select('*, user_profiles(id, display_name, email)')
    .eq('post_id', postId) // Filtra por ID de post
    .order('created_at', { ascending: true }); // Orden cronológico

  if (error) {
    console.error('[comments.js] Error al obtener comentarios:', error);
    throw error;
  }

  return data;
}

