import { useState } from 'react';
import type { ProjectFile } from '../lib/api';
import { useEditorStore } from '../store';
import styles from './Sidebar.module.css';

interface SidebarProps {
  files: ProjectFile[];
  onFileSelect: (file: ProjectFile) => void;
  onCreateFile: (path: string) => void;
  onDeleteFile: (path: string) => void;
  activeTabPath: string | null;
}

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
}

function buildTree(files: ProjectFile[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];
  const folders: Record<string, FileTreeNode> = {};

  for (const file of files.sort((a, b) => a.path.localeCompare(b.path))) {
    const parts = file.path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const currentPath = parts.slice(0, i + 1).join('/');
      const isFolder = i < parts.length - 1;

      if (isFolder) {
        if (!folders[currentPath]) {
          const node: FileTreeNode = { name: part, path: currentPath, type: 'folder', children: [] };
          folders[currentPath] = node;
          current.push(node);
        }
        current = folders[currentPath].children!;
      } else {
        current.push({ name: part, path: file.path, type: 'file' });
      }
    }
  }

  return root;
}

function getLanguageIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const icons: Record<string, string> = {
    html: '🌐', htm: '🌐', css: '🎨', scss: '🎨', js: '📜', jsx: '⚛️',
    ts: '📘', tsx: '⚛️', json: '📋', md: '📝', py: '🐍', svg: '🖼️',
  };
  return icons[ext || ''] || '📄';
}

function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
    html: 'html', css: 'css', scss: 'scss', json: 'json', md: 'markdown',
    py: 'python', svg: 'xml',
  };
  return map[ext || ''] || 'plaintext';
}

export default function Sidebar({ files, onFileSelect, onCreateFile, onDeleteFile, activeTabPath }: SidebarProps) {
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFilePath, setNewFilePath] = useState('');
  const tree = buildTree(files);
  const { toggleSidebar } = useEditorStore();

  const toggleFolder = (path: string) => {
    setCollapsedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const handleNewFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFilePath.trim()) {
      const ext = newFilePath.split('.').pop()?.toLowerCase() || '';
      onCreateFile(newFilePath);
      setNewFilePath('');
      setShowNewFile(false);
    }
  };

  const renderNode = (node: FileTreeNode, depth = 0): React.ReactNode => {
    const isActive = activeTabPath === node.path;
    const isCollapsed = collapsedFolders.has(node.path);

    if (node.type === 'folder') {
      return (
        <div key={node.path}>
          <button
            className={styles.folderBtn}
            style={{ paddingLeft: `${12 + depth * 16}px` }}
            onClick={() => toggleFolder(node.path)}
          >
            <span className={styles.arrow}>{isCollapsed ? '▶' : '▼'}</span>
            <span className={styles.folderIcon}>📁</span>
            <span className={styles.name}>{node.name}</span>
          </button>
          {!isCollapsed && node.children?.map(child => renderNode(child, depth + 1))}
        </div>
      );
    }

    return (
      <button
        key={node.path}
        className={`${styles.fileBtn} ${isActive ? styles.active : ''}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => {
          const file = files.find(f => f.path === node.path);
          if (file) onFileSelect(file);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          if (confirm(`Delete ${node.name}?`)) onDeleteFile(node.path);
        }}
      >
        <span className={styles.icon}>{getLanguageIcon(node.name)}</span>
        <span className={styles.name}>{node.name}</span>
      </button>
    );
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.title}>Files</span>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => setShowNewFile(true)} title="New file">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
          <button className={styles.actionBtn} onClick={toggleSidebar} title="Close sidebar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.fileTree}>
        {tree.length === 0 ? (
          <div className={styles.empty}>
            <p>No files yet</p>
            <button className={styles.addBtn} onClick={() => setShowNewFile(true)}>
              + Add a file
            </button>
          </div>
        ) : (
          tree.map(node => renderNode(node))
        )}
      </div>

      {showNewFile && (
        <form className={styles.newFileForm} onSubmit={handleNewFile}>
          <input
            type="text"
            className={styles.newFileInput}
            value={newFilePath}
            onChange={e => setNewFilePath(e.target.value)}
            placeholder="path/to/file.js"
            autoFocus
            onBlur={() => {
              if (!newFilePath.trim()) setShowNewFile(false);
            }}
          />
        </form>
      )}
    </div>
  );
}