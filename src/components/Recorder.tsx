import React, { useState, useRef, useCallback } from 'react';
import './Components.css';

interface RecorderProps {
  onRecordingComplete: (audioBlob: Blob) => Promise<void>;
  onRecordingStateChange: (isRecording: boolean) => void;
  disabled?: boolean;
  maxDuration?: number; // in seconds
}

/**
 * Audio recording component that handles microphone input and audio capture
 * Provides start/stop recording functionality with visual feedback
 */
const Recorder: React.FC<RecorderProps> = ({
  onRecordingComplete,
  onRecordingStateChange,
  disabled = false,
  maxDuration = 30
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Request microphone permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;
      setHasPermission(true);
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setHasPermission(false);
      return false;
    }
  }, []);

  /**
   * Start recording audio
   */
  const startRecording = useCallback(async (): Promise<void> => {
    if (disabled) return;

    let permissionGranted = hasPermission;
    if (hasPermission === null) {
      permissionGranted = await requestPermission();
    }

    if (!permissionGranted || !streamRef.current) {
      alert('Microphone access is required to record your pronunciation.');
      return;
    }

    // Clear previous recording
    audioChunksRef.current = [];
    
    // Create MediaRecorder
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
    });
    mediaRecorderRef.current = mediaRecorder;

    // Handle data available
    mediaRecorder.ondataavailable = (event: any) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    // Handle recording stop
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { 
        type: mediaRecorder.mimeType 
      });
      
      if (audioBlob.size > 0) {
        await onRecordingComplete(audioBlob);
      }
      
      setRecordingTime(0);
    };

    // Start recording
    mediaRecorder.start(100); // Collect data every 100ms
    setIsRecording(true);
    onRecordingStateChange(true);
    setRecordingTime(0);

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        const newTime = prev + 1;
        if (newTime >= maxDuration) {
          // Stop recording when max duration reached
          if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            onRecordingStateChange(false);
            
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          }
        }
        return newTime;
      });
    }, 1000);
  }, [hasPermission, requestPermission, disabled, maxDuration, onRecordingComplete, onRecordingStateChange, isRecording]);

  /**
   * Stop recording audio
   */
  const stopRecording = useCallback((): void => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      onRecordingStateChange(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording, onRecordingStateChange]);

  /**
   * Format recording time display
   */
  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Clean up resources
   */
  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="recorder">
      <div className="recorder-controls">
        {hasPermission === null && (
          <div className="permission-request">
            <p>🎤 Click to allow microphone access</p>
            <button 
              className="button primary" 
              onClick={requestPermission}
              disabled={disabled}
            >
              Allow Microphone
            </button>
          </div>
        )}

        {hasPermission === false && (
          <div className="permission-denied">
            <p>❌ Microphone access denied</p>
            <p>Please allow microphone access to record your pronunciation.</p>
            <button 
              className="button" 
              onClick={requestPermission}
              disabled={disabled}
            >
              Try Again
            </button>
          </div>
        )}

        {hasPermission === true && (
          <div className="recording-controls">
            {!isRecording ? (
              <button
                className="button primary record-button"
                onClick={startRecording}
                disabled={disabled}
              >
                🎤 Start Recording
              </button>
            ) : (
              <div className="recording-active">
                <button
                  className="button danger stop-button"
                  onClick={stopRecording}
                  disabled={disabled}
                >
                  ⏹️ Stop Recording
                </button>
                <div className="recording-indicator">
                  <div className="recording-dot"></div>
                  <span className="recording-time">
                    {formatRecordingTime(recordingTime)} / {formatRecordingTime(maxDuration)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recorder;