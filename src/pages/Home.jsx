import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import SearchBar from '../components/SearchBar';
import GameSection from '../components/GameSection';
import PlayerSection from '../components/PlayerSection';
import HowItWorks from '../components/HowItWorks';
import CTA from '../components/CTA';

import { fetchJson, getAcceptedFriendRequests, clearAcceptedFriendRequests } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, X } from 'lucide-react';

export default function Home() {
  const { token, isAuthenticated } = useAuth();
  const [games, setGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [unreadAcceptedFriends, setUnreadAcceptedFriends] = useState([]);

  useEffect(() => {
    async function loadGames() {
      try {
        const data = await fetchJson('/games');
        setGames(data);
      } catch (err) {
        console.error('Error loading games on home page:', err);
      }
    }
    loadGames();
  }, []);

  useEffect(() => {
    async function loadNotifications() {
      if (!token) {
        setUnreadAcceptedFriends([]);
        return;
      }
      try {
        const res = await getAcceptedFriendRequests(token);
        if (res && res.requests) {
          setUnreadAcceptedFriends(res.requests);
        } else {
          setUnreadAcceptedFriends([]);
        }
      } catch (err) {
        console.error('Error loading accepted friend notifications on home page:', err);
      }
    }
    loadNotifications();
  }, [token, isAuthenticated]);

  const handleDismissHomeNotification = async () => {
    setUnreadAcceptedFriends([]);
    try {
      await clearAcceptedFriendRequests(token);
    } catch (err) {
      console.error('Error clearing accepted friend notification:', err);
    }
  };

  // Filter games based on search query or selected tag
  const filteredGames = games.filter((game) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return (
      game.name.toLowerCase().includes(query) ||
      game.genre.toLowerCase().includes(query) ||
      game.platforms.some((p) => p.toLowerCase().includes(query))
    );
  });

  return (
    <>
      {/* Friend Request Acceptance Notification Banner */}
      {unreadAcceptedFriends.length > 0 && (
        <div className="container" style={{ marginTop: '1.25rem', marginBottom: '0.25rem' }}>
          <div
            data-testid="home-accepted-notification"
            className="glass-panel"
            style={{
              padding: '0.85rem 1.25rem',
              borderRadius: '12px',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.35)',
              color: '#4ade80',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              boxShadow: '0 4px 20px rgba(34, 197, 94, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle size={20} style={{ color: '#22c55e', flexShrink: 0 }} />
              <span style={{ fontSize: '0.925rem', fontWeight: 500, color: '#f8fafc' }}>
                <strong>{unreadAcceptedFriends.map(u => u.username).join(', ')}</strong> accepted your friend request.
              </span>
            </div>
            <button
              onClick={handleDismissHomeNotification}
              className="btn btn-secondary btn-sm"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                borderColor: 'rgba(34, 197, 94, 0.4)',
                color: '#4ade80',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                cursor: 'pointer'
              }}
            >
              <X size={14} /> Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <Hero />

      {/* Game Search Component */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
      />

      {/* Recommended Games Library */}
      <GameSection
        games={filteredGames}
        searchQuery={searchQuery}
      />

      {/* Squad Matching Highlight Section */}
      <PlayerSection />

      {/* How GameConnect Works */}
      <HowItWorks />

      {/* Conversion CTA */}
      <CTA />
    </>
  );
}
