import { render, screen, fireEvent } from '@testing-library/react';
import GameDropdown from '../components/GameDropdown';

describe('GameDropdown', () => {
  const games = [
    { id: 'g1', label: 'vs Liberty — Jan 10, 2025' },
    { id: 'g2', label: 'vs Aces — Jan 15, 2025' },
  ];

  test('renders placeholder and options', () => {
    render(<GameDropdown games={games} selectedGameId={''} onChange={() => {}} />);
    const select = screen.getByLabelText(/select upcoming 2025 game/i);
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('');
    // Options presence
    expect(screen.getByText('Select a 2025 game')).toBeInTheDocument();
    expect(screen.getByText(/vs Liberty/i)).toBeInTheDocument();
    expect(screen.getByText(/vs Aces/i)).toBeInTheDocument();
  });

  test('calls onChange when selecting an option', () => {
    const onChange = jest.fn();
    render(<GameDropdown games={games} selectedGameId={''} onChange={onChange} />);
    const select = screen.getByLabelText(/select upcoming 2025 game/i);

    fireEvent.change(select, { target: { value: 'g2' } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('g2');
  });

  test('respects disabled state', () => {
    render(<GameDropdown games={games} selectedGameId={''} onChange={() => {}} disabled />);
    const select = screen.getByLabelText(/select upcoming 2025 game/i);
    expect(select).toBeDisabled();
  });
});
