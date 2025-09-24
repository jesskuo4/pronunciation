import { generatePronunciationFeedback, getLetterGrade } from '../utils/phonemeUtils';

/**
 * FeedbackAgent generates personalized feedback and scoring for pronunciation practice
 * Provides detailed analysis and improvement suggestions based on performance
 */
export class FeedbackAgent {
  
  /**
   * Generate comprehensive feedback based on transcription comparison
   */
  public generateFeedback(userText: string, targetText: string, score: number): string[] {
    const feedback = generatePronunciationFeedback(userText, targetText, score);
    
    // Add performance-specific feedback
    const performanceFeedback = this.generatePerformanceFeedback(score);
    const technicalFeedback = this.generateTechnicalFeedback(userText, targetText);
    
    return [...feedback, ...performanceFeedback, ...technicalFeedback];
  }

  /**
   * Get letter grade based on numeric score
   */
  public getLetterGrade(score: number): string {
    return getLetterGrade(score);
  }

  /**
   * Generate performance-based feedback messages
   */
  private generatePerformanceFeedback(score: number): string[] {
    const feedback: string[] = [];
    
    if (score >= 95) {
      feedback.push("🌟 Outstanding! You have excellent pronunciation clarity.");
      feedback.push("Consider trying more challenging texts to further improve.");
    } else if (score >= 85) {
      feedback.push("🎯 Great work! Your pronunciation is very good.");
      feedback.push("Focus on maintaining this level of clarity consistently.");
    } else if (score >= 75) {
      feedback.push("👍 Good job! You're making solid progress.");
      feedback.push("Try practicing with longer sentences to build fluency.");
    } else if (score >= 65) {
      feedback.push("📈 Keep improving! You're on the right track.");
      feedback.push("Practice reading aloud daily to build muscle memory.");
    } else if (score >= 50) {
      feedback.push("💪 Don't give up! Pronunciation skills take time to develop.");
      feedback.push("Focus on speaking slowly and clearly at first.");
    } else {
      feedback.push("🌱 Every expert was once a beginner. Keep practicing!");
      feedback.push("Try breaking down difficult words into smaller parts.");
    }
    
    return feedback;
  }

  /**
   * Generate technical feedback based on text analysis
   */
  private generateTechnicalFeedback(userText: string, targetText: string): string[] {
    const feedback: string[] = [];
    const userWords = userText.toLowerCase().trim().split(/\s+/);
    const targetWords = targetText.toLowerCase().trim().split(/\s+/);
    
    // Check for common issues
    if (userWords.length < targetWords.length * 0.7) {
      feedback.push("⚡ Try to speak all the words in the text. Take your time!");
    }
    
    if (userWords.length > targetWords.length * 1.3) {
      feedback.push("🎯 Focus on speaking just the words shown. Avoid adding extra words.");
    }
    
    // Check for word order issues
    const orderCorrect = this.checkWordOrder(userWords, targetWords);
    if (orderCorrect < 0.8) {
      feedback.push("📝 Pay attention to the word order in the text.");
    }
    
    // Check for specific sound patterns
    const soundIssues = this.detectSoundIssues(userText, targetText);
    if (soundIssues.length > 0) {
      feedback.push(`🔤 Focus on these sounds: ${soundIssues.join(', ')}`);
    }
    
    return feedback;
  }

  /**
   * Check word order accuracy
   */
  private checkWordOrder(userWords: string[], targetWords: string[]): number {
    let correctOrder = 0;
    const minLength = Math.min(userWords.length, targetWords.length);
    
    for (let i = 0; i < minLength; i++) {
      if (userWords[i] === targetWords[i]) {
        correctOrder++;
      }
    }
    
    return targetWords.length > 0 ? correctOrder / targetWords.length : 0;
  }

  /**
   * Detect specific sound issues
   */
  private detectSoundIssues(userText: string, targetText: string): string[] {
    const issues: string[] = [];
    const userLower = userText.toLowerCase();
    const targetLower = targetText.toLowerCase();
    
    // Common sound substitutions to check for
    const soundChecks = [
      { target: 'th', user: 'd', sound: 'th' },
      { target: 'th', user: 'f', sound: 'th' },
      { target: 'r', user: 'w', sound: 'r' },
      { target: 'l', user: 'r', sound: 'l' },
      { target: 'v', user: 'b', sound: 'v' },
      { target: 'w', user: 'v', sound: 'w' }
    ];
    
    soundChecks.forEach(check => {
      if (targetLower.includes(check.target) && userLower.includes(check.user)) {
        if (!issues.includes(check.sound)) {
          issues.push(check.sound);
        }
      }
    });
    
    return issues;
  }

  /**
   * Generate motivational message based on score trend
   */
  public generateMotivationalMessage(currentScore: number, previousScores: number[]): string {
    if (previousScores.length === 0) {
      return "Welcome to pronunciation practice! Let's start building your speaking confidence! 🚀";
    }
    
    const recentAverage = previousScores.slice(-3).reduce((sum, score) => sum + score, 0) / Math.min(3, previousScores.length);
    const improvement = currentScore - recentAverage;
    
    if (improvement > 10) {
      return "Amazing improvement! You're really getting the hang of this! 🌟";
    } else if (improvement > 5) {
      return "Great progress! Keep up the excellent work! 📈";
    } else if (improvement > 0) {
      return "Nice job! You're steadily improving! 👍";
    } else if (improvement > -5) {
      return "Stay consistent! Small daily practice leads to big improvements! 💪";
    } else {
      return "Don't worry about one session. Focus on the long-term progress! 🌱";
    }
  }

  /**
   * Provide targeted practice suggestions
   */
  public getPracticeSuggestions(score: number, difficulty: number): string[] {
    const suggestions: string[] = [];
    
    if (score < 70) {
      suggestions.push("Start with shorter, simpler sentences");
      suggestions.push("Practice reading aloud for 10 minutes daily");
      suggestions.push("Record yourself and listen to identify problem areas");
    } else if (score < 85) {
      suggestions.push("Work on maintaining consistent pace and clarity");
      suggestions.push("Practice tongue twisters to improve articulation");
      suggestions.push("Focus on problematic sounds identified in feedback");
    } else {
      suggestions.push("Challenge yourself with more complex texts");
      suggestions.push("Practice different speaking speeds and emotions");
      suggestions.push("Work on natural intonation and rhythm");
    }
    
    // Add difficulty-based suggestions
    if (difficulty > 7) {
      suggestions.push("Break down complex words into syllables");
      suggestions.push("Practice difficult sounds in isolation first");
    }
    
    return suggestions;
  }
}