// src/lib/apiClient.js
// Centralized API client for front‑end calls.
// Uses Vite's import.meta.env.VITE_API_URL as the base URL.
// Supports optional auth token injection (e.g., from Firebase Auth).

export async function apiFetch(path, options = {}) {
  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/*$/, ""); // ensure no trailing slash
  const url = `${baseUrl}/${path.replace(/^\//, "")}`;

  const headers = new Headers(options.headers || {});
  // If an auth token is provided, set Authorization header.
  if (options.authToken) {
    headers.set('Authorization', `Bearer ${options.authToken}`);
  }
  // Default content type for JSON bodies.
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    // Credentials needed for same‑origin cookies if any.
    credentials: options.credentials || 'same-origin'
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(`API request failed ${response.status}: ${errorText}`);
    error.status = response.status;
    throw error;
  }

  // Attempt to parse JSON, fallback to raw text.
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}
