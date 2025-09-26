/**
 * Test setup file
 * This file is automatically loaded by Create React App before running tests
 */

import '@testing-library/jest-dom';

// Mock MediaRecorder API for tests
Object.defineProperty(window, 'MediaRecorder', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    ondataavailable: null,
    onstop: null,
    state: 'inactive',
    mimeType: 'audio/webm',
  })),
});

// Mock getUserMedia for tests
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    }),
  },
});

// Mock localStorage for tests that need it
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock URL.createObjectURL for tests
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(() => 'mock-url'),
});

// Mock URL.revokeObjectURL for tests
Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn(),
});

// Suppress console warnings in tests unless explicitly needed
const originalWarn = console.warn;
beforeEach(() => {
  console.warn = jest.fn();
});

afterEach(() => {
  console.warn = originalWarn;
});

// Mock Web Audio API if needed
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    createAnalyser: jest.fn(),
    createMediaStreamSource: jest.fn(),
    close: jest.fn(),
  })),
});

Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: window.AudioContext,
});

// Mock Web Speech API for tests
// Create constructor that always returns a fresh mock instance
// Use non-Jest functions to avoid clearAllMocks affecting them
const createSpeechRecognitionInstance = () => ({
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  maxAlternatives: 1,
  start: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  onresult: null,
  onerror: null,
  onend: null,
});

// Create constructor functions that won't be affected by clearAllMocks
const webkitSpeechRecognitionConstructor = function() {
  return createSpeechRecognitionInstance();
};

const SpeechRecognitionConstructor = function() {
  return createSpeechRecognitionInstance();
};

Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: webkitSpeechRecognitionConstructor,
  writable: true,
});

Object.defineProperty(window, 'SpeechRecognition', {
  value: SpeechRecognitionConstructor,
  writable: true,
});

// Mock window.alert for tests
Object.defineProperty(window, 'alert', {
  writable: true,
  value: jest.fn(),
});