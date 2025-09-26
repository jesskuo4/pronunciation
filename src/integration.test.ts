/**
 * Integration tests for the pronunciation coaching system
 * Tests the complete workflow from text generation to feedback
 */

import { PronCoachAgent } from './agents/PronCoachAgent';
import { PracticeAgent } from './agents/PracticeAgent';
import { ComparisonAgent } from './agents/ComparisonAgent';
import { FeedbackAgent } from './agents/FeedbackAgent';
import { TranscriptionAgent } from './agents/TranscriptionAgent';

describe('Integration Tests', () => {
  describe('Complete pronunciation coaching workflow', () => {
    it('should handle a complete practice session', async () => {
      const coach = new PronCoachAgent();
      
      // Step 1: Start a practice session
      const practiceText = coach.startPracticeSession();
      expect(practiceText).toBeTruthy();
      expect(typeof practiceText).toBe('string');
      
      // Step 2: Simulate audio recording
      const audioBlob = new Blob(['simulated audio'], { type: 'audio/wav' });
      
      // Step 3: Process the recording
      const result = await coach.processRecording(audioBlob, practiceText);
      
      expect(result).toHaveProperty('transcription');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('feedback');
      expect(result).toHaveProperty('letterGrade');
      
      // Step 4: Record the session
      coach.recordPracticeSession(result.score);
      
      // Step 5: Check statistics
      const stats = coach.getPracticeStats();
      expect(stats.sessionsCompleted).toBeGreaterThan(0);
    });
  });

  describe('Agent coordination', () => {
    it('should coordinate between all agents correctly', async () => {
      const practiceAgent = new PracticeAgent();
      const comparisonAgent = new ComparisonAgent();
      const feedbackAgent = new FeedbackAgent();
      const transcriptionAgent = new TranscriptionAgent();
      
      // Generate practice text
      const text = practiceAgent.generatePracticeText();
      expect(text).toBeTruthy();
      
      // Simulate transcription
      const audioBlob = new Blob(['test'], { type: 'audio/wav' });
      const transcription = await transcriptionAgent.transcribeAudio(audioBlob);
      expect(transcription).toBeTruthy();
      
      // Compare texts
      const score = comparisonAgent.compareTexts(transcription, text);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      
      // Generate feedback
      const feedback = feedbackAgent.generateFeedback(transcription, text, score);
      expect(Array.isArray(feedback)).toBe(true);
      expect(feedback.length).toBeGreaterThan(0);
      
      // Get letter grade
      const grade = feedbackAgent.getLetterGrade(score);
      expect(grade).toMatch(/^[ABCDF][+-]?$/);
      
      // Record session
      practiceAgent.recordSession(score);
      const stats = practiceAgent.getStats();
      expect(stats.sessionsCompleted).toBeGreaterThan(0);
    });
  });

  describe('Error handling across components', () => {
    it('should handle errors gracefully in the complete workflow', async () => {
      const coach = new PronCoachAgent();
      
      // Should not throw with invalid inputs
      await expect(coach.processRecording(new Blob(), '')).rejects.toThrow();
      
      // But should still be functional for valid inputs
      const text = coach.startPracticeSession();
      const audioBlob = new Blob(['test'], { type: 'audio/wav' });
      const result = await coach.processRecording(audioBlob, text);
      
      expect(result).toBeDefined();
    });
  });

  describe('Data persistence and retrieval', () => {
    it('should persist and retrieve practice data', () => {
      const agent1 = new PracticeAgent();
      
      // Record some sessions
      agent1.recordSession(80);
      agent1.recordSession(85);
      agent1.recordSession(90);
      
      // Export data
      const exportedData = agent1.exportData();
      expect(exportedData.sessionsCompleted).toBe(3);
      expect(exportedData.sessionHistory).toEqual([80, 85, 90]);
      
      // Create new agent and import data
      const agent2 = new PracticeAgent();
      agent2.resetStats(); // Clear any existing data
      
      const imported = agent2.importData(exportedData);
      expect(imported).toBe(true);
      
      const stats = agent2.getStats();
      expect(stats.sessionsCompleted).toBe(3);
      expect(stats.recentScores).toEqual([80, 85, 90]);
    });
  });

  describe('Progressive difficulty and recommendations', () => {
    it('should provide appropriate recommendations based on performance', () => {
      const practiceAgent = new PracticeAgent();
      const feedbackAgent = new FeedbackAgent();
      
      // Simulate low performance
      [40, 45, 50].forEach(score => practiceAgent.recordSession(score));
      
      let recommendations = practiceAgent.getPersonalizedRecommendations();
      expect(recommendations.some(r => r.includes('slowly'))).toBe(true);
      
      let difficulty = practiceAgent.getRecommendedDifficulty();
      expect(difficulty).toBeLessThan(3); // Easy difficulty
      
      // Simulate improvement
      [80, 85, 90, 92, 95].forEach(score => practiceAgent.recordSession(score));
      
      recommendations = practiceAgent.getPersonalizedRecommendations();
      expect(recommendations.some(r => r.includes('progress') || r.includes('improved'))).toBe(true);
      
      difficulty = practiceAgent.getRecommendedDifficulty();
      expect(difficulty).toBeGreaterThan(6); // Hard difficulty
      
      // Test motivational messages
      const message = feedbackAgent.generateMotivationalMessage(95, [80, 85, 90]);
      expect(message.toLowerCase()).toMatch(/improvement|progress|great/);
    });
  });
});