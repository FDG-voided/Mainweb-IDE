import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    window.location.href = '/api/auth/signin/github';
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h1 className={styles.title}>Mainweb IDE</h1>
        <p className={styles.subtitle}>The modern web development environment</p>

        <button
          className={`btn btn-primary ${styles.loginBtn}`}
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? 'Redirecting...' : 'Sign in with GitHub'}
        </button>

        <p className={styles.hint}>
          Sign in to save projects, collaborate, and access from anywhere.
        </p>
      </div>
    </div>
  );
}