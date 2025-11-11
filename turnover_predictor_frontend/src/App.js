import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import GameDropdown from './components/GameDropdown';
import PredictionDisplay from './components/PredictionDisplay';
import { getPrediction } from './services/api';
import { formatGameLabel } from './utils/format';

// PUBLIC_INTERFACE
function App() {
  // Theme toggle retained from template for basic theming
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  // Data/state for app
  const [games] = useState(() => {
    // Static upcoming 2025 games list for now; in future could be fetched.
    const base = [
      { id: 'g-lib-2025-01-10', opponent: 'Liberty', date: '2025-01-10T00:00:00.000Z' },
      { id: 'g-ace-2025-01-15', opponent: 'Aces', date: '2025-01-15T00:00:00.000Z' },
      { id: 'g-sky-2025-01-21', opponent: 'Sky', date: '2025-01-21T00:00:00.000Z' },
    ];
    return base.map((g) => ({ id: g.id, label: formatGameLabel(g) }));
  });
  const [selectedGameId, setSelectedGameId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);

  // Abort handling to cancel in-flight prediction when user changes quickly
  const abortRef = useRef(null);

  // Derive dropdown disabled state and hero copy
  const dropdownDisabled = loading;
  const title = 'Angel Reese Turnover Predictor';
  const subtitle = 'Select an upcoming 2025 game to view the predicted turnovers.';

  // PUBLIC_INTERFACE
  async function handleSelect(gameId) {
    setSelectedGameId(gameId);
    setPrediction(null);
    setError(null);

    if (!gameId) return;

    // cancel previous
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      // Minimal timeout handling is inside getPrediction; pass through timeout and signal if supported
      // Although getPrediction uses internal AbortController, we still surface user-abort via state guard below.
      const result = await getPrediction(gameId, { timeoutMs: 8000 });
      // If the current call was aborted by a newer selection, ignore setting state
      if (controller.signal.aborted) return;
      setPrediction(result);
    } catch (e) {
      if (controller.signal.aborted) return;
      setError(e?.message || 'Unable to fetch prediction');
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }

  // Small memo for games prop identity stability
  const gameOptions = useMemo(() => games, [games]);

  return (
    <div className="App">
      <header className="App-header" style={{ padding: 24 }}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>

        <div
          role="region"
          aria-label="Hero"
          style={{
            maxWidth: 720,
            width: '100%',
            margin: '0 auto',
            padding: '32px 20px',
            borderRadius: 16,
            background:
              'linear-gradient(135deg, rgba(37,99,235,0.10) 0%, rgba(249,250,251,1) 100%)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          }}
        >
          <h1 style={{ margin: 0, color: '#111827', fontSize: '1.75rem' }}>{title}</h1>
          <p style={{ marginTop: 8, color: 'rgba(17,24,39,0.8)', fontSize: '1rem' }}>
            {subtitle}
          </p>

          <div style={{ marginTop: 20 }}>
            <GameDropdown
              games={gameOptions}
              selectedGameId={selectedGameId}
              onChange={handleSelect}
              disabled={dropdownDisabled}
            />
          </div>

          <div
            style={{
              marginTop: 20,
              padding: 16,
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              backgroundColor: 'var(--bg-primary)',
              textAlign: 'left',
            }}
          >
            <div aria-live="polite" style={{ minHeight: 24 }}>
              <PredictionDisplay loading={loading} error={error} prediction={prediction} />
            </div>
          </div>

          <div
            role="status"
            aria-live="polite"
            style={{ marginTop: 8, fontSize: 12, color: 'rgba(17,24,39,0.6)' }}
          >
            {loading ? 'Fetching prediction…' : error ? 'There was an error.' : 'Ready.'}
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
