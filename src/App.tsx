import React from 'react';
import PracticeLoop from './components/PracticeLoop';
import './App.css';

/**
 * Main App component for the Pronunciation Coach
 * Provides the overall layout and orchestrates the main practice interface
 */
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🎯 Pronunciation Coach</h1>
        <p>Improve your pronunciation with AI-powered feedback</p>
      </header>
      <main className="App-main">
        <PracticeLoop />
      </main>
    </div>
  );
}

export default App;