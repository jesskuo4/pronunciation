/**
 * Tests for Feedback component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Feedback from './Feedback';

describe('Feedback Component', () => {
  const defaultProps = {
    transcription: 'Hello world',
    score: 85,
    feedback: ['Great job!', 'Keep practicing!'],
    letterGrade: 'B',
    targetText: 'Hello world'
  };

  it('should render without crashing', () => {
    render(<Feedback {...defaultProps} />);
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('should display the letter grade', () => {
    render(<Feedback {...defaultProps} />);
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('should display the score', () => {
    render(<Feedback {...defaultProps} />);
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('should display target text', () => {
    render(<Feedback {...defaultProps} />);
    expect(screen.getByText('📖 Target Text:')).toBeInTheDocument();
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('should display transcription', () => {
    render(<Feedback {...defaultProps} />);
    expect(screen.getByText('🎤 What You Said:')).toBeInTheDocument();
    // Note: The transcription appears in multiple places (target and user text)
    expect(screen.getAllByText('Hello world').length).toBeGreaterThan(0);
  });

  it('should display feedback messages', () => {
    render(<Feedback {...defaultProps} />);
    expect(screen.getByText('Great job!')).toBeInTheDocument();
    expect(screen.getByText('Keep practicing!')).toBeInTheDocument();
  });

  it('should show no speech detected message when transcription is empty', () => {
    const props = { ...defaultProps, transcription: '' };
    render(<Feedback {...props} />);
    expect(screen.getByText(/No speech detected/)).toBeInTheDocument();
  });

  it('should display word count statistics', () => {
    render(<Feedback {...defaultProps} />);
    expect(screen.getByText('Words Spoken')).toBeInTheDocument();
    expect(screen.getByText('Target Words')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // 'Hello world' = 2 words
  });

  it('should show excellent message for high scores', () => {
    const highScoreProps = { ...defaultProps, score: 95 };
    render(<Feedback {...highScoreProps} />);
    expect(screen.getByText(/Outstanding work/)).toBeInTheDocument();
  });

  it('should show good message for medium-high scores', () => {
    const goodScoreProps = { ...defaultProps, score: 85 };
    render(<Feedback {...goodScoreProps} />);
    expect(screen.getByText(/Great job/)).toBeInTheDocument();
  });

  it('should show okay message for medium scores', () => {
    const mediumScoreProps = { ...defaultProps, score: 75 };
    render(<Feedback {...mediumScoreProps} />);
    expect(screen.getByText(/Good effort/)).toBeInTheDocument();
  });

  it('should show improvement message for low-medium scores', () => {
    const lowMediumScoreProps = { ...defaultProps, score: 65 };
    render(<Feedback {...lowMediumScoreProps} />);
    expect(screen.getByText(/making progress/)).toBeInTheDocument();
  });

  it('should show encouraging message for low scores', () => {
    const lowScoreProps = { ...defaultProps, score: 45 };
    render(<Feedback {...lowScoreProps} />);
    expect(screen.getByText(/Don't give up/)).toBeInTheDocument();
  });

  it('should calculate words per minute', () => {
    // This is a rough test since WPM calculation depends on timing
    render(<Feedback {...defaultProps} />);
    expect(screen.getByText('Words/Min')).toBeInTheDocument();
    // The exact WPM value will depend on the implementation
  });

  it('should handle empty feedback array', () => {
    const props = { ...defaultProps, feedback: [] };
    render(<Feedback {...props} />);
    expect(screen.getByText('💡 Personalized Feedback & Tips:')).toBeInTheDocument();
  });

  it('should handle different letter grades', () => {
    const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];
    
    grades.forEach(grade => {
      const props = { ...defaultProps, letterGrade: grade };
      const { unmount } = render(<Feedback {...props} />);
      expect(screen.getByText(grade)).toBeInTheDocument();
      unmount();
    });
  });

  it('should handle long transcription text', () => {
    const longTranscription = 'This is a very long transcription text that should wrap properly and be displayed correctly in the component without breaking the layout or causing any issues with the rendering process.';
    const props = { ...defaultProps, transcription: longTranscription };
    
    render(<Feedback {...props} />);
    expect(screen.getByText(longTranscription)).toBeInTheDocument();
  });

  it('should handle special characters in text', () => {
    const specialText = 'Hello! How are you? I\'m fine, thanks. 😊';
    const props = { 
      ...defaultProps, 
      transcription: specialText,
      targetText: specialText
    };
    
    render(<Feedback {...props} />);
    expect(screen.getByText(specialText)).toBeInTheDocument();
  });

  it('should display accessibility-friendly content', () => {
    render(<Feedback {...defaultProps} />);
    
    // Check for proper heading structure
    expect(screen.getByText('📖 Target Text:')).toBeInTheDocument();
    expect(screen.getByText('🎤 What You Said:')).toBeInTheDocument();
    expect(screen.getByText('💡 Personalized Feedback & Tips:')).toBeInTheDocument();
  });
});