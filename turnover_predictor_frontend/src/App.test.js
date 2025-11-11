import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders and toggles theme button', () => {
  render(<App />);
  const toggleBtn = screen.getByRole('button', { name: /switch to dark mode/i });
  expect(toggleBtn).toBeInTheDocument();

  fireEvent.click(toggleBtn);
  expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();

  // shows link as part of template
  expect(screen.getByText(/learn react/i)).toBeInTheDocument();
});
