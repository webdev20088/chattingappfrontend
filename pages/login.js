import { useState } from 'react';
import styles from '../styles/Login.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!username || !password) {
      setError('Fill both fields');
      return;
    }

    const res = await fetch('http://localhost:4000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      localStorage.setItem('username', username);
      window.location.href = '/chat';
    } else {
      const data = await res.json();
      setError(data.message || 'Invalid credentials');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ChatMessenger</h1>
      <div className={styles.box}>
        <h3 className={styles.subtitle}>Enter Credentials</h3>
        <input
          className={styles.input}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className={styles.buttonGroup}>
          <button className={styles.button} onClick={handleLogin}>Login</button>
          <button className={styles.button} onClick={() => window.location.href = '/signup'}>Sign Up</button>
        </div>
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
}
