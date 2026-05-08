import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  shareToken: string | null;
  createdAt: string;
  updatedAt: string;
  files?: ProjectFile[];
  _count?: { files: number };
}

export interface ProjectFile {
  id: string;
  projectId: string;
  path: string;
  content: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export const authApi = {
  getSession: () => api.get<{ user: User } | null>('/auth/session').then(r => r.data),
  getMe: () => api.get<User>('/me').then(r => r.data),
};

export const projectApi = {
  list: () => api.get<Project[]>('/projects').then(r => r.data),
  get: (id: string) => api.get<Project>(`/projects/${id}`).then(r => r.data),
  create: (data: { name: string; description?: string }) =>
    api.post<Project>('/projects', data).then(r => r.data),
  update: (id: string, data: Partial<Project>) =>
    api.put<Project>(`/projects/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  share: (id: string) => api.post<{ shareUrl: string; shareToken: string }>(`/projects/${id}/share`).then(r => r.data),
};

export const fileApi = {
  list: (projectId: string) =>
    api.get<ProjectFile[]>(`/projects/${projectId}/files`).then(r => r.data),
  get: (projectId: string, path: string) =>
    api.get<ProjectFile>(`/projects/${projectId}/files/${encodeURIComponent(path)}`).then(r => r.data),
  create: (projectId: string, data: { path: string; content?: string; language?: string }) =>
    api.post<ProjectFile>(`/projects/${projectId}/files`, data).then(r => r.data),
  update: (projectId: string, path: string, data: { content?: string; language?: string }) =>
    api.put<ProjectFile>(`/projects/${projectId}/files/${encodeURIComponent(path)}`, data).then(r => r.data),
  delete: (projectId: string, path: string) =>
    api.delete(`/projects/${projectId}/files/${encodeURIComponent(path)}`),
};

export const shareApi = {
  getProject: (token: string) =>
    api.get<Project>(`/share/${token}`).then(r => r.data),
};

export default api;