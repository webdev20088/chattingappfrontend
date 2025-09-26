import { useState } from 'react';
import styles from '../styles/signup.module.css'; // same styling as login

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setError('');
    if (!username || !password) {
      setError('Fill both fields');
      return;
    }
    const res = await fetch('https://mychatappbackend-zzhh.onrender.com/signup', {

      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      alert('Signup successful! Please log in.');
      window.location.href = '/login';
    } else {
      const data = await res.json();
      setError(data.message || 'Signup failed');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ChatMessenger</h1>
      <div className={styles.box}>
        <h3 className={styles.subtitle}>Create Account</h3>
        {error && <div className={styles.error}>{error}</div>}
        <input
          className={styles.input}
          placeholder="Choose Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          className={styles.input}
          type="password"
          placeholder="Choose Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className={styles.button} onClick={handleSignup}>Save</button>
      </div>
    </div>
  );
}
