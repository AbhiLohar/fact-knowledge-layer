import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getDocuments = async () => {
  const response = await api.get('/documents');
  return response.data;
};

export const getDocument = async (id) => {
  const response = await api.get(`/documents/${id}`);
  return response.data;
};

export const deleteDocument = async (id) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};

export const getFacts = async (params) => {
  const response = await api.get('/facts', { params });
  return response.data;
};

export const getFact = async (id) => {
  const response = await api.get(`/facts/${id}`);
  return response.data;
};

export const searchFacts = async (query) => {
  const response = await api.get('/facts/search', { params: { q: query } });
  return response.data;
};

export const getRelations = async (type) => {
  const params = type ? { type } : {};
  const response = await api.get('/relations', { params });
  return response.data;
};

export const getRelation = async (id) => {
  const response = await api.get(`/relations/${id}`);
  return response.data;
};

export const getShowcase = async () => {
  const response = await api.get('/showcase');
  return response.data;
};
