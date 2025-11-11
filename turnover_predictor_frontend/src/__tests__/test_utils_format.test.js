import { formatGameLabel } from '../utils/format';

describe('formatGameLabel', () => {
  test('formats with locale date when ISO input', () => {
    const label = formatGameLabel({ opponent: 'Aces', date: '2025-01-15T00:00:00.000Z' });
    expect(label).toMatch(/vs Aces —/);
  });

  test('falls back to given date string when invalid', () => {
    const label = formatGameLabel({ opponent: 'Liberty', date: 'Jan 10, 2025' });
    expect(label).toBe('vs Liberty — Jan 10, 2025');
  });
});
