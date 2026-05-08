import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { shareApi } from '../lib/api';
import styles from './SharePage.module.css';

export default function SharePage() {
  const { token } = useParams<{ token: string }>();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['share', token],
    queryFn: () => shareApi.getProject(token!),
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading shared project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Project Not Found</h2>
          <p>This project may not exist or has been made private.</p>
          <a href="/">Go to Mainweb IDE</a>
        </div>
      </div>
    );
  }

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
        <a href="/login" className="btn btn-primary">Sign in to Edit</a>
      </header>

      <main className={styles.main}>
        <div className={styles.projectInfo}>
          <h1>{project.name}</h1>
          <p>{project.description || 'No description'}</p>
          <div className={styles.meta}>
            <span>Owner: {project.owner?.name || 'Anonymous'}</span>
            <span>{project.files?.length || 0} files</span>
          </div>
        </div>

        <div className={styles.fileList}>
          <h3>Files</h3>
          {project.files?.length === 0 ? (
            <p className={styles.empty}>No files in this project</p>
          ) : (
            <ul>
              {project.files?.map(file => (
                <li key={file.id}>
                  <span className={styles.filePath}>{file.path}</span>
                  <span className={styles.fileLang}>{file.language}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.preview}>
          <h3>Code Preview</h3>
          <pre>
            {project.files?.map(f => `// ${f.path}\n${f.content}`).join('\n\n')}
          </pre>
        </div>
      </main>
    </div>
  );
}