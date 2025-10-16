// pages/sorry.js
import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '../styles/sorry.module.css';

const usernameToRedirect = 'a'; // Constant username to redirect to chat

export default function Sorry() {
  const [stage, setStage] = useState(0); // 0: disclaimer, 1: GIFs, 2: questions, 3: video, 4: GIFs again, 5: final note

  // Disclaimer checkbox states
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);
  const [checkbox3, setCheckbox3] = useState(false);
  const [checkbox1Enabled, setCheckbox1Enabled] = useState(false);

  // Question states
  const questionImages = [
    'data:image/png;base64,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',
    'data:image/png;base64,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',
    'data:image/png;base64,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',

    'data:image/png;base64,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',

  ];

  const [currentQuestionImages, setCurrentQuestionImages] = useState([...questionImages]);
  const [questionAnswers, setQuestionAnswers] = useState([null, null, null, null]);
  const [nextEnabled, setNextEnabled] = useState(false);
  const [nextCooldown, setNextCooldown] = useState(30);

  // Video cooldown
  const [videoNextEnabled, setVideoNextEnabled] = useState(false);
  const [videoCooldown, setVideoCooldown] = useState(20);

  // Enable checkbox1 after 30s
  useEffect(() => {
    const timer = setTimeout(() => setCheckbox1Enabled(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  // Question next button cooldown
  useEffect(() => {
    if (stage === 2) {
      setNextEnabled(false);
      setNextCooldown(30);
      const interval = setInterval(() => {
        setNextCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setNextEnabled(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [stage]);

  // Video next button cooldown
  useEffect(() => {
    if (stage === 3) {
      setVideoNextEnabled(false);
      setVideoCooldown(20);
      const interval = setInterval(() => {
        setVideoCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setVideoNextEnabled(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [stage]);

  // GIF URLs
  const gifs = [
    "https://media.giphy.com/media/3o6ZsYmT8QpI5x6qFG/giphy.gif",
    "https://media.giphy.com/media/l3vR85PnGsBwu1PFK/giphy.gif",
    "https://media.giphy.com/media/26gssIytJvy1b1THO/giphy.gif",
    "https://media.giphy.com/media/3ohs4y1Cgk3wPFTxCo/giphy.gif",
    "https://media.giphy.com/media/3ohhwytHcusSCXXOUg/giphy.gif",
    "https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif",
    "https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif",
    "https://media.giphy.com/media/3oKIPwoeGErMmaI43C/giphy.gif"
  ];

  // Handlers
  const handleDisclaimerProceed = () => setStage(1);
  const handleCancel = () => window.location.href = `/chat?username=${usernameToRedirect}`;
  const handleNextGIFs = () => setStage(2);

  const handleQuestionAnswer = (qIndex, answer) => {
  const newAnswers = [...questionAnswers];
  newAnswers[qIndex] = answer;
  setQuestionAnswers(newAnswers);

  const newImages = [...currentQuestionImages];
  if (answer === 'yes')
    newImages[qIndex] = `https://placehold.co/400x300/00ff99/000000?text=Yes+Q${qIndex + 1}`;
  if (answer === 'no')
    newImages[qIndex] = `https://placehold.co/400x300/ff6666/000000?text=No+Q${qIndex + 1}`;
  setCurrentQuestionImages(newImages);
};

  const handleShowQuestion = (qIndex) => {
    const newImages = [...currentQuestionImages];
    newImages[qIndex] = questionImages[qIndex];
    setCurrentQuestionImages(newImages);
  };

  const handleQuestionsNext = () => setStage(3);
  const handleVideoNext = () => setStage(4);
  const handleSecondGIFNext = () => setStage(5);
  const handleFinalProceed = () => window.location.href = `/chat?username=${usernameToRedirect}`;

  return (
    <div className={styles.container}>
      {/* Stage 0: Disclaimer */}
      {stage === 0 && (
        <div className={styles.tile}>
          <h2 className={styles.tileTitle}>Disclaimer</h2>
          <p className={styles.tileText}>Please read this carefully before proceeding.</p>
          <div className={styles.checkboxGroup}>
            <label>
              <input type="checkbox"  checked={checkbox1} onChange={e => setCheckbox1(e.target.checked)} />
              Head Phone
            </label>
            <label>
              <input type="checkbox" checked={checkbox2} onChange={e => setCheckbox2(e.target.checked)} />
              Yesss Yess
            </label>
            <label>
              <input type="checkbox" checked={checkbox3} onChange={e => setCheckbox3(e.target.checked)} />
              No No
            </label>
          </div>
          <div className={styles.buttonGroup}>
            <button className={styles.button} onClick={handleDisclaimerProceed} disabled={!(checkbox1 && checkbox2 && checkbox3)}>Proceed</button>
            <button className={styles.button} onClick={handleCancel}>Cancel & Go to Chat</button>
          </div>
        </div>
      )}

      {/* Stage 1: GIFs */}
      {stage === 1 && (
        <div className={styles.tile}>
          <h2 className={styles.tileTitle}>Enjoy these GIFs</h2>
          <div className={styles.gifContainer}>
            {gifs.map((gif, i) => (
              <Image key={i} src={gif} alt={`gif-${i}`} width={150} height={150} unoptimized />
            ))}
          </div>
          <div className={styles.buttonGroup}>
            <button className={styles.button} onClick={handleNextGIFs}>Next</button>
          </div>
        </div>
      )}

      {/* Stage 2: Questions */}
      {stage === 2 && (
        <div className={styles.tile}>
          <h2 className={styles.tileTitle}>Questions</h2>
          {currentQuestionImages.map((img, index) => (
            <div key={index} className={styles.questionTile}>
              <p className={styles.tileText}>Question {index + 1}</p>
              <Image src={img} alt={`question-${index}`} width={300} height={300} unoptimized />
              <div className={styles.checkboxGroup}>
                <label>
                  <input type="radio" name={`q${index}`} onChange={() => handleQuestionAnswer(index, 'yes')} /> Yes
                </label>
                <label>
                  <input type="radio" name={`q${index}`} onChange={() => handleQuestionAnswer(index, 'no')} /> No
                </label>
              </div>
              <button className={styles.button} onClick={() => handleShowQuestion(index)}>Show Question</button>
            </div>
          ))}
          <div className={styles.buttonGroup}>
            <button className={styles.button} onClick={handleQuestionsNext} disabled={!nextEnabled}>Next</button>
          </div>
          {!nextEnabled && <p style={{ fontSize: '0.8rem' }}>Enabled in {nextCooldown} seconds</p>}
        </div>
      )}

      {/* Stage 3: Video */}
      {stage === 3 && (
        <div className={styles.tile}>
          <h2 className={styles.tileTitle}>Watch this Video</h2>
          <div className={styles.videoContainer}>
            <video src="https://www.w3schools.com/html/mov_bbb.mp4" controls autoPlay />
          </div>
          <div className={styles.buttonGroup}>
            <button className={styles.button} onClick={handleVideoNext} disabled={!videoNextEnabled}>Next</button>
          </div>
          {!videoNextEnabled && <p style={{ fontSize: '0.8rem' }}>Enabled in {videoCooldown} seconds</p>}
        </div>
      )}

      {/* Stage 4: Second GIFs */}
      {stage === 4 && (
        <div className={styles.tile}>
          <h2 className={styles.tileTitle}>Enjoy More GIFs</h2>
          <div className={styles.gifContainer}>
            {gifs.map((gif, i) => (
              <Image key={i} src={gif} alt={`gif2-${i}`} width={150} height={150} unoptimized />
            ))}
          </div>
          <div className={styles.buttonGroup}>
            <button className={styles.button} onClick={handleSecondGIFNext}>Next</button>
          </div>
        </div>
      )}

      {/* Stage 5: Final Note */}
      {stage === 5 && (
        <div className={styles.tile}>
          <h2 className={styles.tileTitle}>Editor&apos;s Note</h2>
          <p className={styles.tileText}>ye admi kuch nhi deta srif kaam krwata h ek number ka gadha h samosa ? kuch nhi khilaya marta h aur kaam krwata h .</p>
          <div className={styles.buttonGroup}>
            <button className={styles.button} onClick={handleFinalProceed}>Proceed to Chat</button>
          </div>
        </div>
      )}
    </div>
  );
}
