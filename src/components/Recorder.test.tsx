/**
 * Tests for Recorder component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Recorder from './Recorder';

describe('Recorder Component', () => {
  const defaultProps = {
    onRecordingComplete: jest.fn(),
    onRecordingStateChange: jest.fn(),
    disabled: false,
    maxDuration: 30,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<Recorder {...defaultProps} />);
    expect(screen.getByText('🎤 Click to allow microphone access')).toBeInTheDocument();
  });

  it('should request microphone permission when Allow Microphone is clicked', async () => {
    render(<Recorder {...defaultProps} />);
    
    const allowButton = screen.getByText('Allow Microphone');
    fireEvent.click(allowButton);
    
    // Should call getUserMedia
    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
    });
  });

  it('should show recording controls after permission is granted', async () => {
    render(<Recorder {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Allow Microphone'));
    
    await waitFor(() => {
      expect(screen.getByText('🎤 Start Recording')).toBeInTheDocument();
    });
  });

  it('should handle permission denied', async () => {
    // Mock getUserMedia to reject
    (navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValue(new Error('Permission denied'));
    
    render(<Recorder {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Allow Microphone'));
    
    await waitFor(() => {
      expect(screen.getByText('❌ Microphone access denied')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should start recording when Start Recording is clicked', async () => {
    render(<Recorder {...defaultProps} />);
    
    // Grant permission first
    fireEvent.click(screen.getByText('Allow Microphone'));
    
    await waitFor(() => {
      expect(screen.getByText('🎤 Start Recording')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('🎤 Start Recording'));
    
    expect(defaultProps.onRecordingStateChange).toHaveBeenCalledWith(true);
    
    await waitFor(() => {
      expect(screen.getByText('⏹️ Stop Recording')).toBeInTheDocument();
    });
  });

  it('should show recording indicator when recording', async () => {
    render(<Recorder {...defaultProps} />);
    
    // Grant permission and start recording
    fireEvent.click(screen.getByText('Allow Microphone'));
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('🎤 Start Recording'));
    });
    
    await waitFor(() => {
      expect(screen.getByText(/0:00/)).toBeInTheDocument(); // Timer display
      expect(screen.getByText(/0:30/)).toBeInTheDocument(); // Max duration display
    });
  });

  it('should stop recording when Stop Recording is clicked', async () => {
    render(<Recorder {...defaultProps} />);
    
    // Grant permission and start recording
    fireEvent.click(screen.getByText('Allow Microphone'));
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('🎤 Start Recording'));
    });
    
    await waitFor(() => {
      expect(screen.getByText('⏹️ Stop Recording')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('⏹️ Stop Recording'));
    
    expect(defaultProps.onRecordingStateChange).toHaveBeenCalledWith(false);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Recorder {...defaultProps} disabled={true} />);
    
    expect(screen.getByText('Allow Microphone')).toBeDisabled();
  });

  it('should respect maxDuration prop', async () => {
    const shortDurationProps = { ...defaultProps, maxDuration: 5 };
    render(<Recorder {...shortDurationProps} />);
    
    fireEvent.click(screen.getByText('Allow Microphone'));
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('🎤 Start Recording'));
    });
    
    await waitFor(() => {
      expect(screen.getByText(/0:05/)).toBeInTheDocument(); // Should show max duration
    });
  });

  it('should handle MediaRecorder creation', async () => {
    render(<Recorder {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Allow Microphone'));
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('🎤 Start Recording'));
    });
    
    // MediaRecorder should be created (mocked in setupTests)
    expect(window.MediaRecorder).toHaveBeenCalled();
  });

  it('should clean up resources on unmount', async () => {
    const { unmount } = render(<Recorder {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Allow Microphone'));
    
    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
    });
    
    // Should not throw when unmounting
    expect(() => unmount()).not.toThrow();
  });

  it('should format recording time correctly', async () => {
    render(<Recorder {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Allow Microphone'));
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('🎤 Start Recording'));
    });
    
    await waitFor(() => {
      // Should show formatted time
      expect(screen.getByText(/\d+:\d{2}/)).toBeInTheDocument();
    });
  });

  it('should handle recording completion', async () => {
    render(<Recorder {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Allow Microphone'));
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('🎤 Start Recording'));
    });
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('⏹️ Stop Recording'));
    });
    
    // Should eventually call onRecordingComplete
    await waitFor(() => {
      expect(defaultProps.onRecordingComplete).toHaveBeenCalled();
    });
  });

  it('should provide accessible controls', async () => {
    render(<Recorder {...defaultProps} />);
    
    // Should have proper button roles
    expect(screen.getByRole('button', { name: /Allow Microphone/i })).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Allow Microphone'));
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Start Recording/i })).toBeInTheDocument();
    });
  });
});