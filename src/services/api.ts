export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://acervomestrebackend.onrender.com';

const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

const getHeaders = (contentType?: string): HeadersInit => {
  const headers: HeadersInit = {};
  
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export interface CreateRecursoData {
  titulo: string;
  descricao: string;
  estrutura: 'UPLOAD' | 'URL' | 'NOTA';
  visibilidade?: 'PUBLICO' | 'PRIVADO';
  is_destaque?: boolean;
  tag_ids?: string[];
  file?: File;
  url_externa?: string;
  conteudo_markdown?: string;
}

export interface UserCreateData {
  nome: string;
  email: string;
  perfil: string;
  senha?: string;
  data_nascimento?: string;
}

export interface UserUpdateData {
  nome?: string;
  email?: string;
  perfil?: string;
  status?: string;
  data_nascimento?: string;
}

export const createRecurso = async (data: CreateRecursoData) => {
  const formData = new FormData();
  
  formData.append('titulo', data.titulo);
  formData.append('descricao', data.descricao);
  formData.append('estrutura', data.estrutura);
  
  if (data.visibilidade) {
    formData.append('visibilidade', data.visibilidade);
  }
  
  if (data.is_destaque !== undefined) {
    formData.append('is_destaque', String(data.is_destaque));
  }
  
  if (data.tag_ids && data.tag_ids.length > 0) {
    data.tag_ids.forEach(tagId => {
      formData.append('tag_ids', tagId);
    });
  }
  
  if (data.estrutura === 'UPLOAD' && data.file) {
    formData.append('file', data.file);
  } else if (data.estrutura === 'URL' && data.url_externa) {
    formData.append('url_externa', data.url_externa);
  } else if (data.estrutura === 'NOTA' && data.conteudo_markdown) {
    formData.append('conteudo_markdown', data.conteudo_markdown);
  }
  
  const response = await fetch(`${API_BASE_URL}/recursos/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao criar recurso');
  }
  
  return response.json();
};

export const deleteRecurso = async (recursoId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/recursos/delete/${recursoId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao remover recurso');
  }
};

export const addRecursoToPlaylist = async (
  playlistId: string,
  recursoId: number
): Promise<any> => {
  const response = await fetch(
    `${API_BASE_URL}/playlists/add_recurso/${playlistId}`,
    {
      method: 'POST',
      headers: getHeaders('application/json'),
      body: JSON.stringify({ recurso_id: recursoId }),
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao adicionar recurso à playlist');
  }
  
  return response.json();
};

export const removeRecursoFromPlaylist = async (
  playlistId: string,
  recursoId: number
): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/playlists/delete_recurso/${playlistId}/${recursoId}`,
    {
      method: 'DELETE',
      headers: getHeaders(),
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao remover recurso da playlist');
  }
};

export const getAllPlaylists = async () => {
  const response = await fetch(
    `${API_BASE_URL}/playlists/get_all?page=1&per_page=100`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao buscar playlists');
  }
  
  return response.json();
};

export const getAllTags = async () => {
  const response = await fetch(`${API_BASE_URL}/tags/get_all`, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao buscar tags');
  }
  
  return response.json();
};

export const createUser = async (data: UserCreateData) => {
  const response = await fetch(`${API_BASE_URL}/users/create`, {
    method: 'POST',
    headers: getHeaders('application/json'),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao criar usuário');
  }

  return response.json();
};

export const getUser = async (userId: number) => {
  const response = await fetch(`${API_BASE_URL}/users/get/${userId}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao buscar dados do usuário');
  }

  return response.json();
};

export const updateUser = async (userId: number, data: UserUpdateData) => {
  const response = await fetch(`${API_BASE_URL}/users/patch/${userId}`, {
    method: 'PATCH',
    headers: getHeaders('application/json'),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao atualizar dados do usuário');
  }

  return response.json();
};

export const updateUserImage = async (userId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/users/${userId}/image`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao atualizar imagem de perfil');
  }

  return response.json();
};

export const restoreUser = async (userId: number) => {
  const response = await fetch(`${API_BASE_URL}/users/restore/${userId}`, {
    method: 'PATCH',
    headers: getHeaders('application/json'),
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao ativar usuário');
  }

  return response.json();
};

export const deleteUser = async (userId: number) => {
  const response = await fetch(`${API_BASE_URL}/users/delete/${userId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (response.status === 204) {
    return;
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao desativar usuário');
  }
};