import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../lib/api';
import { useUserStore } from '../store';
import { useState } from 'react';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useUserStore(s => s.user);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectApi.list,
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) => projectApi.create(data),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowCreateModal(false);
      setNewProjectName('');
      setNewProjectDesc('');
      navigate(`/project/${project.id}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: projectApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      createMutation.mutate({ name: newProjectName, description: newProjectDesc });
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <span>Mainweb IDE</span>
        </div>
        <div className={styles.user}>
          {user?.image && <img src={user.image} alt="" className={styles.avatar} />}
          <span>{user?.name}</span>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.titleRow}>
          <h1 className={styles.pageTitle}>My Projects</h1>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Project
          </button>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Loading projects...</div>
        ) : projects?.length === 0 ? (
          <div className={styles.empty}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
            </svg>
            <h3>No projects yet</h3>
            <p>Create your first project to get started</p>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              Create Project
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {projects?.map(project => (
              <div key={project.id} className={styles.projectCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.projectName}>{project.name}</h3>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.iconBtn}
                      onClick={() => deleteMutation.mutate(project.id)}
                      title="Delete"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <p className={styles.projectDesc}>
                  {project.description || 'No description'}
                </p>
                <div className={styles.cardFooter}>
                  <span className={styles.fileCount}>
                    {project._count?.files || 0} files
                  </span>
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>Create New Project</h2>
            <form onSubmit={handleCreate}>
              <div className={styles.formGroup}>
                <label>Project Name</label>
                <input
                  type="text"
                  className="input"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  placeholder="My Awesome Project"
                  autoFocus
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description (optional)</label>
                <textarea
                  className="input"
                  value={newProjectDesc}
                  onChange={e => setNewProjectDesc(e.target.value)}
                  placeholder="A brief description..."
                  rows={3}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!newProjectName.trim() || createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}