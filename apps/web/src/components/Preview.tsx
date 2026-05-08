import styles from './Preview.module.css';

interface PreviewProps {
  url: string | null;
}

export default function Preview({ url }: PreviewProps) {
  return (
    <div className={styles.preview}>
      <div className={styles.header}>
        <span className={styles.title}>Preview</span>
      </div>
      <div className={styles.frame}>
        {url ? (
          <iframe src={url} title="Preview" sandbox="allow-scripts allow-same-origin" />
        ) : (
          <div className={styles.empty}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            <p>Create an HTML file to see a preview</p>
          </div>
        )}
      </div>
    </div>
  );
}