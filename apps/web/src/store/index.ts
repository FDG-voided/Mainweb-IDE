import { create } from 'zustand';
import { Project, ProjectFile } from '../lib/api';

interface FileTab {
  path: string;
  language: string;
  content: string;
  savedContent: string;
  isDirty: boolean;
}

interface EditorState {
  currentProject: Project | null;
  files: ProjectFile[];
  openTabs: FileTab[];
  activeTabPath: string | null;
  sidebarOpen: boolean;
  previewOpen: boolean;
  theme: 'vs-dark' | 'vs-light';
  setCurrentProject: (project: Project | null) => void;
  setFiles: (files: ProjectFile[]) => void;
  openFile: (file: ProjectFile) => void;
  closeTab: (path: string) => void;
  setActiveTab: (path: string) => void;
  updateTabContent: (path: string, content: string) => void;
  markTabSaved: (path: string, savedContent: string) => void;
  toggleSidebar: () => void;
  togglePreview: () => void;
  setTheme: (theme: 'vs-dark' | 'vs-light') => void;
  addFile: (file: ProjectFile) => void;
  removeFile: (path: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  currentProject: null,
  files: [],
  openTabs: [],
  activeTabPath: null,
  sidebarOpen: true,
  previewOpen: true,
  theme: 'vs-dark',

  setCurrentProject: (project) => set({ currentProject: project }),
  setFiles: (files) => set({ files }),

  openFile: (file) => {
    const tabs = get().openTabs;
    const existing = tabs.find(t => t.path === file.path);
    if (existing) {
      set({ activeTabPath: file.path });
    } else {
      const newTab: FileTab = {
        path: file.path,
        language: file.language,
        content: file.content,
        savedContent: file.content,
        isDirty: false,
      };
      set({
        openTabs: [...tabs, newTab],
        activeTabPath: file.path,
      });
    }
  },

  closeTab: (path) => {
    const tabs = get().openTabs.filter(t => t.path !== path);
    let activeTab = get().activeTabPath;
    if (activeTab === path) {
      activeTab = tabs.length > 0 ? tabs[tabs.length - 1].path : null;
    }
    set({ openTabs: tabs, activeTabPath: activeTab });
  },

  setActiveTab: (path) => set({ activeTabPath: path }),

  updateTabContent: (path, content) => {
    set({
      openTabs: get().openTabs.map(t =>
        t.path === path ? { ...t, content, isDirty: content !== t.savedContent } : t
      ),
    });
  },

  markTabSaved: (path, savedContent) => {
    set({
      openTabs: get().openTabs.map(t =>
        t.path === path ? { ...t, savedContent, isDirty: false } : t
      ),
    });
  },

  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  togglePreview: () => set(s => ({ previewOpen: !s.previewOpen })),
  setTheme: (theme) => set({ theme }),

  addFile: (file) => set(s => ({ files: [...s.files, file] })),
  removeFile: (path) => set(s => ({ files: s.files.filter(f => f.path !== path) })),
}));

interface UserState {
  user: { id: string; name: string | null; email: string; image: string | null } | null;
  isLoading: boolean;
  setUser: (user: UserState['user']) => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));