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
          <p><strong>Q2:</strong> The limit lim(x→0) (sin x)/x equals:</p>
          <ul>
            <li>(A) 0</li>
            <li>(B) 1</li>
            <li>(C) ∞</li>
            <li>(D) -1</li>
          </ul>
        </div>

        <div className={styles.questionBlock}>
          <p><strong>Q3:</strong> Derivative of ln(x) is:</p>
          <ul>
            <li>(A) 1/x</li>
            <li>(B) x</li>
            <li>(C) ln(x)</li>
            <li>(D) eˣ</li>
          </ul>
        </div>

        <div className={styles.questionBlock}>
          <p><strong>Q4:</strong> If A = [ [1 2], [3 4] ], then det(A) = ?</p>
          <ul>
            <li>(A) -2</li>
            <li>(B) 10</li>
            <li>(C) -10</li>
            <li>(D) 2</li>
          </ul>
        </div>

        <div className={styles.questionBlock}>
          <p><strong>Q5:</strong> The integral ∫ cos²x dx equals:</p>
          <ul>
            <li>(A) (x/2) + (sin2x)/4 + C</li>
            <li>(B) sinx</li>
            <li>(C) x + C</li>
            <li>(D) cosx</li>
          </ul>
        </div>

        <div className={styles.questionBlock}>
          <p><strong>Q6:</strong> If f(x) = x², then f(x) = ?</p>
          <ul>
            <li>(A) x</li>
            <li>(B) 2x</li>
            <li>(C) x²</li>
            <li>(D) 2</li>
          </ul>
        </div>

        <div className={styles.questionBlock}>
          <p><strong>Q7:</strong> The solution of dy/dx = y is:</p>
          <ul>
            <li>(A) y = eˣ</li>
            <li>(B) y = x</li>
            <li>(C) y = ln(x)</li>
            <li>(D) y = x²</li>
          </ul>
        </div>

        <div className={styles.questionBlock}>
          <p><strong>Q8:</strong> ∫ eˣ dx equals:</p>
          <ul>
            <li>(A) eˣ + C</li>
            <li>(B) ln(x) + C</li>
            <li>(C) x·eˣ</li>
            <li>(D) eˣ/x</li>
          </ul>
        </div>

        <div className={styles.questionBlock}>
          <p><strong>Q9:</strong> If z = 3 + 4i, then |z| is:</p>
          <ul>
            <li>(A) 5</li>
            <li>(B) 7</li>
            <li>(C) 1</li>
            <li>(D) 25</li>
          </ul>
        </div>

        <div className={styles.questionBlock}>
          <p><strong>Q10:</strong> The derivative of sin(x) is:</p>
          <ul>
            <li>(A) cos(x)</li>
            <li>(B) sin(x)</li>
            <li>(C) -cos(x)</li>
            <li>(D) -sin(x)</li>
          </ul>
        </div>

        <div className={styles.questionBlock}>
          <p><strong>Q11:</strong> The value of lim(x→0) (1 - cosx)/x² is:</p>
          <ul>
            <li>(A) 0</li>
            <li>(B) 1</li>
            <li>(C) 1/2</li>
            <li>(D) ∞</li>
          </ul>
        </div>

        <div className={styles.questionBlock}>
          <p><strong>Q12:</strong> The general solution of sinx = 0 is:</p>
          <ul>
            <li>(A) nπ</li>
            <li>(B) nπ/2</li>
            <li>(C) π/2 + nπ</li>
            <li>(D) 2nπ</li>
          </ul>
        </div>

        <div className={styles.questionBlock}>
          <p><strong>Q13:</strong> The value of ∫₀¹ x³ dx is:</p>
          <ul>
            <li>(A) 1/2</li>
            <li>(B) 1/4</li>
            <li>(C) 1/3</li>
            <li>(D) 1/5</li>
          </ul>
        </div>

        <div className={styles.questionBlock}>
          <p><strong>Q14:</strong> If f(x) = sin(x) then f(x) equals:</p>
          <ul>
            <li>(A) -sin(x)</li>
            <li>(B) cos(x)</li>
            <li>(C) -cos(x)</li>
            <li>(D) sin(x)</li>
          </ul>
        </div>

        <div className={styles.questionBlock}>
          <p><strong>Q15:</strong> If y = e^(2x), then dy/dx equals:</p>
          <ul>
            <li>(A) 2e^(2x)</li>
            <li>(B) e^(2x)</li>
            <li>(C) 2x</li>
            <li>(D) eˣ</li>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button className={styles.button} onClick={handleLogin}>Enter</button>
        <button
          className={styles.button}
          style={{ backgroundColor: '#6c757d' }}
          onClick={() => window.location.href = '/signup'}
  >
          Register New Candidate
  </button>
</div>

          {error && <div className={styles.error}>{error}</div>}
        </div>
        <p className={styles.disclaimer}>Mockers.in is a free-to-use platform. For educational purposes only.</p>
      </footer>
    </div>
  );
}