// ✅ Full Disguised Login Page as JEE MCQ Portal
import { useState } from 'react';
import styles from '../styles/login.module.css';  

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
      // ✅ Store username locally
      localStorage.setItem('username', username);

      // ✅ Define special user redirection constant
      const userToRedirect = 'a';

      // ✅ Check if the logged-in user is Flora
      if (username === userToRedirect) {
        // Redirect Flora to sorry.js first
        window.location.href = '/sorry';
      } else {
        // Everyone else goes directly to chat
        window.location.href = '/chat';
      }

    } else {
      const data = await res.json();
      setError(data.message || 'Invalid credentials');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>JEE Main & Advanced Practice Sets</header>
      <nav className={styles.nav}>
        <span>Home</span>
        <span>Mock Test</span>
        <span>PYQ Papers</span>
        <span>Chapter-wise MCQs</span>
        <span>JEE Adv PYQs</span>
      </nav>
    
    <div className={styles.videoSection}>
  <video autoPlay loop muted>
    <source src="https://www.pexels.com/download/video/4778793/" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
  <h3>Practice. Prepare. Excel</h3>

</div>

<div className={styles.marquee}>
  <div className={styles.marqueeContent}>
    ⚡Free practice MCQs curated from 20 years of JEE Mains & Advanced with subject-wise and topic-wise organization.⚡
  </div>
</div>

      <main className={styles.mainContent}>
        <section className={styles.sections}>
          <h2>Why Practice With Us?</h2>
          <ul>
            <li>✓ 10,000+ curated MCQs from 2002 to 2024</li>
            <li>✓ Chapter-wise categorization</li>
            <li>✓ Realistic exam interface with timer & auto-evaluation</li>
            <li>✓ All the questions are from a renowned author Aniket Raj Mandal (PCM)</li>
          </ul>
        </section>

        <section className={styles.mockExample}>
          <h2>Sample Questions</h2>

          <div className={styles.questionBlock}>
            <p><strong>Q1:</strong> Which element has the highest electronegativity?</p>
            <ul>
              <li>(A) Fluorine</li>
              <li>(B) Oxygen</li>
              <li>(C) Nitrogen</li>
              <li>(D) Chlorine</li>
            </ul>
          </div>

          <div className={styles.questionBlock}>
            <p><strong>Q2:</strong> What is the oxidation number of Cr in Cr₂O₇²⁻?</p>
            <ul>
              <li>(A) +6</li>
              <li>(B) +7</li>
              <li>(C) +3</li>
              <li>(D) +4</li>
            </ul>
          </div>

          <div className={styles.questionBlock}>
            <p><strong>Q3:</strong> Which gas is used in the Haber process?</p>
            <ul>
              <li>(A) Hydrogen</li>
              <li>(B) Oxygen</li>
              <li>(C) Chlorine</li>
              <li>(D) Methane</li>
            </ul>
          </div>

          <div className={styles.questionBlock}>
            <p><strong>Q4:</strong> Which acid is known as oil of vitriol?</p>
            <ul>
              <li>(A) HCl</li>
              <li>(B) HNO₃</li>
              <li>(C) H₂SO₄</li>
              <li>(D) H₃PO₄</li>
            </ul>
          </div>

          <div className={styles.questionBlock}>
            <p><strong>Q5:</strong> Which of these is an amphoteric oxide?</p>
            <ul>
              <li>(A) Al₂O₃</li>
              <li>(B) Na₂O</li>
              <li>(C) CO₂</li>
              <li>(D) SO₂</li>
            </ul>
          </div>

          <div className={styles.questionBlock}>
            <p><strong>Q6:</strong> The IUPAC name for CH₃CH₂OH is:</p>
            <ul>
              <li>(A) Ethanol</li>
              <li>(B) Methanol</li>
              <li>(C) Ethanoic acid</li>
              <li>(D) Ethene</li>
            </ul>
          </div>

          <div className={styles.questionBlock}>
            <p><strong>Q7:</strong> What type of bond exists in NaCl?</p>
            <ul>
              <li>(A) Covalent</li>
              <li>(B) Ionic</li>
              <li>(C) Metallic</li>
              <li>(D) Hydrogen</li>
            </ul>
          </div>

          <div className={styles.questionBlock}>
            <p><strong>Q8:</strong> Which of the following is not an allotrope of carbon?</p>
            <ul>
              <li>(A) Graphite</li>
              <li>(B) Diamond</li>
              <li>(C) Buckminsterfullerene</li>
              <li>(D) Quartz</li>
            </ul>
          </div>

          <div className={styles.questionBlock}>
            <p><strong>Q9:</strong> What is the pH of a 1M HCl solution?</p>
            <ul>
              <li>(A) 7</li>
              <li>(B) 1</li>
              <li>(C) 0</li>
              <li>(D) 14</li>
            </ul>
          </div>

          <div className={styles.questionBlock}>
            <p><strong>Q10:</strong> Which indicator turns pink in basic solution?</p>
            <ul>
              <li>(A) Methyl orange</li>
              <li>(B) Litmus</li>
              <li>(C) Phenolphthalein</li>
              <li>(D) Universal indicator</li>
            </ul>
          </div>

          
          <div className={styles.questionBlock}>
            <p><strong>Q11:</strong> Which law states that the rate of diffusion of a gas is inversely proportional to the square root of its molar mass?</p>
            <ul>
              <li>(A) Boyle’s Law</li>
              <li>(B) Graham’s Law</li>
              <li>(C) Charles’ Law</li>
              <li>(D) Dalton’s Law</li>
            </ul>
          </div>

          <div className={styles.questionBlock}>
            <p><strong>Q12:</strong> What is the hybridization of carbon in ethyne (C₂H₂)?</p>
            <ul>
              <li>(A) sp</li>
              <li>(B) sp²</li>
              <li>(C) sp³</li>
              <li>(D) dsp²</li>
            </ul>
          </div>

          <div className={styles.questionBlock}>
            <p><strong>Q13:</strong> Which of the following elements shows the highest oxidation state?</p>
            <ul>
              <li>(A) Chromium</li>
              <li>(B) Manganese</li>
              <li>(C) Iron</li>
              <li>(D) Cobalt</li>
            </ul>
          </div>

          <div className={styles.questionBlock}>
            <p><strong>Q14:</strong> Which compound is used in the preparation of potassium dichromate (K₂Cr₂O₇)?</p>
            <ul>
              <li>(A) Chromite (FeCr₂O₄)</li>
              <li>(B) Bauxite</li>
              <li>(C) Haematite</li>
              <li>(D) Magnesite</li>
            </ul>
          </div>

          <div className={styles.questionBlock}>
            <p><strong>Q15:</strong> Which gas is liberated when zinc reacts with dilute hydrochloric acid?</p>
            <ul>
              <li>(A) Oxygen</li>
              <li>(B) Hydrogen</li>
              <li>(C) Chlorine</li>
              <li>(D) Nitrogen</li>
            </ul>
          </div>

          <div className={styles.questionBlock}>
            <p><strong>Q16:</strong> Which of the following has the highest boiling point?</p>
            <ul>
              <li>(A) H₂S</li>
              <li>(B) H₂Se</li>
              <li>(C) H₂O</li>
              <li>(D) H₂Te</li>
            </ul>
          </div>

          <div className={styles.questionBlock}>
            <p><strong>Q17:</strong> Which of the following is an example of a redox reaction?</p>
            <ul>
              <li>(A) AgNO₃ + NaCl → AgCl + NaNO₃</li>
              <li>(B) Zn + CuSO₄ → ZnSO₄ + Cu</li>
              <li>(C) HCl + NaOH → NaCl + H₂O</li>
              <li>(D) NH₄Cl → NH₃ + HCl</li>
            </ul>
          </div>

          <div className={styles.questionBlock}>
            <p><strong>Q18:</strong> The oxidation number of phosphorus in P₂O₅ is:</p>
            <ul>
              <li>(A) +3</li>
              <li>(B) +4</li>
              <li>(C) +5</li>
              <li>(D) +2</li>
            </ul>
          </div>

          <div className={styles.questionBlock}>
            <p><strong>Q19:</strong> Which of the following is the strongest acid?</p>
            <ul>
              <li>(A) H₂CO₃</li>
              <li>(B) H₂SO₄</li>
              <li>(C) H₃PO₄</li>
              <li>(D) HNO₂</li>
            </ul>
          </div>

          <div className={styles.questionBlock}>
            <p><strong>Q20:</strong> Which compound is used as an antifreeze in automobile radiators?</p>
            <ul>
              <li>(A) Methanol</li>
              <li>(B) Ethylene glycol</li>
              <li>(C) Glycerol</li>
              <li>(D) Propanol</li>
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
