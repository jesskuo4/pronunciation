/**
 * Tests for PracticeAgent
 */

import { PracticeAgent } from './PracticeAgent';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('PracticeAgent', () => {
  let agent: PracticeAgent;

  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    agent = new PracticeAgent();
  });

  describe('generatePracticeText', () => {
    it('should return a non-empty string', () => {
      const text = agent.generatePracticeText();
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(0);
    });

    it('should return different texts on multiple calls (statistically)', () => {
      const texts = new Set();
      for (let i = 0; i < 20; i++) {
        texts.add(agent.generatePracticeText());
      }
      // Should get some variation
      expect(texts.size).toBeGreaterThan(1);
    });
  });

  describe('recordSession and getStats', () => {
    it('should start with empty statistics', () => {
      const stats = agent.getStats();
      expect(stats.sessionsCompleted).toBe(0);
      expect(stats.averageScore).toBe(0);
      expect(stats.recentScores).toEqual([]);
    });

    it('should record a session and update statistics', () => {
      agent.recordSession(85);
      const stats = agent.getStats();
      
      expect(stats.sessionsCompleted).toBe(1);
      expect(stats.averageScore).toBe(85);
      expect(stats.recentScores).toEqual([85]);
    });

    it('should calculate correct average for multiple sessions', () => {
      const scores = [70, 80, 90];
      scores.forEach(score => agent.recordSession(score));
      
      const stats = agent.getStats();
      expect(stats.sessionsCompleted).toBe(3);
      expect(stats.averageScore).toBe(80); // (70 + 80 + 90) / 3
      expect(stats.recentScores).toEqual(scores);
    });

    it('should keep only last 50 sessions', () => {
      // Add 55 sessions
      for (let i = 1; i <= 55; i++) {
        agent.recordSession(i);
      }
      
      const stats = agent.getStats();
      expect(stats.sessionsCompleted).toBe(50);
      expect(stats.recentScores).toHaveLength(10); // Last 10
      expect(stats.recentScores[0]).toBe(46); // Should start from 46 (55-10+1)
    });

    it('should keep only last 10 scores in recentScores', () => {
      for (let i = 1; i <= 15; i++) {
        agent.recordSession(i * 5);
      }
      
      const stats = agent.getStats();
      expect(stats.recentScores).toHaveLength(10);
      expect(stats.recentScores[0]).toBe(30); // (15-10+1) * 5 = 6 * 5 = 30
      expect(stats.recentScores[9]).toBe(75); // 15 * 5
    });
  });

  describe('getProgressTrend', () => {
    it('should return insufficient_data for less than 3 sessions', () => {
      agent.recordSession(80);
      agent.recordSession(85);
      
      const trend = agent.getProgressTrend();
      expect(trend.trend).toBe('insufficient_data');
      expect(trend.trendPercentage).toBe(0);
    });

    it('should detect improving trend', () => {
      // Add earlier sessions with lower scores
      [60, 65, 70, 75, 80].forEach(score => agent.recordSession(score));
      // Add recent sessions with higher scores
      [85, 90, 95, 92, 88].forEach(score => agent.recordSession(score));
      
      const trend = agent.getProgressTrend();
      expect(trend.trend).toBe('improving');
      expect(trend.trendPercentage).toBeGreaterThan(0);
    });

    it('should detect declining trend', () => {
      // Add earlier sessions with higher scores
      [90, 85, 88, 92, 95].forEach(score => agent.recordSession(score));
      // Add recent sessions with lower scores
      [70, 65, 60, 68, 72].forEach(score => agent.recordSession(score));
      
      const trend = agent.getProgressTrend();
      expect(trend.trend).toBe('declining');
      expect(trend.trendPercentage).toBeGreaterThan(0);
    });

    it('should detect stable trend', () => {
      // Add sessions with consistent scores
      [80, 81, 82, 79, 78].forEach(score => agent.recordSession(score));
      [81, 80, 82, 79, 81].forEach(score => agent.recordSession(score));
      
      const trend = agent.getProgressTrend();
      expect(trend.trend).toBe('stable');
    });
  });

  describe('getRecommendedDifficulty', () => {
    it('should return medium difficulty for new users', () => {
      expect(agent.getRecommendedDifficulty()).toBe(3);
    });

    it('should recommend easy difficulty for low scores', () => {
      [50, 55, 45].forEach(score => agent.recordSession(score));
      expect(agent.getRecommendedDifficulty()).toBe(1);
    });

    it('should recommend hard difficulty for high scores', () => {
      [95, 92, 88, 94, 96].forEach(score => agent.recordSession(score));
      expect(agent.getRecommendedDifficulty()).toBe(8);
    });

    it('should recommend medium difficulty for average scores', () => {
      [75, 70, 68, 72, 80].forEach(score => agent.recordSession(score));
      expect(agent.getRecommendedDifficulty()).toBe(4);
    });
  });

  describe('getPersonalizedRecommendations', () => {
    it('should provide starter recommendations for new users', () => {
      const recommendations = agent.getPersonalizedRecommendations();
      expect(recommendations.some(r => r.includes('daily 5-minute'))).toBe(true);
    });

    it('should provide low-score recommendations', () => {
      [40, 45, 50].forEach(score => agent.recordSession(score));
      const recommendations = agent.getPersonalizedRecommendations();
      expect(recommendations.some(r => r.includes('slowly and clearly'))).toBe(true);
    });

    it('should provide high-score recommendations', () => {
      [95, 92, 94, 96, 93].forEach(score => agent.recordSession(score));
      const recommendations = agent.getPersonalizedRecommendations();
      expect(recommendations.some(r => r.includes('complex texts'))).toBe(true);
    });

    it('should include trend-based recommendations for improvement', () => {
      [60, 65, 70, 75, 80].forEach(score => agent.recordSession(score));
      [85, 90, 88, 92, 87].forEach(score => agent.recordSession(score));
      
      const recommendations = agent.getPersonalizedRecommendations();
      expect(recommendations.some(r => r.includes('Great progress'))).toBe(true);
    });
  });

  describe('resetStats', () => {
    it('should clear all session history', () => {
      [80, 85, 90].forEach(score => agent.recordSession(score));
      
      agent.resetStats();
      const stats = agent.getStats();
      
      expect(stats.sessionsCompleted).toBe(0);
      expect(stats.averageScore).toBe(0);
      expect(stats.recentScores).toEqual([]);
    });
  });

  describe('exportData', () => {
    it('should export complete practice data', () => {
      [80, 85, 90].forEach(score => agent.recordSession(score));
      
      const exportedData = agent.exportData();
      
      expect(exportedData).toHaveProperty('sessionsCompleted', 3);
      expect(exportedData).toHaveProperty('sessionHistory');
      expect(exportedData).toHaveProperty('stats');
      expect(exportedData).toHaveProperty('trend');
      expect(exportedData).toHaveProperty('exportDate');
      expect(exportedData.sessionHistory).toEqual([80, 85, 90]);
    });
  });

  describe('importData', () => {
    it('should import valid data successfully', () => {
      const validData = { sessionHistory: [70, 80, 90] };
      const result = agent.importData(validData);
      
      expect(result).toBe(true);
      const stats = agent.getStats();
      expect(stats.sessionsCompleted).toBe(3);
      expect(stats.recentScores).toEqual([70, 80, 90]);
    });

    it('should reject invalid data', () => {
      const invalidData = { sessionHistory: ['invalid', 'data'] as any };
      const result = agent.importData(invalidData);
      
      expect(result).toBe(false);
    });

    it('should reject data with out-of-range scores', () => {
      const invalidData = { sessionHistory: [50, 150, -10] };
      const result = agent.importData(invalidData);
      
      expect(result).toBe(false);
    });

    it('should handle missing sessionHistory', () => {
      const invalidData = {} as any;
      const result = agent.importData(invalidData);
      
      expect(result).toBe(false);
    });
  });

  describe('localStorage integration', () => {
    it('should attempt to save stats when recording sessions', () => {
      agent.recordSession(85);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pronunciation_practice_stats',
        expect.stringContaining('sessionHistory')
      );
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      
      expect(() => agent.recordSession(85)).not.toThrow();
    });

    it('should load existing stats on construction', () => {
      const mockData = JSON.stringify({
        sessionHistory: [75, 80, 85],
        lastUpdated: new Date().toISOString()
      });
      
      localStorageMock.getItem.mockReturnValue(mockData);
      
      const newAgent = new PracticeAgent();
      const stats = newAgent.getStats();
      
      expect(stats.sessionsCompleted).toBe(3);
      expect(stats.recentScores).toEqual([75, 80, 85]);
    });
  });
});