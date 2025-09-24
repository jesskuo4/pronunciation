/**
 * Utility functions for phoneme processing and IPA handling
 * Provides basic phoneme comparison and pronunciation analysis
 */

// Sample practice texts of varying difficulty
export const PRACTICE_TEXTS = [
  "The quick brown fox jumps over the lazy dog near the peaceful river.",
  "She sells seashells by the seashore, where waves crash against weathered rocks.",
  "Peter Piper picked a peck of pickled peppers from the garden yesterday.",
  "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
  "The thirty-three thieves thought they thrilled the throne throughout Thursday.",
  "Red leather, yellow leather, repeat this phrase three times very quickly.",
  "Unique New York's unique yellow unicorns live near the university.",
  "Six sick slick slim sycamore saplings stood silently in the snow.",
  "The blue bluebird blinks brightly in the brilliant morning sunshine.",
  "Freshly fried flying fish taste fantastic when prepared with fine seasonings."
];

// Common pronunciation difficulties and their corrections
export const PRONUNCIATION_PATTERNS = {
  'th': {
    common_errors: ['d', 'f', 'z'],
    correct_sound: 'θ',
    tip: 'Place tongue between teeth and blow air gently'
  },
  'r': {
    common_errors: ['w', 'l'],
    correct_sound: 'ɹ',
    tip: 'Curl tongue tip back without touching the roof of mouth'
  },
  'l': {
    common_errors: ['r', 'w'],
    correct_sound: 'l',
    tip: 'Touch tongue tip to roof of mouth behind front teeth'
  },
  'v': {
    common_errors: ['b', 'f'],
    correct_sound: 'v',
    tip: 'Bite lower lip gently and vibrate vocal cords'
  },
  'w': {
    common_errors: ['v', 'r'],
    correct_sound: 'w',
    tip: 'Round lips and blow air out gently'
  }
};

/**
 * Get a random practice text for the user to read
 */
export function getRandomPracticeText(): string {
  const randomIndex = Math.floor(Math.random() * PRACTICE_TEXTS.length);
  return PRACTICE_TEXTS[randomIndex];
}

/**
 * Basic phoneme comparison using simple string similarity
 * In a real implementation, this would use proper phoneme analysis
 */
export function comparePhonemes(userText: string, targetText: string): number {
  if (!userText || !targetText) return 0;
  
  const userWords = userText.toLowerCase().trim().split(/\s+/);
  const targetWords = targetText.toLowerCase().trim().split(/\s+/);
  
  // Simple word-level comparison
  let matches = 0;
  const maxLength = Math.max(userWords.length, targetWords.length);
  
  for (let i = 0; i < Math.min(userWords.length, targetWords.length); i++) {
    if (userWords[i] === targetWords[i]) {
      matches++;
    } else {
      // Partial credit for similar words
      const similarity = calculateStringSimilarity(userWords[i], targetWords[i]);
      matches += similarity;
    }
  }
  
  return Math.round((matches / maxLength) * 100);
}

/**
 * Calculate similarity between two strings using Levenshtein-like algorithm
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Generate pronunciation feedback based on common patterns
 */
export function generatePronunciationFeedback(userText: string, targetText: string, score: number): string[] {
  const feedback: string[] = [];
  
  if (score >= 90) {
    feedback.push("Excellent pronunciation! Your speech is very clear and accurate.");
  } else if (score >= 80) {
    feedback.push("Great job! Your pronunciation is good with minor areas for improvement.");
  } else if (score >= 70) {
    feedback.push("Good effort! There are some pronunciation patterns to work on.");
  } else if (score >= 60) {
    feedback.push("Keep practicing! Focus on speaking more slowly and clearly.");
  } else {
    feedback.push("Don't worry - pronunciation takes time to improve. Try speaking more slowly.");
  }
  
  // Check for common pronunciation issues
  const userLower = userText.toLowerCase();
  const targetLower = targetText.toLowerCase();
  
  // Look for missing or mispronounced sounds
  Object.entries(PRONUNCIATION_PATTERNS).forEach(([sound, pattern]) => {
    const targetHasSound = targetLower.includes(sound);
    const userHasSound = userLower.includes(sound);
    
    if (targetHasSound && !userHasSound) {
      feedback.push(`Practice the "${sound}" sound: ${pattern.tip}`);
    }
  });
  
  // General tips based on score
  if (score < 80) {
    feedback.push("Tip: Try reading more slowly and enunciating each word clearly.");
    feedback.push("Focus on moving your mouth and tongue deliberately for each sound.");
  }
  
  return feedback;
}

/**
 * Convert score to letter grade
 */
export function getLetterGrade(score: number): string {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 65) return 'D';
  return 'F';
}