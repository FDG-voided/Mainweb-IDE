import styles from './TabBar.module.css';

interface Tab {
  path: string;
  language: string;
  isDirty: boolean;
}

interface TabBarProps {
  tabs: Tab[];
  activeTabPath: string | null;
  onTabSelect: (path: string) => void;
  onTabClose: (path: string) => void;
}

function getLanguageIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const icons: Record<string, string> = {
    html: '🌐', htm: '🌐', css: '🎨', scss: '🎨', js: '📜', jsx: '⚛️',
    ts: '📘', tsx: '⚛️', json: '📋', md: '📝', py: '🐍', svg: '🖼️',
  };
  return icons[ext || ''] || '📄';
}

export default function TabBar({ tabs, activeTabPath, onTabSelect, onTabClose }: TabBarProps) {
  if (tabs.length === 0) return null;

  return (
    <div className={styles.tabBar}>
      <div className={styles.tabs}>
        {tabs.map(tab => {
          const filename = tab.path.split('/').pop() || tab.path;
          return (
            <div
              key={tab.path}
              className={`${styles.tab} ${tab.path === activeTabPath ? styles.active : ''}`}
              onClick={() => onTabSelect(tab.path)}
            >
              <span className={styles.icon}>{getLanguageIcon(filename)}</span>
              <span className={styles.name}>{filename}</span>
              {tab.isDirty && <span className={styles.dirty} />}
              <button
                className={styles.closeBtn}
                onClick={e => {
                  e.stopPropagation();
                  onTabClose(tab.path);
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}