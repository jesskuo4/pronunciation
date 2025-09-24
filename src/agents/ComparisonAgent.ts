import { comparePhonemes } from '../utils/phonemeUtils';

/**
 * ComparisonAgent handles the comparison between user transcription and target text
 * Provides phoneme-level analysis and scoring algorithms
 */
export class ComparisonAgent {
  
  /**
   * Compare transcribed text with target text and return accuracy score
   */
  public compareTexts(userText: string, targetText: string): number {
    if (!userText || !targetText) {
      return 0;
    }

    // Use the phoneme comparison utility
    const score = comparePhonemes(userText, targetText);
    
    // Apply additional scoring factors
    const lengthPenalty = this.calculateLengthPenalty(userText, targetText);
    const wordOrderBonus = this.calculateWordOrderBonus(userText, targetText);
    
    // Combine scores with weights
    let finalScore = score * 0.7 + wordOrderBonus * 0.2 - lengthPenalty * 0.1;
    
    // Ensure score is within 0-100 range
    return Math.max(0, Math.min(100, Math.round(finalScore)));
  }

  /**
   * Calculate penalty for significant length differences
   */
  private calculateLengthPenalty(userText: string, targetText: string): number {
    const userWords = userText.trim().split(/\s+/).length;
    const targetWords = targetText.trim().split(/\s+/).length;
    
    const lengthDifference = Math.abs(userWords - targetWords);
    const maxWords = Math.max(userWords, targetWords);
    
    if (maxWords === 0) return 0;
    
    // Penalty increases with length difference
    return (lengthDifference / maxWords) * 30; // Max penalty of 30 points
  }

  /**
   * Calculate bonus for maintaining correct word order
   */
  private calculateWordOrderBonus(userText: string, targetText: string): number {
    const userWords = userText.toLowerCase().trim().split(/\s+/);
    const targetWords = targetText.toLowerCase().trim().split(/\s+/);
    
    let consecutiveMatches = 0;
    let maxConsecutive = 0;
    
    for (let i = 0; i < Math.min(userWords.length, targetWords.length); i++) {
      if (userWords[i] === targetWords[i]) {
        consecutiveMatches++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveMatches);
      } else {
        consecutiveMatches = 0;
      }
    }
    
    // Bonus based on longest consecutive correct sequence
    return (maxConsecutive / targetWords.length) * 20; // Max bonus of 20 points
  }

  /**
   * Analyze specific pronunciation errors
   */
  public analyzeErrors(userText: string, targetText: string): {
    missedWords: string[];
    addedWords: string[];
    substitutions: { original: string; spoken: string }[];
  } {
    const userWords = userText.toLowerCase().trim().split(/\s+/);
    const targetWords = targetText.toLowerCase().trim().split(/\s+/);
    
    const missedWords: string[] = [];
    const addedWords: string[] = [];
    const substitutions: { original: string; spoken: string }[] = [];
    
    // Simple word-by-word comparison
    const maxLength = Math.max(userWords.length, targetWords.length);
    
    for (let i = 0; i < maxLength; i++) {
      const userWord = i < userWords.length ? userWords[i] : null;
      const targetWord = i < targetWords.length ? targetWords[i] : null;
      
      if (targetWord && !userWord) {
        missedWords.push(targetWord);
      } else if (userWord && !targetWord) {
        addedWords.push(userWord);
      } else if (userWord && targetWord && userWord !== targetWord) {
        substitutions.push({ original: targetWord, spoken: userWord });
      }
    }
    
    return {
      missedWords,
      addedWords,
      substitutions
    };
  }

  /**
   * Calculate pronunciation difficulty score for a given text
   */
  public calculateDifficulty(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let difficultyScore = 0;
    
    // Factors that increase difficulty
    const difficultyFactors = {
      longWords: words.filter(word => word.length > 7).length * 2,
      consonantClusters: this.countConsonantClusters(text),
      uncommonSounds: this.countUncommonSounds(text),
      tongueTristers: this.detectTongueTwisters(text)
    };
    
    difficultyScore = (
      difficultyFactors.longWords +
      difficultyFactors.consonantClusters +
      difficultyFactors.uncommonSounds +
      difficultyFactors.tongueTristers
    );
    
    // Normalize to 1-10 scale
    return Math.min(10, Math.max(1, Math.round(difficultyScore / words.length * 5)));
  }

  /**
   * Count consonant clusters in text
   */
  private countConsonantClusters(text: string): number {
    const consonantClusters = text.match(/[bcdfghjklmnpqrstvwxyz]{3,}/gi);
    return consonantClusters ? consonantClusters.length : 0;
  }

  /**
   * Count uncommon sounds that are difficult to pronounce
   */
  private countUncommonSounds(text: string): number {
    const uncommonPatterns = ['th', 'zh', 'ng', 'tion', 'sion'];
    let count = 0;
    
    uncommonPatterns.forEach(pattern => {
      const matches = text.toLowerCase().match(new RegExp(pattern, 'g'));
      if (matches) count += matches.length;
    });
    
    return count;
  }

  /**
   * Detect tongue twister patterns
   */
  private detectTongueTwisters(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let twisterScore = 0;
    
    // Check for repeated starting sounds
    const startingSounds: { [key: string]: number } = {};
    words.forEach(word => {
      if (word.length > 0) {
        const firstSound = word.charAt(0);
        startingSounds[firstSound] = (startingSounds[firstSound] || 0) + 1;
      }
    });
    
    // Score based on sound repetition
    Object.values(startingSounds).forEach(count => {
      if (count >= 3) twisterScore += count - 2;
    });
    
    return twisterScore;
  }
}