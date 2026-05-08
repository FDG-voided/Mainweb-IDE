import { useEffect, useCallback, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Editor from '@monaco-editor/react';
import { projectApi, fileApi } from '../lib/api';
import { useEditorStore } from '../store';
import { connectSocket, disconnectSocket, FileUpdate, CursorUpdate } from '../lib/socket';
import Sidebar from '../components/Sidebar';
import TabBar from '../components/TabBar';
import Preview from '../components/Preview';
import Toolbar from '../components/Toolbar';
import styles from './IDE.module.css';

export default function IDE() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [presenceUsers, setPresenceUsers] = useState<Map<string, { name: string; filePath?: string; position?: { lineNumber: number; column: number } }>>(new Map());

  const {
    currentProject, setCurrentProject,
    files, setFiles,
    openTabs, activeTabPath,
    sidebarOpen, previewOpen,
    theme,
    openFile, closeTab, setActiveTab,
    updateTabContent, markTabSaved,
    addFile, removeFile,
  } = useEditorStore();

  const activeTab = useMemo(() => openTabs.find(t => t.path === activeTabPath), [openTabs, activeTabPath]);

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.get(projectId!),
    enabled: !!projectId,
  });

  const { data: projectFiles } = useQuery({
    queryKey: ['files', projectId],
    queryFn: () => fileApi.list(projectId!),
    enabled: !!projectId,
  });

  const saveMutation = useMutation({
    mutationFn: ({ path, content, language }: { path: string; content: string; language: string }) =>
      fileApi.update(projectId!, path, { content, language }),
    onSuccess: (file) => {
      if (activeTabPath) {
        markTabSaved(activeTabPath, file.content);
      }
      queryClient.invalidateQueries({ queryKey: ['files', projectId] });
    },
  });

  const createFileMutation = useMutation({
    mutationFn: (data: { path: string; content?: string }) =>
      fileApi.create(projectId!, data),
    onSuccess: (file) => {
      queryClient.invalidateQueries({ queryKey: ['files', projectId] });
      openFile(file);
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: (path: string) => fileApi.delete(projectId!, path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', projectId] });
    },
  });

  useEffect(() => {
    if (project) {
      setCurrentProject(project);
    }
  }, [project, setCurrentProject]);

  useEffect(() => {
    if (projectFiles) {
      setFiles(projectFiles);
    }
  }, [projectFiles, setFiles]);

  useEffect(() => {
    const socket = connectSocket();
    socket.emit('join-project', projectId);

    socket.on('file:update', (data: FileUpdate) => {
      const tab = openTabs.find(t => t.path === data.filePath);
      if (tab && tab.content !== data.content) {
        updateTabContent(data.filePath, data.content);
      }
    });

    socket.on('user:join', (data: { userId: string; userName: string }) => {
      setPresenceUsers(prev => new Map(prev).set(data.userId, { name: data.userName }));
    });

    socket.on('user:leave', (data: { userId: string }) => {
      setPresenceUsers(prev => {
        const next = new Map(prev);
        next.delete(data.userId);
        return next;
      });
    });

    socket.on('cursor:update', (data: CursorUpdate) => {
      setPresenceUsers(prev => new Map(prev).set(data.userId, {
        name: data.userName,
        filePath: data.filePath,
        position: data.position,
      }));
    });

    return () => {
      socket.emit('leave-project', projectId);
      disconnectSocket();
    };
  }, [projectId]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (activeTabPath && value !== undefined) {
      updateTabContent(activeTabPath, value);

      const socket = connectSocket();
      socket.emit('file:change', { projectId, filePath: activeTabPath, content: value });
    }
  }, [activeTabPath, projectId, updateTabContent]);

  const handleSave = useCallback(async () => {
    if (!activeTab || !projectId) return;
    setIsSaving(true);
    try {
      await saveMutation.mutateAsync({
        path: activeTab.path,
        content: activeTab.content,
        language: activeTab.language,
      });
    } finally {
      setIsSaving(false);
    }
  }, [activeTab, projectId, saveMutation]);

  const handleCreateFile = useCallback((path: string) => {
    createFileMutation.mutate({ path });
  }, [createFileMutation]);

  const handleDeleteFile = useCallback((path: string) => {
    closeTab(path);
    removeFile(path);
    deleteFileMutation.mutate(path);
  }, [closeTab, removeFile, deleteFileMutation]);

  const handleFileSelect = useCallback((file: typeof files[0]) => {
    openFile(file);
  }, [openFile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const getPreviewUrl = useCallback(() => {
    const htmlFile = files.find(f => f.path.endsWith('.html'));
    if (!htmlFile) return null;

    let html = htmlFile.content;

    for (const file of files) {
      if (file.path !== htmlFile.path) {
        const tagMatch = html.match(new RegExp(`(src|href)=["'](${file.path})["']`));
        if (tagMatch) {
          const blob = new Blob([file.content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          html = html.replace(new RegExp(tagMatch[2], 'g'), url);
        }
      }
    }

    return 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
  }, [files]);

  if (!project) {
    return <div className={styles.loading}>Loading project...</div>;
  }

  return (
    <div className={styles.container}>
      <Toolbar
        project={currentProject}
        onSave={handleSave}
        isSaving={isSaving}
        presenceUsers={presenceUsers}
      />
      <div className={styles.workspace}>
        {sidebarOpen && (
          <Sidebar
            files={files}
            onFileSelect={handleFileSelect}
            onCreateFile={handleCreateFile}
            onDeleteFile={handleDeleteFile}
            activeTabPath={activeTabPath}
          />
        )}
        <div className={styles.editorArea}>
          <TabBar
            tabs={openTabs}
            activeTabPath={activeTabPath}
            onTabSelect={setActiveTab}
            onTabClose={closeTab}
          />
          <div className={styles.editorWrapper}>
            {activeTab ? (
              <Editor
                height="100%"
                language={activeTab.language}
                value={activeTab.content}
                theme={theme}
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineNumbers: 'on',
                  renderLineHighlight: 'all',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                }}
              />
            ) : (
              <div className={styles.noFile}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                </svg>
                <h3>No file open</h3>
                <p>Select a file from the sidebar to start editing</p>
              </div>
            )}
          </div>
        </div>
        {previewOpen && (
          <Preview url={getPreviewUrl()} />
        )}
      </div>
    </div>
  );
}