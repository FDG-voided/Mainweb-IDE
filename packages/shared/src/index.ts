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
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  path: string;
  content: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface CreateFileInput {
  path: string;
  content?: string;
  language?: string;
}

export interface UpdateFileInput {
  path: string;
  content?: string;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

export interface CollaborationEvent {
  type: 'file:change' | 'cursor:move' | 'user:join' | 'user:leave';
  userId: string;
  projectId: string;
  data: unknown;
  timestamp: number;
}