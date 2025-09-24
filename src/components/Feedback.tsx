import React from 'react';
import './Components.css';

interface FeedbackProps {
  transcription: string;
  score: number;
  feedback: string[];
  letterGrade: string;
  targetText: string;
}

/**
 * Feedback component that displays pronunciation analysis results
 * Shows score, grade, transcription comparison, and improvement suggestions
 */
const Feedback: React.FC<FeedbackProps> = ({
  transcription,
  score,
  feedback,
  letterGrade,
  targetText
}) => {
  /**
   * Get color based on score
   */
  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#4CAF50'; // Green
    if (score >= 80) return '#8BC34A'; // Light green
    if (score >= 70) return '#FFC107'; // Amber
    if (score >= 60) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  /**
   * Get emoji based on score
   */
  const getScoreEmoji = (score: number): string => {
    if (score >= 95) return '🌟';
    if (score >= 90) return '🎯';
    if (score >= 80) return '👍';
    if (score >= 70) return '📈';
    if (score >= 60) return '💪';
    return '🌱';
  };

  /**
   * Calculate words per minute (rough estimate)
   */
  const calculateWPM = (text: string, durationSeconds: number = 30): number => {
    const wordCount = text.trim().split(/\s+/).length;
    return Math.round((wordCount / durationSeconds) * 60);
  };

  const wpm = calculateWPM(transcription);

  return (
    <div className="feedback card">
      <div className="feedback-header">
        <h2>📊 Your Pronunciation Results</h2>
      </div>

      {/* Score display */}
      <div className="score-section">
        <div className="score-display" style={{ color: getScoreColor(score) }}>
          <div className="score-main">
            {getScoreEmoji(score)} {score}% ({letterGrade})
          </div>
          <div className="score-subtitle">
            Pronunciation Accuracy
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="stats-row">
        <div className="stat-item">
          <div className="stat-value">{wpm}</div>
          <div className="stat-label">Words/Min</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{transcription.trim().split(/\s+/).length}</div>
          <div className="stat-label">Words Spoken</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{targetText.trim().split(/\s+/).length}</div>
          <div className="stat-label">Target Words</div>
        </div>
      </div>

      {/* Text comparison */}
      <div className="comparison-section">
        <div className="comparison-row">
          <div className="text-comparison">
            <h4>📖 Target Text:</h4>
            <div className="text-display target-text">
              {targetText}
            </div>
          </div>
        </div>
        
        <div className="comparison-row">
          <div className="text-comparison">
            <h4>🎤 What You Said:</h4>
            <div className="text-display user-text">
              {transcription || <em>No speech detected. Try speaking louder or closer to the microphone.</em>}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback and tips */}
      <div className="feedback-section">
        <h4>💡 Personalized Feedback & Tips:</h4>
        <div className="feedback-list">
          <ul>
            {feedback.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Encouragement message */}
      <div className="encouragement">
        {score >= 90 && (
          <p className="success">🎉 Outstanding work! Your pronunciation is excellent!</p>
        )}
        {score >= 80 && score < 90 && (
          <p className="good">🎯 Great job! You're speaking very clearly!</p>
        )}
        {score >= 70 && score < 80 && (
          <p className="okay">👍 Good effort! Keep practicing to improve further!</p>
        )}
        {score >= 60 && score < 70 && (
          <p className="needs-work">📈 You're making progress! Focus on the tips above!</p>
        )}
        {score < 60 && (
          <p className="keep-trying">🌱 Don't give up! Every expert was once a beginner!</p>
        )}
      </div>
    </div>
  );
};

export default Feedback;