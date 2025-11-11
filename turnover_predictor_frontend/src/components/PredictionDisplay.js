import React from 'react';
import PropTypes from 'prop-types';

/**
 * PUBLIC_INTERFACE
 * PredictionDisplay - Shows loading, error, or a prediction result for turnovers.
 * Props:
 * - loading: boolean
 * - error: string|null
 * - prediction: { turnovers: number, confidence?: number } | null
 */
export default function PredictionDisplay({ loading, error, prediction }) {
  if (loading) {
    return (
      <div role="status" aria-live="polite" aria-busy="true">
        Loading prediction...
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" aria-live="assertive" style={{ color: '#EF4444' }}>
        Error: {error}
      </div>
    );
  }

  if (!prediction) {
    return <div aria-live="polite">No prediction yet.</div>;
  }

  return (
    <div aria-live="polite">
      <p>
        Predicted turnovers: <strong>{prediction.turnovers}</strong>
      </p>
      {typeof prediction.confidence === 'number' && (
        <p>Confidence: {(prediction.confidence * 100).toFixed(0)}%</p>
      )}
    </div>
  );
}

PredictionDisplay.propTypes = {
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  prediction: PropTypes.shape({
    turnovers: PropTypes.number.isRequired,
    confidence: PropTypes.number,
  }),
};
