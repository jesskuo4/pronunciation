/**
 * Tests for phoneme utility functions
 */

import {
  PRACTICE_TEXTS,
  PRONUNCIATION_PATTERNS,
  getRandomPracticeText,
  comparePhonemes,
  generatePronunciationFeedback,
  getLetterGrade
} from './phonemeUtils';

describe('phonemeUtils', () => {
  describe('PRACTICE_TEXTS', () => {
    it('should contain practice texts', () => {
      expect(PRACTICE_TEXTS).toBeDefined();
      expect(Array.isArray(PRACTICE_TEXTS)).toBe(true);
      expect(PRACTICE_TEXTS.length).toBeGreaterThan(0);
    });

    it('should contain only non-empty strings', () => {
      PRACTICE_TEXTS.forEach(text => {
        expect(typeof text).toBe('string');
        expect(text.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('PRONUNCIATION_PATTERNS', () => {
    it('should contain pronunciation patterns', () => {
      expect(PRONUNCIATION_PATTERNS).toBeDefined();
      expect(typeof PRONUNCIATION_PATTERNS).toBe('object');
    });

    it('should have valid pattern structure', () => {
      Object.entries(PRONUNCIATION_PATTERNS).forEach(([sound, pattern]) => {
        expect(typeof sound).toBe('string');
        expect(pattern).toHaveProperty('common_errors');
        expect(pattern).toHaveProperty('correct_sound');
        expect(pattern).toHaveProperty('tip');
        expect(Array.isArray(pattern.common_errors)).toBe(true);
        expect(typeof pattern.correct_sound).toBe('string');
        expect(typeof pattern.tip).toBe('string');
      });
    });
  });

  describe('getRandomPracticeText', () => {
    it('should return a string', () => {
      const text = getRandomPracticeText();
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(0);
    });

    it('should return a text from PRACTICE_TEXTS', () => {
      const text = getRandomPracticeText();
      expect(PRACTICE_TEXTS).toContain(text);
    });

    it('should return different texts on multiple calls (statistically)', () => {
      const texts = new Set();
      for (let i = 0; i < 50; i++) {
        texts.add(getRandomPracticeText());
      }
      // With 10 texts, we should get some variation in 50 calls
      expect(texts.size).toBeGreaterThan(1);
    });
  });

  describe('comparePhonemes', () => {
    it('should return 0 for empty inputs', () => {
      expect(comparePhonemes('', '')).toBe(0);
      expect(comparePhonemes('', 'test')).toBe(0);
      expect(comparePhonemes('test', '')).toBe(0);
    });

    it('should return 100 for identical texts', () => {
      const text = 'The quick brown fox';
      expect(comparePhonemes(text, text)).toBe(100);
    });

    it('should return 100 for identical texts with different cases', () => {
      expect(comparePhonemes('Hello World', 'hello world')).toBe(100);
    });

    it('should return a score between 0 and 100', () => {
      const score = comparePhonemes('hello world', 'hello earth');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should give higher scores for more similar texts', () => {
      const targetText = 'The quick brown fox jumps';
      const similarText = 'The quick brown fox runs';
      const dissimilarText = 'A slow red cat walks';
      
      const similarScore = comparePhonemes(similarText, targetText);
      const dissimilarScore = comparePhonemes(dissimilarText, targetText);
      
      expect(similarScore).toBeGreaterThan(dissimilarScore);
    });

    it('should handle extra whitespace', () => {
      const score = comparePhonemes('  hello   world  ', 'hello world');
      expect(score).toBe(100);
    });
  });

  describe('generatePronunciationFeedback', () => {
    it('should return an array of strings', () => {
      const feedback = generatePronunciationFeedback('hello', 'hello', 90);
      expect(Array.isArray(feedback)).toBe(true);
      feedback.forEach(item => {
        expect(typeof item).toBe('string');
      });
    });

    it('should provide excellent feedback for high scores', () => {
      const feedback = generatePronunciationFeedback('test', 'test', 95);
      expect(feedback.some(f => f.toLowerCase().includes('excellent'))).toBe(true);
    });

    it('should provide encouraging feedback for low scores', () => {
      const feedback = generatePronunciationFeedback('test', 'test', 50);
      expect(feedback.some(f => f.toLowerCase().includes('practice') || f.toLowerCase().includes('slowly'))).toBe(true);
    });

    it('should provide pronunciation tips for missing sounds', () => {
      const feedback = generatePronunciationFeedback('dat', 'that', 70);
      expect(feedback.some(f => f.includes('th'))).toBe(true);
    });

    it('should provide general tips for low scores', () => {
      const feedback = generatePronunciationFeedback('test', 'test', 70);
      expect(feedback.some(f => f.toLowerCase().includes('tip'))).toBe(true);
    });
  });

  describe('getLetterGrade', () => {
    it('should return correct letter grades', () => {
      expect(getLetterGrade(100)).toBe('A+');
      expect(getLetterGrade(97)).toBe('A+');
      expect(getLetterGrade(95)).toBe('A');
      expect(getLetterGrade(90)).toBe('A-');
      expect(getLetterGrade(87)).toBe('B+');
      expect(getLetterGrade(83)).toBe('B');
      expect(getLetterGrade(80)).toBe('B-');
      expect(getLetterGrade(77)).toBe('C+');
      expect(getLetterGrade(73)).toBe('C');
      expect(getLetterGrade(70)).toBe('C-');
      expect(getLetterGrade(67)).toBe('D+');
      expect(getLetterGrade(65)).toBe('D');
      expect(getLetterGrade(60)).toBe('F');
      expect(getLetterGrade(0)).toBe('F');
    });

    it('should handle edge cases', () => {
      expect(getLetterGrade(96.9)).toBe('A');
      expect(getLetterGrade(92.9)).toBe('A-'); // Adjusted based on actual boundaries
      expect(getLetterGrade(89.9)).toBe('B+');
    });

    it('should handle negative scores', () => {
      expect(getLetterGrade(-10)).toBe('F');
    });

    it('should handle scores above 100', () => {
      expect(getLetterGrade(110)).toBe('A+');
    });
  });
});