import React from 'react';
import PropTypes from 'prop-types';

/**
 * PUBLIC_INTERFACE
 * GameDropdown - Renders a dropdown to select an upcoming 2025 game.
 * Props:
 * - games: Array<{ id: string|number, label: string }>
 * - selectedGameId: string|number|null
 * - onChange: function(gameId)
 * - disabled: boolean (optional)
 */
export default function GameDropdown({ games, selectedGameId, onChange, disabled = false }) {
  return (
    <div>
      <label htmlFor="game-select" className="sr-only">Select upcoming 2025 game</label>
      <select
        id="game-select"
        className="select"
        aria-label="Select upcoming 2025 game"
        value={selectedGameId ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="" disabled>
          Select a 2025 game
        </option>
        {games.map((g) => (
          <option key={g.id} value={g.id}>
            {g.label}
          </option>
        ))}
      </select>
    </div>
  );
}

GameDropdown.propTypes = {
  games: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedGameId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
