// Extend the Window interface to include speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

/**
 * TranscriptionAgent handles speech-to-text conversion using the Web Speech API
 * Provides methods to transcribe audio recordings into text for comparison
 */
export class TranscriptionAgent {
  private recognition: any = null;

  constructor() {
    this.initializeSpeechRecognition();
  }

  /**
   * Initialize the Web Speech API if available
   */
  private initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      if (this.recognition) {
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;
      }
    }
  }

  /**
   * Check if speech recognition is supported in this browser
   */
  public isSupported(): boolean {
    return this.recognition !== null;
  }

  /**
   * Transcribe audio using Web Speech API
   * For now, this is a placeholder that would work with live speech recognition
   * In a full implementation, this would process the audio blob
   */
  public async transcribeAudio(audioBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      // For this MVP, we'll simulate transcription based on audio length
      // In a real implementation, this would process the actual audio
      setTimeout(() => {
        // Simulate transcription - in reality, this would be the actual transcribed text
        resolve(this.simulateTranscription(audioBlob));
      }, 1000);
    });
  }

  /**
   * Start live speech recognition (for real-time feedback)
   * This method can be used for immediate speech recognition without recording
   */
  public startLiveRecognition(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      let finalTranscript = '';

      this.recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
      };

      this.recognition.onend = () => {
        resolve(finalTranscript.trim());
      };

      this.recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.start();
    });
  }

  /**
   * Stop ongoing speech recognition
   */
  public stopRecognition(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  /**
   * Simulate transcription based on audio properties
   * This is a placeholder for the MVP - in production, this would use actual transcription
   */
  private simulateTranscription(audioBlob: Blob): string {
    // For the MVP, we'll return a simulated transcription
    // In production, this would process the actual audio
    const duration = audioBlob.size / 16000; // Rough estimate of duration
    
    if (duration < 5) {
      return "The quick brown fox jumps."; // Shorter transcription for short audio
    } else if (duration < 15) {
      return "The quick brown fox jumps over the lazy dog near the river.";
    } else {
      return "The quick brown fox jumps over the lazy dog near the peaceful river today.";
    }
  }

  /**
   * Get transcription confidence score (0-1)
   * This would be provided by the actual speech recognition API
   */
  public getConfidenceScore(): number {
    // Simulated confidence score
    return 0.85 + Math.random() * 0.15; // Between 0.85 and 1.0
  }
}