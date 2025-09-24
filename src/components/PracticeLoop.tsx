import React, { useState, useEffect } from 'react';
import { PronCoachAgent } from '../agents/PronCoachAgent';
import Recorder from './Recorder';
import Feedback from './Feedback';
import './Components.css';

/**
 * Main practice interface component that orchestrates the pronunciation coaching session
 * Displays text for reading, handles recording, and shows feedback
 */
const PracticeLoop: React.FC = () => {
  const [agent] = useState(() => new PronCoachAgent());
  const [currentText, setCurrentText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    transcription: string;
    score: number;
    feedback: string[];
    letterGrade: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionStarted, setSessionStarted] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(30);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // Timer effect for 30-second reading countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (timer === 0) {
      setTimerActive(false);
      // Auto-stop recording when timer expires
      if (isRecording) {
        handleStopRecording();
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timer, isRecording]);

  /**
   * Start a new practice session with fresh text
   */
  const startNewSession = (): void => {
    const newText = agent.startPracticeSession();
    setCurrentText(newText);
    setFeedback(null);
    setSessionStarted(true);
    setTimer(30);
    setTimerActive(true);
  };

  /**
   * Handle recording completion and process feedback
   */
  const handleRecordingComplete = async (audioBlob: Blob): Promise<void> => {
    if (!currentText) return;
    
    setLoading(true);
    setTimerActive(false);
    
    try {
      const result = await agent.processRecording(audioBlob, currentText);
      setFeedback(result);
      
      // Record the session for statistics
      agent.recordPracticeSession(result.score);
    } catch (error) {
      console.error('Error processing recording:', error);
      alert('Sorry, there was an error processing your recording. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle stop recording from timer or manual stop
   */
  const handleStopRecording = (): void => {
    setIsRecording(false);
    setTimerActive(false);
  };

  /**
   * Reset to initial state
   */
  const resetSession = (): void => {
    setSessionStarted(false);
    setCurrentText('');
    setFeedback(null);
    setTimer(30);
    setTimerActive(false);
    setIsRecording(false);
  };

  /**
   * Format timer display
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="practice-loop">
      {!sessionStarted ? (
        // Welcome screen
        <div className="welcome-screen card">
          <h2>🎤 Ready to Practice?</h2>
          <p>
            You'll see a text to read aloud for up to 30 seconds. 
            The AI will analyze your pronunciation and give you personalized feedback with a score!
          </p>
          <div className="instructions">
            <h3>How it works:</h3>
            <ol>
              <li>Click "Start Practice" to see your text</li>
              <li>Read the text clearly into your microphone</li>
              <li>Recording will stop automatically after 30 seconds</li>
              <li>Get instant feedback and tips for improvement!</li>
            </ol>
          </div>
          <button 
            className="button primary" 
            onClick={startNewSession}
            style={{ fontSize: '1.2rem', padding: '15px 30px' }}
          >
            🚀 Start Practice Session
          </button>
        </div>
      ) : (
        // Practice session interface
        <div className="practice-session">
          {/* Timer and status */}
          <div className="session-header">
            <div className="timer">
              <span className={`timer-display ${timer <= 10 ? 'warning' : ''}`}>
                ⏱️ {formatTime(timer)}
              </span>
              {timerActive && <span className="timer-status">Reading Time</span>}
            </div>
            <button 
              className="button" 
              onClick={resetSession}
              style={{ marginLeft: 'auto' }}
            >
              🔄 New Text
            </button>
          </div>

          {/* Text to read */}
          <div className="practice-text card">
            <h3>📖 Read this text aloud:</h3>
            <div className="text-display">
              {currentText}
            </div>
            {timerActive && (
              <p className="instruction">
                <strong>Start reading now!</strong> You have {timer} seconds.
              </p>
            )}
          </div>

          {/* Recording interface */}
          <div className="recording-section card">
            <Recorder
              onRecordingComplete={handleRecordingComplete}
              onRecordingStateChange={setIsRecording}
              disabled={loading}
              maxDuration={30}
            />
            
            {loading && (
              <div className="loading">
                <p>🔄 Analyzing your pronunciation...</p>
              </div>
            )}
          </div>

          {/* Feedback display */}
          {feedback && (
            <Feedback
              transcription={feedback.transcription}
              score={feedback.score}
              feedback={feedback.feedback}
              letterGrade={feedback.letterGrade}
              targetText={currentText}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default PracticeLoop;