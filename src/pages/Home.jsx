import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import SearchBar from '../components/SearchBar';
import GameSection from '../components/GameSection';
import PlayerSection from '../components/PlayerSection';
import HowItWorks from '../components/HowItWorks';
import CTA from '../components/CTA';

import { fetchJson } from '../services/api';

export default function Home() {
  const [games, setGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

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
