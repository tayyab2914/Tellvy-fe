import React from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  get: (url, config = {}) => axios.get(`${API}${url}`, { ...config, headers: { ...getAuthHeaders(), ...config.headers }, withCredentials: true }),
  post: (url, data, config = {}) => axios.post(`${API}${url}`, data, { ...config, headers: { ...getAuthHeaders(), ...config.headers }, withCredentials: true }),
  put: (url, data, config = {}) => axios.put(`${API}${url}`, data, { ...config, headers: { ...getAuthHeaders(), ...config.headers }, withCredentials: true }),
  delete: (url, config = {}) => axios.delete(`${API}${url}`, { ...config, headers: { ...getAuthHeaders(), ...config.headers }, withCredentials: true }),
  upload: (url, formData, config = {}) => axios.post(`${API}${url}`, formData, { ...config, headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data', ...config.headers }, withCredentials: true }),
};

export const fileUrl = (path) => `${API}/files/${path}`;
