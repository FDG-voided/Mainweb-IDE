import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../lib/api';
import { useEditorStore } from '../store';
import styles from './Toolbar.module.css';

interface ToolbarProps {
  project: { id: string; name: string; shareToken?: string | null } | null;
  onSave: () => void;
  isSaving: boolean;
  presenceUsers: Map<string, { name: string; filePath?: string; position?: { lineNumber: number; column: number } }>;
}

export default function Toolbar({ project, onSave, isSaving, presenceUsers }: ToolbarProps) {
  const navigate = useNavigate();
  const { sidebarOpen, previewOpen, theme, toggleSidebar, togglePreview, setTheme } = useEditorStore();

  const shareMutation = useMutation({
    mutationFn: (id: string) => projectApi.share(id),
    onSuccess: (data) => {
      const shareUrl = `${window.location.origin}/share/${data.shareToken}`;
      navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    },
  });

  return (
    <div className={styles.toolbar}>
      <div className={styles.left}>
        <button className={styles.iconBtn} onClick={toggleSidebar} title="Toggle sidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M9 3v18"/>
          </svg>
        </button>
        <div className={styles.logo} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <span>Mainweb IDE</span>
        </div>
        <span className={styles.separator}>|</span>
        <span className={styles.projectName}>{project?.name || 'Loading...'}</span>
      </div>

      <div className={styles.center}>
        {project && (
          <button
            className={styles.actionBtn}
            onClick={() => shareMutation.mutate(project.id)}
            disabled={shareMutation.isPending}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
            </svg>
            {shareMutation.isPending ? 'Sharing...' : 'Share'}
          </button>
        )}
        <button className={`${styles.actionBtn} ${isSaving ? styles.saving : ''}`} onClick={onSave}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
            <path d="M17 21v-8H7v8M7 3v5h8"/>
          </svg>
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className={styles.right}>
        {presenceUsers.size > 0 && (
          <div className={styles.presence}>
            <span className={styles.presenceLabel}>Online:</span>
            {Array.from(presenceUsers.values()).slice(0, 5).map(u => (
              <span key={u.name} className={styles.presenceBadge} title={u.name}>
                {u.name.charAt(0).toUpperCase()}
              </span>
            ))}
            {presenceUsers.size > 5 && <span className={styles.presenceMore}>+{presenceUsers.size - 5}</span>}
          </div>
        )}
        <button className={styles.iconBtn} onClick={togglePreview} title="Toggle preview">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
        <button
          className={styles.iconBtn}
          onClick={() => setTheme(theme === 'vs-dark' ? 'vs-light' : 'vs-dark')}
          title={`Switch to ${theme === 'vs-dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'vs-dark' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}