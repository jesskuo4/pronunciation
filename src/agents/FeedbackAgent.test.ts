/**
 * Tests for FeedbackAgent
 */

import { FeedbackAgent } from './FeedbackAgent';

describe('FeedbackAgent', () => {
  let agent: FeedbackAgent;

  beforeEach(() => {
    agent = new FeedbackAgent();
  });

  describe('generateFeedback', () => {
    it('should return an array of feedback strings', () => {
      const feedback = agent.generateFeedback('hello world', 'hello world', 90);
      expect(Array.isArray(feedback)).toBe(true);
      expect(feedback.length).toBeGreaterThan(0);
      feedback.forEach(item => {
        expect(typeof item).toBe('string');
        expect(item.length).toBeGreaterThan(0);
      });
    });

    it('should provide positive feedback for high scores', () => {
      const feedback = agent.generateFeedback('hello world', 'hello world', 95);
      const feedbackText = feedback.join(' ').toLowerCase();
      expect(feedbackText).toMatch(/excellent|outstanding|great/);
    });

    it('should provide encouraging feedback for low scores', () => {
      const feedback = agent.generateFeedback('hello world', 'hello world', 40);
      const feedbackText = feedback.join(' ').toLowerCase();
      expect(feedbackText).toMatch(/practice|improve|keep|don't give up/);
    });

    it('should provide technical feedback for length mismatches', () => {
      const feedback = agent.generateFeedback('hello', 'hello beautiful wonderful world', 70);
      const feedbackText = feedback.join(' ');
      expect(feedbackText).toMatch(/speak all the words|take your time/i);
    });

    it('should provide feedback for extra words', () => {
      const feedback = agent.generateFeedback('hello beautiful wonderful world today', 'hello world', 70);
      const feedbackText = feedback.join(' ');
      expect(feedbackText).toMatch(/avoid adding extra words|focus on speaking just/i);
    });

    it('should detect sound issues in feedback', () => {
      const feedback = agent.generateFeedback('dat is nice', 'that is nice', 80);
      const feedbackText = feedback.join(' ');
      expect(feedbackText).toMatch(/focus on these sounds.*th/i);
    });
  });

  describe('getLetterGrade', () => {
    it('should return correct letter grades', () => {
      expect(agent.getLetterGrade(97)).toBe('A+');
      expect(agent.getLetterGrade(90)).toBe('A-');
      expect(agent.getLetterGrade(85)).toBe('B'); // Adjusted based on actual boundaries (83-86 = B)
      expect(agent.getLetterGrade(75)).toBe('C'); // 73-76 = C based on actual boundaries
      expect(agent.getLetterGrade(65)).toBe('D');
      expect(agent.getLetterGrade(55)).toBe('F');
    });
  });

  describe('generateMotivationalMessage', () => {
    it('should provide welcome message for first session', () => {
      const message = agent.generateMotivationalMessage(80, []);
      expect(message.toLowerCase()).toMatch(/welcome|start building/);
    });

    it('should provide positive message for improvement', () => {
      const message = agent.generateMotivationalMessage(85, [70, 72, 75]);
      expect(message.toLowerCase()).toMatch(/improvement|progress|great/);
    });

    it('should provide steady progress message for slight improvement', () => {
      const message = agent.generateMotivationalMessage(77, [74, 75, 76]);
      expect(message.toLowerCase()).toMatch(/nice job|steadily improving/);
    });

    it('should provide encouraging message for stable performance', () => {
      const message = agent.generateMotivationalMessage(75, [74, 75, 76]);
      expect(message.toLowerCase()).toMatch(/consistent|daily practice/);
    });

    it('should provide supportive message for decline', () => {
      const message = agent.generateMotivationalMessage(70, [85, 83, 80]);
      expect(message.toLowerCase()).toMatch(/don't worry|long-term progress/);
    });

    it('should handle empty previous scores array', () => {
      const message = agent.generateMotivationalMessage(75, []);
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });
  });

  describe('getPracticeSuggestions', () => {
    it('should return an array of suggestions', () => {
      const suggestions = agent.getPracticeSuggestions(70, 5);
      expect(Array.isArray(suggestions)).toBe(true);
      suggestions.forEach(suggestion => {
        expect(typeof suggestion).toBe('string');
        expect(suggestion.length).toBeGreaterThan(0);
      });
    });

    it('should provide basic suggestions for low scores', () => {
      const suggestions = agent.getPracticeSuggestions(60, 3);
      const suggestionsText = suggestions.join(' ').toLowerCase();
      expect(suggestionsText).toMatch(/shorter.*simpler|practice reading aloud|record yourself/);
    });

    it('should provide intermediate suggestions for medium scores', () => {
      const suggestions = agent.getPracticeSuggestions(80, 5);
      const suggestionsText = suggestions.join(' ').toLowerCase();
      expect(suggestionsText).toMatch(/consistent pace|tongue twisters|problematic sounds/);
    });

    it('should provide advanced suggestions for high scores', () => {
      const suggestions = agent.getPracticeSuggestions(90, 4);
      const suggestionsText = suggestions.join(' ').toLowerCase();
      expect(suggestionsText).toMatch(/challenge yourself|complex texts|intonation|rhythm/);
    });

    it('should provide difficulty-specific suggestions for hard texts', () => {
      const suggestions = agent.getPracticeSuggestions(75, 8);
      const suggestionsText = suggestions.join(' ').toLowerCase();
      expect(suggestionsText).toMatch(/break down.*syllables|difficult sounds.*isolation/);
    });

    it('should not provide difficulty suggestions for easy texts', () => {
      const suggestions = agent.getPracticeSuggestions(75, 3);
      const suggestionsText = suggestions.join(' ').toLowerCase();
      expect(suggestionsText).not.toMatch(/syllables|isolation/);
    });
  });
});