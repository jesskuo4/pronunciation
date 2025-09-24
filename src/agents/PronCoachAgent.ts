import { TranscriptionAgent } from './TranscriptionAgent';
import { ComparisonAgent } from './ComparisonAgent';
import { FeedbackAgent } from './FeedbackAgent';
import { PracticeAgent } from './PracticeAgent';

/**
 * Main orchestrator agent that coordinates all pronunciation coaching functionality
 * Manages the overall flow from text generation to final feedback
 */
export class PronCoachAgent {
  private transcriptionAgent: TranscriptionAgent;
  private comparisonAgent: ComparisonAgent;
  private feedbackAgent: FeedbackAgent;
  private practiceAgent: PracticeAgent;

  constructor() {
    this.transcriptionAgent = new TranscriptionAgent();
    this.comparisonAgent = new ComparisonAgent();
    this.feedbackAgent = new FeedbackAgent();
    this.practiceAgent = new PracticeAgent();
  }

  /**
   * Start a new practice session
   * Returns the text for the user to read
   */
  public startPracticeSession(): string {
    return this.practiceAgent.generatePracticeText();
  }

  /**
   * Process audio recording and provide comprehensive feedback
   */
  public async processRecording(audioBlob: Blob, targetText: string): Promise<{
    transcription: string;
    score: number;
    feedback: string[];
    letterGrade: string;
  }> {
    try {
      // Step 1: Transcribe the audio
      const transcription = await this.transcriptionAgent.transcribeAudio(audioBlob);
      
      // Step 2: Compare transcription with target text
      const score = this.comparisonAgent.compareTexts(transcription, targetText);
      
      // Step 3: Generate detailed feedback
      const feedback = this.feedbackAgent.generateFeedback(transcription, targetText, score);
      const letterGrade = this.feedbackAgent.getLetterGrade(score);
      
      return {
        transcription,
        score,
        feedback,
        letterGrade
      };
    } catch (error) {
      console.error('Error processing recording:', error);
      throw new Error('Failed to process recording. Please try again.');
    }
  }

  /**
   * Check if the browser supports the required features
   */
  public checkBrowserSupport(): {
    speechRecognition: boolean;
    mediaRecorder: boolean;
  } {
    return {
      speechRecognition: this.transcriptionAgent.isSupported(),
      mediaRecorder: 'MediaRecorder' in window && !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia
    };
  }

  /**
   * Get practice statistics and progress tracking
   */
  public getPracticeStats(): {
    sessionsCompleted: number;
    averageScore: number;
    recentScores: number[];
  } {
    return this.practiceAgent.getStats();
  }

  /**
   * Record a completed practice session for statistics
   */
  public recordPracticeSession(score: number): void {
    this.practiceAgent.recordSession(score);
  }
}