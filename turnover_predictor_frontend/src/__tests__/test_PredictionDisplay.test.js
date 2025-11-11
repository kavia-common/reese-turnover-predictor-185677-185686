import { render, screen } from '@testing-library/react';
import PredictionDisplay from '../components/PredictionDisplay';

describe('PredictionDisplay', () => {
  test('shows loading state', () => {
    render(<PredictionDisplay loading={true} error={null} prediction={null} />);
    expect(screen.getByRole('status')).toHaveTextContent(/loading prediction/i);
  });

  test('shows error state', () => {
    render(<PredictionDisplay loading={false} error="Network error" prediction={null} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/network error/i);
  });

  test('shows empty state when no prediction', () => {
    render(<PredictionDisplay loading={false} error={null} prediction={null} />);
    expect(screen.getByText(/no prediction yet/i)).toBeInTheDocument();
  });

  test('shows prediction with confidence', () => {
    render(<PredictionDisplay loading={false} error={null} prediction={{ turnovers: 3, confidence: 0.82 }} />);
    expect(screen.getByText(/predicted turnovers:/i)).toHaveTextContent('3');
    expect(screen.getByText(/confidence:/i)).toHaveTextContent('82%');
  });
});
