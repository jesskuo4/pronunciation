import { getRandomPracticeText } from '../utils/phonemeUtils';

/**
 * PracticeAgent manages practice sessions, text generation, and progress tracking
 * Handles session statistics and adaptive difficulty progression
 */
export class PracticeAgent {
  private static readonly STORAGE_KEY = 'pronunciation_practice_stats';
  private sessionHistory: number[] = [];
  
  constructor() {
    this.loadStats();
  }

  /**
   * Generate a practice text for the user to read
   * TODO: In future versions, this could adapt difficulty based on user progress
   */
  public generatePracticeText(): string {
    return getRandomPracticeText();
  }

  /**
   * Record a completed practice session
   */
  public recordSession(score: number): void {
    this.sessionHistory.push(score);
    
    // Keep only the last 50 sessions to avoid storage bloat
    if (this.sessionHistory.length > 50) {
      this.sessionHistory = this.sessionHistory.slice(-50);
    }
    
    this.saveStats();
  }

  /**
   * Get practice statistics
   */
  public getStats(): {
    sessionsCompleted: number;
    averageScore: number;
    recentScores: number[];
  } {
    const sessionsCompleted = this.sessionHistory.length;
    const averageScore = sessionsCompleted > 0 
      ? Math.round(this.sessionHistory.reduce((sum, score) => sum + score, 0) / sessionsCompleted)
      : 0;
    const recentScores = this.sessionHistory.slice(-10); // Last 10 sessions
    
    return {
      sessionsCompleted,
      averageScore,
      recentScores
    };
  }

  /**
   * Get progress trend analysis
   */
  public getProgressTrend(): {
    trend: 'improving' | 'stable' | 'declining' | 'insufficient_data';
    trendPercentage: number;
  } {
    if (this.sessionHistory.length < 3) {
      return { trend: 'insufficient_data', trendPercentage: 0 };
    }

    const recent = this.sessionHistory.slice(-5);
    const earlier = this.sessionHistory.slice(-10, -5);
    
    if (earlier.length === 0) {
      return { trend: 'insufficient_data', trendPercentage: 0 };
    }

    const recentAverage = recent.reduce((sum, score) => sum + score, 0) / recent.length;
    const earlierAverage = earlier.reduce((sum, score) => sum + score, 0) / earlier.length;
    
    const difference = recentAverage - earlierAverage;
    const percentageChange = Math.round((difference / earlierAverage) * 100);

    let trend: 'improving' | 'stable' | 'declining';
    if (Math.abs(difference) < 2) {
      trend = 'stable';
    } else if (difference > 0) {
      trend = 'improving';
    } else {
      trend = 'declining';
    }

    return {
      trend,
      trendPercentage: Math.abs(percentageChange)
    };
  }

  /**
   * Get recommended difficulty level based on performance
   */
  public getRecommendedDifficulty(): number {
    if (this.sessionHistory.length < 3) {
      return 3; // Start with medium difficulty
    }

    const recentAverage = this.sessionHistory.slice(-5).reduce((sum, score) => sum + score, 0) / Math.min(5, this.sessionHistory.length);
    
    if (recentAverage >= 90) {
      return 8; // Hard
    } else if (recentAverage >= 80) {
      return 6; // Medium-Hard
    } else if (recentAverage >= 70) {
      return 4; // Medium
    } else if (recentAverage >= 60) {
      return 2; // Easy-Medium
    } else {
      return 1; // Easy
    }
  }

  /**
   * Get personalized practice recommendations
   */
  public getPersonalizedRecommendations(): string[] {
    const stats = this.getStats();
    const trend = this.getProgressTrend();
    const recommendations: string[] = [];

    // Session frequency recommendations
    if (stats.sessionsCompleted === 0) {
      recommendations.push("Start with daily 5-minute practice sessions");
    } else if (stats.sessionsCompleted < 7) {
      recommendations.push("Try to practice consistently - daily sessions work best!");
    } else if (stats.sessionsCompleted >= 30) {
      recommendations.push("Great consistency! Consider increasing session length");
    }

    // Performance-based recommendations
    if (stats.averageScore < 60) {
      recommendations.push("Focus on speaking slowly and clearly");
      recommendations.push("Practice shorter texts until your confidence builds");
    } else if (stats.averageScore < 80) {
      recommendations.push("You're improving! Try varying your practice materials");
      recommendations.push("Work on maintaining consistency across different text types");
    } else if (stats.averageScore >= 90) {
      recommendations.push("Excellent work! Try challenging yourself with complex texts");
      recommendations.push("Consider practicing different accents or speaking speeds");
    }

    // Trend-based recommendations
    if (trend.trend === 'improving') {
      recommendations.push(`Great progress! You've improved ${trend.trendPercentage}% recently`);
    } else if (trend.trend === 'declining') {
      recommendations.push("Take a break if needed - sometimes rest helps improvement");
      recommendations.push("Review your recent sessions to identify patterns");
    } else if (trend.trend === 'stable') {
      recommendations.push("Consider changing your practice routine to break through plateaus");
    }

    return recommendations;
  }

  /**
   * Reset practice statistics
   */
  public resetStats(): void {
    this.sessionHistory = [];
    this.saveStats();
  }

  /**
   * Save statistics to localStorage
   */
  private saveStats(): void {
    try {
      const stats = {
        sessionHistory: this.sessionHistory,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(PracticeAgent.STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.warn('Could not save practice statistics:', error);
    }
  }

  /**
   * Load statistics from localStorage
   */
  private loadStats(): void {
    try {
      const saved = localStorage.getItem(PracticeAgent.STORAGE_KEY);
      if (saved) {
        const stats = JSON.parse(saved);
        this.sessionHistory = stats.sessionHistory || [];
      }
    } catch (error) {
      console.warn('Could not load practice statistics:', error);
      this.sessionHistory = [];
    }
  }

  /**
   * Export practice data for analysis or backup
   */
  public exportData() {
    return {
      sessionsCompleted: this.sessionHistory.length,
      sessionHistory: [...this.sessionHistory],
      stats: this.getStats(),
      trend: this.getProgressTrend(),
      exportDate: new Date().toISOString()
    };
  }

  /**
   * Import practice data from backup
   */
  public importData(data: { sessionHistory: number[] }): boolean {
    try {
      if (Array.isArray(data.sessionHistory) && data.sessionHistory.every(score => typeof score === 'number' && score >= 0 && score <= 100)) {
        this.sessionHistory = data.sessionHistory;
        this.saveStats();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}