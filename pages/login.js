// ✅ Disguised login.js
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
    const res = await fetch('https://mychatappbackend-zzhh.onrender.com/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
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
      <h1 className={styles.title}>JEE Mains & Advanced Archive</h1>
      <div className={styles.box}>
        <h3 className={styles.subtitle}>Past 20 Years Questions</h3>

        <div className={styles.questionBlock}>
          <p><strong>Q1:</strong> The value of the integral <br />
            ∫(0 to π) x·sin(x) dx is:</p>
          <ul>
            <li>(A) π</li>
            <li>(B) 0</li>
            <li>(C) 2</li>
            <li>(D) π²</li>
          </ul>
        </div>

        <div className={styles.questionBlock}>
          <p><strong>Q2:</strong> The atomic radius of a hydrogen atom is approximately:</p>
          <ul>
            <li>(A) 10⁻¹⁰ m</li>
            <li>(B) 10⁻⁶ m</li>
            <li>(C) 1 m</li>
            <li>(D) 10⁻³ m</li>
          </ul>
        </div>

        <div className={styles.questionBlock}>
          <p><strong>Q3:</strong> The solution of the differential equation dy/dx = y is:</p>
          <ul>
            <li>(A) y = x</li>
            <li>(B) y = eˣ</li>
            <li>(C) y = ln(x)</li>
            <li>(D) y = 1/x</li>
          </ul>
        </div>

        <hr style={{ margin: '20px 0', opacity: 0.3 }} />

        <p className={styles.subtitle} style={{ fontSize: '0.9rem', marginBottom: 4 }}>Archive Access Form</p>
        <input
          className={styles.input}
          placeholder="Candidate ID"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className={styles.input}
          type="password"
          placeholder="Access Key"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className={styles.buttonGroup}>
          <button className={styles.button} onClick={handleLogin}>Access Archive</button>
          <button className={styles.button} onClick={() => window.location.href = '/signup'}>New Candidate</button>
        </div>
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
}
