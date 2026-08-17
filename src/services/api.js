// GameConnect Frontend API Service Configuration

export const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to handle JSON API requests with clean error throwing
export async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `API request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }

  return await response.json();
}

// Auth API Methods
export async function registerUser(username, email, password) {
  return fetchJson('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
}

export async function loginUser(email, password) {
  return fetchJson('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
}

export async function getAuthMe(token) {
  return fetchJson('/auth/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
}

export async function updateUserProfile(token, profileData) {
  return fetchJson('/auth/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
}

// User ↔ Game Relationship Methods
export async function addFavoriteGame(token, gameId) {
  return fetchJson('/user/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ gameId })
  });
}

export async function removeFavoriteGame(token, gameId) {
  return fetchJson(`/user/favorites/${gameId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
}

export async function addPlayingGame(token, gameId) {
  return fetchJson('/user/playing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ gameId })
  });
}

export async function removePlayingGame(token, gameId) {
  return fetchJson(`/user/playing/${gameId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
}

// UserGameProfile API Methods
export async function createUserGameProfile(token, profileData) {
  return fetchJson('/user/game-profiles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
}

export async function deleteUserGameProfile(token, profileId) {
  return fetchJson(`/user/game-profiles/${profileId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
}

// Social Foundation API Methods
export async function searchUsers(token, query) {
  return fetchJson(`/users/search?q=${encodeURIComponent(query)}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

export async function sendFriendRequest(token, receiverId) {
  return fetchJson('/social/requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ receiverId })
  });
}

export async function getIncomingFriendRequests(token) {
  return fetchJson('/social/requests/incoming', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

export async function getOutgoingFriendRequests(token) {
  return fetchJson('/social/requests/outgoing', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

export async function acceptFriendRequest(token, requestId) {
  return fetchJson(`/social/requests/${requestId}/accept`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

export async function rejectFriendRequest(token, requestId) {
  return fetchJson(`/social/requests/${requestId}/reject`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

export async function getFriendsList(token) {
  return fetchJson('/social/friends', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

export async function removeFriend(token, friendId) {
  return fetchJson(`/social/friends/${friendId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

export async function blockUser(token, targetUserId) {
  return fetchJson('/social/block', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ targetUserId })
  });
}

export async function unblockUser(token, targetUserId) {
  return fetchJson(`/social/block/${targetUserId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

export async function getBlockedUsers(token) {
  return fetchJson('/social/blocked', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

export async function getAcceptedFriendRequests(token) {
  return fetchJson('/social/requests/accepted', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

export async function clearAcceptedFriendRequests(token) {
  return fetchJson('/social/requests/accepted/clear', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
}




