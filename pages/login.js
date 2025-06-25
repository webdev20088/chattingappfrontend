// ✅ Full Disguised Login Page as JEE MCQ Portal
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
      <header className={styles.header}>JEE Main & Advanced MCQ Portal</header>
      <nav className={styles.nav}>
        <span>Home</span>
        <span>Mock Test</span>
        <span>PYQ Papers</span>
        <span>Chapter-wise MCQs</span>
        <span>JEE Adv PYQs</span>
      </nav>

      <main className={styles.mainContent}>
        <section className={styles.heroText}>
          <h1>JEE Main MCQ Practice Sets</h1>
          <p>Free practice MCQs curated from 20 years of JEE Mains & Advanced with subject-wise and topic-wise organization.</p>
        </section>

        <section className={styles.sections}>
          <h2>Why Practice With Us?</h2>
          <ul>
            <li>✓ 10,000+ curated MCQs from 2002 to 2024</li>
            <li>✓ Chapter-wise categorization</li>
            <li>✓ Realistic exam interface with timer & auto-evaluation</li>
          </ul>
        </section>

        <section className={styles.mockExample}>
          <h2>Sample Questions</h2>
          <div className={styles.questionBlock}>
            <p><strong>Q1:</strong> Evaluate: ∫(0 to π) x·sin(x) dx</p>
            <ul>
              <li>(A) π</li>
              <li>(B) 0</li>
              <li>(C) π²</li>
              <li>(D) 2</li>
            </ul>
          </div>

          <div className={styles.questionBlock}>
            <p><strong>Q2:</strong> What is the atomic radius of hydrogen approximately?</p>
            <ul>
              <li>(A) 10⁻¹⁰ m</li>
              <li>(B) 10⁻⁶ m</li>
              <li>(C) 1 m</li>
              <li>(D) 10⁻³ m</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.loginBox}>
          <p className={styles.loginTitle}>Access Archive 🔒</p>
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
          <button className={styles.button} onClick={handleLogin}>Enter</button>
          {error && <div className={styles.error}>{error}</div>}
        </div>
        <p className={styles.disclaimer}>Mockers.in is a free-to-use platform. For educational purposes only.</p>
      </footer>
    </div>
  );
}