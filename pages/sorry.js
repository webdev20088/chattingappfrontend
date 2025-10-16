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
    'https://images.unsplash.com/photo-1612831667634-6c6a3e5fa4a1?w=400',
    'https://images.unsplash.com/photo-1612831455544-1cdeec15b9c5?w=400',
    'https://images.unsplash.com/photo-1612831555541-8d6a9a3a3bfa?w=400',
    'https://images.unsplash.com/photo-1612831623455-9fa02b2efb72?w=400'
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
    if (answer === 'yes') newImages[qIndex] = `https://images.unsplash.com/photo-1612831667634-6c6a3e5fa4a1?w=400&text=Yes+Q${qIndex+1}`;
    if (answer === 'no') newImages[qIndex] = `https://images.unsplash.com/photo-1612831455544-1cdeec15b9c5?w=400&text=No+Q${qIndex+1}`;
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
              <input type="checkbox" disabled={!checkbox1Enabled} checked={checkbox1} onChange={e => setCheckbox1(e.target.checked)} />
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
          <p className={styles.tileText}>This is an important editor&apos;s note.</p>
          <div className={styles.buttonGroup}>
            <button className={styles.button} onClick={handleFinalProceed}>Proceed to Chat</button>
          </div>
        </div>
      )}
    </div>
  );
}
