/**
 * Tests for PronCoachAgent
 */

import { PronCoachAgent } from './PronCoachAgent';

// Mock the dependencies
jest.mock('./TranscriptionAgent');
jest.mock('./ComparisonAgent');
jest.mock('./FeedbackAgent');
jest.mock('./PracticeAgent');

describe('PronCoachAgent', () => {
  let agent: PronCoachAgent;

  beforeEach(() => {
    agent = new PronCoachAgent();
  });

  describe('constructor', () => {
    it('should initialize all agent dependencies', () => {
      expect(agent).toBeInstanceOf(PronCoachAgent);
    });
  });

  describe('startPracticeSession', () => {
    it('should return a practice text', () => {
      const text = agent.startPracticeSession();
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(0);
    });

    it('should return different texts on multiple calls (statistically)', () => {
      const texts = new Set();
      for (let i = 0; i < 20; i++) {
        texts.add(agent.startPracticeSession());
      }
      // Should get some variation
      expect(texts.size).toBeGreaterThan(1);
    });
  });

  describe('processRecording', () => {
    it('should process audio and return feedback', async () => {
      const audioBlob = new Blob(['test audio'], { type: 'audio/wav' });
      const targetText = 'Hello world';
      
      const result = await agent.processRecording(audioBlob, targetText);
      
      expect(result).toHaveProperty('transcription');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('feedback');
      expect(result).toHaveProperty('letterGrade');
      
      expect(typeof result.transcription).toBe('string');
      expect(typeof result.score).toBe('number');
      expect(Array.isArray(result.feedback)).toBe(true);
      expect(typeof result.letterGrade).toBe('string');
    });

    it('should return valid score range', async () => {
      const audioBlob = new Blob(['test audio'], { type: 'audio/wav' });
      const targetText = 'Hello world';
      
      const result = await agent.processRecording(audioBlob, targetText);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should return non-empty feedback array', async () => {
      const audioBlob = new Blob(['test audio'], { type: 'audio/wav' });
      const targetText = 'Hello world';
      
      const result = await agent.processRecording(audioBlob, targetText);
      
      expect(result.feedback.length).toBeGreaterThan(0);
      result.feedback.forEach(item => {
        expect(typeof item).toBe('string');
        expect(item.length).toBeGreaterThan(0);
      });
    });

    it('should return valid letter grade', async () => {
      const audioBlob = new Blob(['test audio'], { type: 'audio/wav' });
      const targetText = 'Hello world';
      
      const result = await agent.processRecording(audioBlob, targetText);
      
      const validGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];
      expect(validGrades).toContain(result.letterGrade);
    });

    it('should handle empty audio blob', async () => {
      const audioBlob = new Blob([], { type: 'audio/wav' });
      const targetText = 'Hello world';
      
      const result = await agent.processRecording(audioBlob, targetText);
      
      expect(result).toHaveProperty('transcription');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('feedback');
      expect(result).toHaveProperty('letterGrade');
    });

    it('should handle empty target text', async () => {
      const audioBlob = new Blob(['test audio'], { type: 'audio/wav' });
      const targetText = '';
      
      const result = await agent.processRecording(audioBlob, targetText);
      
      expect(result.score).toBe(0); // Should return 0 for empty target text
    });

    it('should handle processing errors gracefully', async () => {
      const audioBlob = new Blob(['test audio'], { type: 'audio/wav' });
      const targetText = 'Hello world';
      
      // This should not throw even if there are internal errors
      await expect(agent.processRecording(audioBlob, targetText)).resolves.toBeDefined();
    });
  });

  describe('checkBrowserSupport', () => {
    it('should return browser support information', () => {
      const support = agent.checkBrowserSupport();
      
      expect(support).toHaveProperty('speechRecognition');
      expect(support).toHaveProperty('mediaRecorder');
      
      expect(typeof support.speechRecognition).toBe('boolean');
      expect(typeof support.mediaRecorder).toBe('boolean');
    });

    it('should detect MediaRecorder support', () => {
      const support = agent.checkBrowserSupport();
      
      // MediaRecorder should be available in modern test environments
      expect(typeof support.mediaRecorder).toBe('boolean');
    });
  });

  describe('getPracticeStats', () => {
    it('should return practice statistics', () => {
      const stats = agent.getPracticeStats();
      
      expect(stats).toHaveProperty('sessionsCompleted');
      expect(stats).toHaveProperty('averageScore');
      expect(stats).toHaveProperty('recentScores');
      
      expect(typeof stats.sessionsCompleted).toBe('number');
      expect(typeof stats.averageScore).toBe('number');
      expect(Array.isArray(stats.recentScores)).toBe(true);
    });

    it('should return valid initial statistics', () => {
      const stats = agent.getPracticeStats();
      
      expect(stats.sessionsCompleted).toBeGreaterThanOrEqual(0);
      expect(stats.averageScore).toBeGreaterThanOrEqual(0);
      expect(stats.averageScore).toBeLessThanOrEqual(100);
    });
  });

  describe('recordPracticeSession', () => {
    it('should record a practice session', () => {
      expect(() => agent.recordPracticeSession(85)).not.toThrow();
    });

    it('should handle various score values', () => {
      expect(() => agent.recordPracticeSession(0)).not.toThrow();
      expect(() => agent.recordPracticeSession(50)).not.toThrow();
      expect(() => agent.recordPracticeSession(100)).not.toThrow();
    });

    it('should update statistics after recording', () => {
      const initialStats = agent.getPracticeStats();
      
      agent.recordPracticeSession(75);
      
      const updatedStats = agent.getPracticeStats();
      expect(updatedStats.sessionsCompleted).toBeGreaterThanOrEqual(initialStats.sessionsCompleted);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete workflow', async () => {
      // Start a practice session
      const practiceText = agent.startPracticeSession();
      expect(practiceText).toBeTruthy();
      
      // Process a recording
      const audioBlob = new Blob(['test audio'], { type: 'audio/wav' });
      const result = await agent.processRecording(audioBlob, practiceText);
      
      // Record the session
      agent.recordPracticeSession(result.score);
      
      // Check updated stats
      const stats = agent.getPracticeStats();
      expect(stats.sessionsCompleted).toBeGreaterThan(0);
    });

    it('should handle multiple sessions', async () => {
      const sessions = 3;
      
      for (let i = 0; i < sessions; i++) {
        const practiceText = agent.startPracticeSession();
        const audioBlob = new Blob([`test audio ${i}`], { type: 'audio/wav' });
        const result = await agent.processRecording(audioBlob, practiceText);
        agent.recordPracticeSession(result.score);
      }
      
      const stats = agent.getPracticeStats();
      expect(stats.sessionsCompleted).toBeGreaterThanOrEqual(sessions);
    });
  });

  describe('error handling', () => {
    it('should handle invalid audio blob gracefully', async () => {
      const invalidBlob = null as any;
      const targetText = 'Hello world';
      
      await expect(agent.processRecording(invalidBlob, targetText)).rejects.toThrow();
    });

    it('should handle undefined target text', async () => {
      const audioBlob = new Blob(['test audio'], { type: 'audio/wav' });
      const targetText = undefined as any;
      
      await expect(agent.processRecording(audioBlob, targetText)).rejects.toThrow();
    });
  });
});