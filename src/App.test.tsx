/**
 * Tests for App component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock the PracticeLoop component to avoid complex dependencies
jest.mock('./components/PracticeLoop', () => {
  return function MockPracticeLoop() {
    return <div data-testid="practice-loop">Practice Loop Component</div>;
  };
});

describe('App Component', () => {
  it('should render without crashing', () => {
    render(<App />);
    expect(screen.getByText('🎯 Pronunciation Coach')).toBeInTheDocument();
  });

  it('should display the main title', () => {
    render(<App />);
    expect(screen.getByText('🎯 Pronunciation Coach')).toBeInTheDocument();
  });

  it('should display the subtitle', () => {
    render(<App />);
    expect(screen.getByText('Improve your pronunciation with AI-powered feedback')).toBeInTheDocument();
  });

  it('should render the header section', () => {
    render(<App />);
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('App-header');
  });

  it('should render the main section', () => {
    render(<App />);
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('App-main');
  });

  it('should render the PracticeLoop component', () => {
    render(<App />);
    expect(screen.getByTestId('practice-loop')).toBeInTheDocument();
  });

  it('should have the correct structure', () => {
    render(<App />);
    
    // Check that the App div contains both header and main
    const appDiv = document.querySelector('.App');
    expect(appDiv).toBeInTheDocument();
    
    const header = screen.getByRole('banner');
    const main = screen.getByRole('main');
    
    expect(appDiv).toContainElement(header);
    expect(appDiv).toContainElement(main);
  });

  it('should have proper semantic HTML structure', () => {
    render(<App />);
    
    // Check for proper heading hierarchy
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('🎯 Pronunciation Coach');
    
    // Check for main content area
    expect(screen.getByRole('main')).toBeInTheDocument();
    
    // Check for header
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(<App />);
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    
    // Check for main landmark
    expect(screen.getByRole('main')).toBeInTheDocument();
    
    // Check for banner landmark
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});