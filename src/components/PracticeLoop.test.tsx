/**
 * Tests for PracticeLoop component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PracticeLoop from './PracticeLoop';

// Mock the PronCoachAgent
jest.mock('../agents/PronCoachAgent', () => {
  return {
    PronCoachAgent: jest.fn().mockImplementation(() => ({
      startPracticeSession: jest.fn(() => 'Hello world test phrase'),
      processRecording: jest.fn(() => Promise.resolve({
        transcription: 'Hello world test phrase',
        score: 85,
        feedback: ['Great job!', 'Keep practicing!'],
        letterGrade: 'B'
      })),
      recordPracticeSession: jest.fn(),
    })),
  };
});

// Mock the Recorder component
jest.mock('./Recorder', () => {
  return function MockRecorder({ onRecordingComplete, onRecordingStateChange, disabled, maxDuration }: any) {
    return (
      <div data-testid="recorder">
        <button 
          data-testid="start-recording"
          onClick={() => {
            onRecordingStateChange(true);
            // Simulate recording completion after short delay
            setTimeout(() => {
              const mockBlob = new Blob(['test'], { type: 'audio/wav' });
              onRecordingComplete(mockBlob);
              onRecordingStateChange(false);
            }, 100);
          }}
          disabled={disabled}
        >
          Start Recording
        </button>
        <span data-testid="max-duration">{maxDuration}</span>
      </div>
    );
  };
});

// Mock the Feedback component
jest.mock('./Feedback', () => {
  return function MockFeedback({ transcription, score, feedback, letterGrade, targetText }: any) {
    return (
      <div data-testid="feedback">
        <div data-testid="feedback-score">{score}</div>
        <div data-testid="feedback-grade">{letterGrade}</div>
        <div data-testid="feedback-transcription">{transcription}</div>
        <div data-testid="feedback-target">{targetText}</div>
        {feedback.map((item: string, index: number) => (
          <div key={index} data-testid={`feedback-item-${index}`}>{item}</div>
        ))}
      </div>
    );
  };
});

describe('PracticeLoop Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<PracticeLoop />);
    expect(screen.getByText('🎯 Pronunciation Practice')).toBeInTheDocument();
  });

  it('should display welcome message initially', () => {
    render(<PracticeLoop />);
    expect(screen.getByText(/Welcome to Pronunciation Coach/)).toBeInTheDocument();
    expect(screen.getByText('Start Practice')).toBeInTheDocument();
  });

  it('should start a practice session when Start Practice is clicked', async () => {
    render(<PracticeLoop />);
    
    const startButton = screen.getByText('Start Practice');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText('Hello world test phrase')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Start reading now/)).toBeInTheDocument();
    expect(screen.getByTestId('recorder')).toBeInTheDocument();
  });

  it('should display timer during practice session', async () => {
    render(<PracticeLoop />);
    
    fireEvent.click(screen.getByText('Start Practice'));
    
    await waitFor(() => {
      expect(screen.getByText(/You have \d+ seconds/)).toBeInTheDocument();
    });
  });

  it('should show loading state during recording processing', async () => {
    render(<PracticeLoop />);
    
    // Start practice session
    fireEvent.click(screen.getByText('Start Practice'));
    
    await waitFor(() => {
      expect(screen.getByTestId('start-recording')).toBeInTheDocument();
    });
    
    // Start recording
    fireEvent.click(screen.getByTestId('start-recording'));
    
    await waitFor(() => {
      expect(screen.getByText('🔄 Analyzing your pronunciation...')).toBeInTheDocument();
    });
  });

  it('should display feedback after recording is processed', async () => {
    render(<PracticeLoop />);
    
    // Start practice session
    fireEvent.click(screen.getByText('Start Practice'));
    
    await waitFor(() => {
      expect(screen.getByTestId('start-recording')).toBeInTheDocument();
    });
    
    // Start recording
    fireEvent.click(screen.getByTestId('start-recording'));
    
    // Wait for feedback to appear
    await waitFor(() => {
      expect(screen.getByTestId('feedback')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    expect(screen.getByTestId('feedback-score')).toHaveTextContent('85');
    expect(screen.getByTestId('feedback-grade')).toHaveTextContent('B');
    expect(screen.getByTestId('feedback-item-0')).toHaveTextContent('Great job!');
  });

  it('should allow starting a new session after completing one', async () => {
    render(<PracticeLoop />);
    
    // Complete a session
    fireEvent.click(screen.getByText('Start Practice'));
    
    await waitFor(() => {
      expect(screen.getByTestId('start-recording')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('start-recording'));
    
    await waitFor(() => {
      expect(screen.getByTestId('feedback')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Should show option to start new session
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Start Practice')).toBeInTheDocument();
  });

  it('should handle recording state changes', async () => {
    render(<PracticeLoop />);
    
    // Start practice session
    fireEvent.click(screen.getByText('Start Practice'));
    
    await waitFor(() => {
      expect(screen.getByTestId('start-recording')).toBeInTheDocument();
    });
    
    // The recording state should be managed properly
    expect(screen.getByTestId('start-recording')).not.toBeDisabled();
  });

  it('should display correct max duration for recorder', async () => {
    render(<PracticeLoop />);
    
    fireEvent.click(screen.getByText('Start Practice'));
    
    await waitFor(() => {
      expect(screen.getByTestId('max-duration')).toHaveTextContent('30');
    });
  });

  it('should reset session state when starting new practice', async () => {
    render(<PracticeLoop />);
    
    // Complete first session
    fireEvent.click(screen.getByText('Start Practice'));
    
    await waitFor(() => {
      expect(screen.getByTestId('start-recording')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('start-recording'));
    
    await waitFor(() => {
      expect(screen.getByTestId('feedback')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Start new session
    fireEvent.click(screen.getByText('Start Practice'));
    
    await waitFor(() => {
      // Feedback should be cleared
      expect(screen.queryByTestId('feedback')).not.toBeInTheDocument();
      // Timer should be reset
      expect(screen.getByText(/You have \d+ seconds/)).toBeInTheDocument();
    });
  });

  it('should handle errors gracefully', async () => {
    // Mock an error in processing
    const mockAgent = require('../agents/PronCoachAgent').PronCoachAgent;
    mockAgent.mockImplementation(() => ({
      startPracticeSession: jest.fn(() => 'Test phrase'),
      processRecording: jest.fn(() => Promise.reject(new Error('Processing failed'))),
      recordPracticeSession: jest.fn(),
    }));
    
    render(<PracticeLoop />);
    
    fireEvent.click(screen.getByText('Start Practice'));
    
    await waitFor(() => {
      expect(screen.getByTestId('start-recording')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('start-recording'));
    
    // Should handle error gracefully without crashing
    await waitFor(() => {
      // The component should still be functional
      expect(screen.getByText('Start Practice')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should provide accessible content', () => {
    render(<PracticeLoop />);
    
    // Check for proper heading
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('🎯 Pronunciation Practice');
    
    // Check for proper button
    expect(screen.getByRole('button', { name: /Start Practice/i })).toBeInTheDocument();
  });
});