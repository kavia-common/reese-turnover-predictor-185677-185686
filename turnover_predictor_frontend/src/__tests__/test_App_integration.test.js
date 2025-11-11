import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

// Mock the API service to ensure deterministic results and no real network usage
jest.mock('../services/api', () => ({
  getPrediction: jest.fn(),
}));

describe('App integration: select a 2025 game and view prediction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders real App, selects a game, shows loading then prediction', async () => {
    const { getPrediction } = require('../services/api');

    // Arrange: mock a deterministic prediction result
    getPrediction.mockResolvedValueOnce({ turnovers: 5, confidence: 0.9 });

    render(<App />);

    // App hero/title present
    expect(
      screen.getByText(/Angel Reese Turnover Predictor/i)
    ).toBeInTheDocument();

    // Find the dropdown and select a specific 2025 game option.
    const select = screen.getByLabelText(/select upcoming 2025 game/i);
    expect(select).toBeInTheDocument();

    // The App constructs options internally; pick one of the known IDs from App's initial list.
    // We don't need to assert the text here, just simulate selection to trigger the flow.
    fireEvent.change(select, { target: { value: 'g-sky-2025-01-21' } });

    // Loading state appears in PredictionDisplay
    expect(screen.getByText(/loading prediction/i)).toBeInTheDocument();

    // After the mocked promise resolves, the predicted turnovers should render
    await waitFor(() => {
      expect(screen.getByText(/predicted turnovers:/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/predicted turnovers:/i)).toHaveTextContent('5');

    // Optional: ensure our mocked function was called with the selected id
    expect(getPrediction).toHaveBeenCalledTimes(1);
    expect(getPrediction).toHaveBeenCalledWith(
      'g-sky-2025-01-21',
      expect.objectContaining({ timeoutMs: expect.any(Number) })
    );

    // Also verify status footer text switches from loading to ready/error as per App
    await waitFor(() => {
      // When not loading and no error, it should read "Ready."
      expect(screen.getByText(/ready\./i)).toBeInTheDocument();
    });
  });
});
