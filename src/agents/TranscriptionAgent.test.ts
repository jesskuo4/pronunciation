/**
 * Tests for TranscriptionAgent
 */

import { TranscriptionAgent } from './TranscriptionAgent';

// Speech Recognition API is mocked globally in setupTests.ts

describe('TranscriptionAgent', () => {
  let agent: TranscriptionAgent;
  let mockSpeechRecognition: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Create agent and get its internal recognition instance for testing
    agent = new TranscriptionAgent();
    // Access the internal recognition object that was created
    mockSpeechRecognition = (agent as any).recognition;
  });

  describe('constructor', () => {
    it('should initialize without errors', () => {
      expect(agent).toBeInstanceOf(TranscriptionAgent);
    });
  });

  describe('isSupported', () => {
    it('should return true when speech recognition is available', () => {
      expect(agent.isSupported()).toBe(true);
    });

    it('should return false when speech recognition is not available', () => {
      // Temporarily remove the mock
      const originalWebkit = window.webkitSpeechRecognition;
      const originalSpeech = (window as any).SpeechRecognition;
      
      delete (window as any).webkitSpeechRecognition;
      delete (window as any).SpeechRecognition;
      
      const unsupportedAgent = new TranscriptionAgent();
      expect(unsupportedAgent.isSupported()).toBe(false);
      
      // Restore the mocks
      (window as any).webkitSpeechRecognition = originalWebkit;
      (window as any).SpeechRecognition = originalSpeech;
    });
  });

  describe('transcribeAudio', () => {
    it('should return a promise', async () => {
      const audioBlob = new Blob(['test'], { type: 'audio/wav' });
      const result = agent.transcribeAudio(audioBlob);
      expect(result).toBeInstanceOf(Promise);
      
      // Wait for the promise to resolve
      const transcription = await result;
      expect(typeof transcription).toBe('string');
    });

    it('should return simulated transcription for different audio sizes', async () => {
      // Small audio blob
      const smallBlob = new Blob(['x'.repeat(1000)], { type: 'audio/wav' });
      const smallTranscription = await agent.transcribeAudio(smallBlob);
      expect(smallTranscription).toContain('The quick brown fox jumps');
      
      // Medium audio blob
      const mediumBlob = new Blob(['x'.repeat(10000)], { type: 'audio/wav' });
      const mediumTranscription = await agent.transcribeAudio(mediumBlob);
      expect(mediumTranscription.length).toBeGreaterThan(smallTranscription.length);
      
      // Large audio blob
      const largeBlob = new Blob(['x'.repeat(20000)], { type: 'audio/wav' });
      const largeTranscription = await agent.transcribeAudio(largeBlob);
      expect(largeTranscription.length).toBeGreaterThan(mediumTranscription.length);
    });

    it('should handle empty audio blob', async () => {
      const emptyBlob = new Blob([], { type: 'audio/wav' });
      const transcription = await agent.transcribeAudio(emptyBlob);
      expect(typeof transcription).toBe('string');
      expect(transcription.length).toBeGreaterThan(0);
    });
  });

  describe('startLiveRecognition', () => {
    it('should return a promise', async () => {
      const result = agent.startLiveRecognition();
      expect(result).toBeInstanceOf(Promise);
      
      // Start the recognition to satisfy the promise
      mockSpeechRecognition.start.mockImplementation(() => {
        // Simulate immediate end
        setTimeout(() => {
          if (mockSpeechRecognition.onend) {
            mockSpeechRecognition.onend();
          }
        }, 10);
      });
      
      await expect(result).resolves.toBeDefined();
    });

    it('should start speech recognition when supported', () => {
      agent.startLiveRecognition();
      expect(mockSpeechRecognition.start).toHaveBeenCalled();
    });

    it('should reject when not supported', async () => {
      // Create agent without speech recognition support
      const originalWebkit = window.webkitSpeechRecognition;
      delete (window as any).webkitSpeechRecognition;
      delete (window as any).SpeechRecognition;
      
      const unsupportedAgent = new TranscriptionAgent();
      
      await expect(unsupportedAgent.startLiveRecognition()).rejects.toThrow('Speech recognition not supported');
      
      // Restore mock
      (window as any).webkitSpeechRecognition = originalWebkit;
    });
  });

  describe('stopRecognition', () => {
    it('should stop speech recognition when active', () => {
      agent.startLiveRecognition();
      agent.stopRecognition();
      
      expect(mockSpeechRecognition.stop).toHaveBeenCalled();
    });

    it('should handle stopping when not active', () => {
      // Mock the stop method to avoid errors
      mockSpeechRecognition.stop = jest.fn();
      expect(() => agent.stopRecognition()).not.toThrow();
    });
  });

  describe('getConfidenceScore', () => {
    it('should return a confidence score between 0 and 1', () => {
      const confidence = agent.getConfidenceScore();
      expect(confidence).toBeGreaterThanOrEqual(0);
      expect(confidence).toBeLessThanOrEqual(1);
    });

    it('should return a number', () => {
      const confidence = agent.getConfidenceScore();
      expect(typeof confidence).toBe('number');
    });
  });

  describe('error handling', () => {
    it('should handle speech recognition errors gracefully', async () => {
      const recognitionPromise = agent.startLiveRecognition();
      
      // Simulate an error
      if (mockSpeechRecognition.onerror) {
        const errorEvent = { error: 'network', message: 'Network error' };
        setTimeout(() => mockSpeechRecognition.onerror(errorEvent), 10);
      }
      
      await expect(recognitionPromise).rejects.toThrow();
      
      // The agent should handle this gracefully
      mockSpeechRecognition.stop = jest.fn();
      expect(() => agent.stopRecognition()).not.toThrow();
    });
  });
});