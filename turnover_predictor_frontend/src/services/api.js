//
// API client for fetching predictions with environment-aware base URL and mock fallback.
// Uses REACT_APP_API_BASE or REACT_APP_BACKEND_URL via src/config/env.js.
// If no base URL is configured, returns a deterministic mock result with a small delay.
//
// Minimal timeout and basic error handling included.
//

import { getConfig } from '../config/env';

// INTERNAL: simple delay helper for mock fallback
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// INTERNAL: create a fetch with timeout using AbortController
async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { ...options, signal: controller.signal });
    return resp;
  } finally {
    clearTimeout(id);
  }
}

// PUBLIC_INTERFACE
export async function getPrediction(gameId, options = {}) {
  /**
   * Get a turnovers prediction for a given gameId.
   * Input:
   *  - gameId: string | number (required)
   *  - options: {
   *      timeoutMs?: number // optional request timeout in ms
   *    }
   * Behavior:
   *  - If REACT_APP_API_BASE or REACT_APP_BACKEND_URL is set (via getConfig().baseUrl),
   *    performs a GET request to `${baseUrl}/predict?gameId=...`.
   *  - Otherwise, falls back to a deterministic mock response with a small delay.
   * Returns:
   *  - { turnovers: number, confidence?: number }
   * Throws:
   *  - Error with a brief message when the request fails or response is invalid.
   */
  const cfg = getConfig();
  const timeoutMs = typeof options.timeoutMs === 'number' ? options.timeoutMs : 8000;

  // Mock fallback when no base URL is configured or MOCK_API feature flag is true
  if (!cfg.baseUrl || cfg.features.MOCK_API) {
    // Deterministic mock: base turnovers from simple hash of gameId
    const idStr = String(gameId ?? '');
    const hash = Array.from(idStr).reduce((acc, ch) => (acc + ch.charCodeAt(0)) % 7, 0);
    const turnovers = 2 + (hash % 5); // 2..6 range
    const confidence = 0.7 + ((hash % 3) * 0.05); // 0.70, 0.75, 0.80
    await sleep(120);
    return { turnovers, confidence: Math.min(0.95, confidence) };
  }

  // Real API path (GET /predict?gameId=...)
  const url = new URL('/predict', cfg.baseUrl);
  if (gameId !== undefined && gameId !== null) {
    url.searchParams.set('gameId', String(gameId));
  }

  try {
    const res = await fetchWithTimeout(url.toString(), { method: 'GET' }, timeoutMs);
    if (!res.ok) {
      throw new Error(`Request failed (${res.status})`);
    }
    const data = await res.json();

    // Validate expected shape minimally
    if (!data || typeof data.turnovers !== 'number') {
      throw new Error('Invalid response payload');
    }
    return {
      turnovers: data.turnovers,
      ...(typeof data.confidence === 'number' ? { confidence: data.confidence } : {}),
    };
  } catch (err) {
    // If network fails, optionally fallback to mock to keep UX flowing
    // but only when MOCK_API is enabled; otherwise surface the error.
    if (cfg.features.MOCK_API) {
      const idStr = String(gameId ?? '');
      const hash = Array.from(idStr).reduce((acc, ch) => (acc + ch.charCodeAt(0)) % 7, 0);
      const turnovers = 2 + (hash % 5);
      const confidence = 0.72;
      await sleep(120);
      return { turnovers, confidence };
    }
    // Normalize error message
    if (err && err.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw new Error(err && err.message ? err.message : 'Network error');
  }
}
