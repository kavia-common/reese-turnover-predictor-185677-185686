import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GameDropdown from '../components/GameDropdown';
import PredictionDisplay from '../components/PredictionDisplay';

// A small harness to simulate integration without real network.
// It mimics fetching a prediction when a game is selected.
function Harness() {
  const games = [
    { id: 'g1', label: 'vs Liberty — Jan 10, 2025' },
    { id: 'g2', label: 'vs Aces — Jan 15, 2025' },
  ];

  const [selected, setSelected] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [prediction, setPrediction] = React.useState(null);

  const fetchPrediction = async (gameId) => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      // Simulate network latency and deterministic response:
      await new Promise((res) => setTimeout(res, 50));
      // Fake model: turnovers based on id length
      const turnovers = gameId === 'g2' ? 4 : 3;
      setPrediction({ turnovers, confidence: 0.76 });
    } catch (e) {
      setError('Unable to fetch prediction');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id) => {
    setSelected(id);
    if (id) {
      fetchPrediction(id);
    }
  };

  return (
    <div>
      <h1 style={{ color: '#111827' }}>Angel Reese Turnover Predictor</h1>
      <GameDropdown games={games} selectedGameId={selected} onChange={handleSelect} />
      <div style={{ marginTop: 16 }}>
        <PredictionDisplay loading={loading} error={error} prediction={prediction} />
      </div>
    </div>
  );
}

describe('Integration: user selects game and sees prediction', () => {
  test('select flow renders predicted turnovers', async () => {
    render(<Harness />);

    // User sees title aligned with "Ocean Professional" simple copy
    expect(screen.getByText(/Angel Reese Turnover Predictor/i)).toBeInTheDocument();

    const select = screen.getByLabelText(/select upcoming 2025 game/i);
    expect(select).toBeInTheDocument();

    // Initially no prediction
    expect(screen.getByText(/no prediction yet/i)).toBeInTheDocument();

    // Select a game
    fireEvent.change(select, { target: { value: 'g2' } });

    // Loading appears
    expect(screen.getByText(/loading prediction/i)).toBeInTheDocument();

    // Then result appears
    await waitFor(() => {
      expect(screen.getByText(/predicted turnovers:/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/predicted turnovers:/i)).toHaveTextContent('4');
    expect(screen.getByText(/confidence:/i)).toHaveTextContent('%');
  });
});
