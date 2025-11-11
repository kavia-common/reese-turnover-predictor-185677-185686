//
// Centralized environment configuration and feature flags for the frontend.
// This helper reads environment variables exposed by CRA (prefixed with REACT_APP_)
// and produces a normalized configuration object for use across the app.
//

// PUBLIC_INTERFACE
export function getConfig() {
  /**
   * Returns normalized configuration for the frontend.
   * - baseUrl: string | null
   *   Resolved from REACT_APP_API_BASE or REACT_APP_BACKEND_URL (first non-empty).
   * - features: Record<string, boolean>
   *   Parsed from REACT_APP_FEATURE_FLAGS which may be:
   *     * JSON object string, e.g. {"MOCK_API": false, "SOME_FLAG": true}
   *     * comma/pipe/space separated list to enable flags, e.g. "FEATURE_X,FEATURE_Y"
   *   Additionally, derives default for MOCK_API:
   *     * If no baseUrl is provided, defaults MOCK_API to true unless explicitly set.
   * - logLevel: string
   *   From REACT_APP_LOG_LEVEL, defaults to "info".
   */
  const env = (typeof process !== 'undefined' && process.env) ? process.env : {};

  // Resolve base URL from either REACT_APP_API_BASE or REACT_APP_BACKEND_URL
  const rawApiBase = (env.REACT_APP_API_BASE || '').trim();
  const rawBackendUrl = (env.REACT_APP_BACKEND_URL || '').trim();
  const baseUrl = rawApiBase || rawBackendUrl || null;

  // Parse feature flags safely
  const rawFlags = (env.REACT_APP_FEATURE_FLAGS || '').trim();
  const features = safeParseFeatureFlags(rawFlags);

  // Default MOCK_API based on presence of a baseUrl, unless explicitly set
  if (typeof features.MOCK_API === 'undefined') {
    features.MOCK_API = baseUrl ? false : true;
  }

  // Log level with sensible default
  const logLevel = (env.REACT_APP_LOG_LEVEL || 'info').trim() || 'info';

  return {
    baseUrl,
    features,
    logLevel,
  };
}

/**
 * Safely parse feature flags that may be provided as JSON or as a delimited list.
 * Acceptable formats:
 * - JSON object: {"FLAG_A": true, "FLAG_B": false}
 * - Comma/pipe/space-separated: "FLAG_A,FLAG_B|FLAG_C FLAG_D"
 * The delimited form treats listed flags as enabled (true).
 */
function safeParseFeatureFlags(input) {
  const flags = {};

  if (!input) return flags;

  // Try JSON first
  try {
    const parsed = JSON.parse(input);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      // Normalize boolean-like strings to booleans
      for (const [key, val] of Object.entries(parsed)) {
        flags[String(key).trim()] = normalizeToBoolean(val);
      }
      return flags;
    }
  } catch {
    // Not JSON, fall through to delimited parsing
  }

  // Delimited parsing (commas, pipes, or whitespace)
  const parts = input
    .split(/[,|\s]+/)
    .map(s => s.trim())
    .filter(Boolean);

  for (const key of parts) {
    flags[key] = true;
  }

  return flags;
}

function normalizeToBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'y', 'on'].includes(v)) return true;
    if (['false', '0', 'no', 'n', 'off'].includes(v)) return false;
  }
  // Fallback: truthy evaluation
  return !!value;
}
