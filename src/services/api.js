// GameConnect Frontend API Service Configuration

export const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to handle JSON API requests with clean error throwing
export async function fetchJson(endpoint) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `API request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }

  return await response.json();
}
