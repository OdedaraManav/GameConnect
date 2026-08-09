import React, { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, RotateCcw, Frown, Star, Filter, X, Check, Loader2, AlertCircle } from 'lucide-react';
import GameCard from '../components/GameCard';
import { fetchJson } from '../services/api';

// Available filter choices
const GENRES = [
  'Action',
  'RPG',
  'FPS',
  'Adventure',
  'Horror',
  'Racing',
  'Battle Royale',
  'Sandbox'
];

const PLATFORMS = [
  'PC',
  'PS5',
  'Xbox',
  'Mobile',
  'Switch'
];

const RATINGS = [
  { label: 'All Ratings', value: 0 },
  { label: '4.5★ & above', value: 4.5 },
  { label: '4.0★ & above', value: 4.0 },
  { label: '3.5★ & above', value: 3.5 }
];

const SORT_OPTIONS = [
  { label: 'Highest Rated', value: 'rating-desc' },
  { label: 'Lowest Rated', value: 'rating-asc' },
  { label: 'A-Z (Name)', value: 'name-asc' },
  { label: 'Z-A (Name)', value: 'name-desc' }
];

export default function Games() {
  // State for fetched games, loading, and error
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for search, multi-select genres & platforms, rating, and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortBy, setSortBy] = useState('rating-desc');
  
  // Mobile filter drawer state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Fetch games from Express backend GET /api/games
  const loadGamesFromBackend = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchJson('/games');
      setGames(data);
    } catch (err) {
      setError('Unable to load games. Please make sure the GameConnect server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGamesFromBackend();
  }, []);

  // Toggle multi-select genre helper
  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  // Toggle multi-select platform helper
  const togglePlatform = (platform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  // Reset all filters function
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedGenres([]);
    setSelectedPlatforms([]);
    setSelectedRating(0);
    setSortBy('rating-desc');
  };

  // Active filter count calculation
  const activeFiltersCount = (
    (searchQuery ? 1 : 0) +
    selectedGenres.length +
    selectedPlatforms.length +
    (selectedRating > 0 ? 1 : 0)
  );

  // Filter and sort games logic (Strict AND logic for multi-select genres & platforms)
  const filteredAndSortedGames = useMemo(() => {
    return games.filter((game) => {
      // 1. Search Query Filter
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || (
        game.name.toLowerCase().includes(query) ||
        game.genre.toLowerCase().includes(query) ||
        game.platforms.some((platform) => platform.toLowerCase().includes(query))
      );

      // 2. Multi-Select Genre Filter (Strict AND logic: game must contain EVERY selected genre)
      const matchesGenre = selectedGenres.length === 0 || selectedGenres.every((g) =>
        game.genre.toLowerCase().includes(g.toLowerCase())
      );

      // 3. Multi-Select Platform Filter (Strict AND logic: game must support EVERY selected platform)
      const matchesPlatform = selectedPlatforms.length === 0 || selectedPlatforms.every((p) =>
        game.platforms.some((gp) => gp.toLowerCase() === p.toLowerCase())
      );

      // 4. Minimum Rating Filter
      const matchesRating = game.rating >= selectedRating;

      return matchesSearch && matchesGenre && matchesPlatform && matchesRating;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'rating-desc':
          return b.rating - a.rating;
        case 'rating-asc':
          return a.rating - b.rating;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }, [games, searchQuery, selectedGenres, selectedPlatforms, selectedRating, sortBy]);

  return (
    <div className="discovery-page">
      <div className="container">
        {/* Header Section */}
        <div className="discovery-header text-center">
          <span className="section-badge">EXPLORE LIBRARY</span>
          <h1 className="discovery-title gradient-text">
            DISCOVER YOUR NEXT GAME
          </h1>
          <p className="discovery-subtitle">
            Explore games based on genre, platform, rating, and your interests.
          </p>
        </div>

        {/* Top Control Bar: Search Input & Sort Dropdown */}
        <div className="discovery-top-bar glass-panel">
          <div className="discovery-search-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search by game title, genre, or platform..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="discovery-search-input"
            />
            {searchQuery && (
              <button 
                className="clear-search-btn" 
                onClick={() => setSearchQuery('')}
                aria-label="Clear search text"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="discovery-top-actions">
            {/* Mobile Filter Toggle Button */}
            <button 
              className="btn btn-secondary mobile-filter-toggle"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            >
              <SlidersHorizontal size={18} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="filter-badge">{activeFiltersCount}</span>
              )}
            </button>

            {/* Sort Selector */}
            <div className="sort-wrapper">
              <label htmlFor="sort-select" className="sort-label">Sort By:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Discovery Body: Sidebar + Grid */}
        <div className="discovery-layout">
          {/* Sidebar Filter Section */}
          <aside className={`filter-sidebar glass-panel ${isMobileFilterOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-header">
              <div className="sidebar-title-wrapper">
                <Filter size={18} className="icon-cyan" />
                <h2 className="sidebar-title">Filters</h2>
              </div>

              {/* Reset Button */}
              {activeFiltersCount > 0 && (
                <button className="reset-filters-btn" onClick={handleClearFilters}>
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
              )}

              {/* Close icon for mobile modal */}
              <button 
                className="mobile-close-sidebar" 
                onClick={() => setIsMobileFilterOpen(false)}
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            {/* Multi-Select Genre Filter Group */}
            <div className="filter-group">
              <div className="filter-group-header">
                <h3 className="filter-group-title">Genres</h3>
                {selectedGenres.length > 0 && (
                  <button className="clear-subfilter-btn" onClick={() => setSelectedGenres([])}>
                    Clear ({selectedGenres.length})
                  </button>
                )}
              </div>
              <div className="filter-options-list">
                <button
                  className={`filter-pill ${selectedGenres.length === 0 ? 'active' : ''}`}
                  onClick={() => setSelectedGenres([])}
                >
                  All Genres
                </button>
                {GENRES.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      className={`filter-pill ${isSelected ? 'active' : ''}`}
                      onClick={() => toggleGenre(genre)}
                    >
                      {isSelected && <Check size={12} className="check-icon" />}
                      <span>{genre}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Multi-Select Platform Filter Group */}
            <div className="filter-group">
              <div className="filter-group-header">
                <h3 className="filter-group-title">Platforms</h3>
                {selectedPlatforms.length > 0 && (
                  <button className="clear-subfilter-btn" onClick={() => setSelectedPlatforms([])}>
                    Clear ({selectedPlatforms.length})
                  </button>
                )}
              </div>
              <div className="filter-options-list">
                <button
                  className={`filter-pill ${selectedPlatforms.length === 0 ? 'active' : ''}`}
                  onClick={() => setSelectedPlatforms([])}
                >
                  All Platforms
                </button>
                {PLATFORMS.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform);
                  return (
                    <button
                      key={platform}
                      className={`filter-pill ${isSelected ? 'active' : ''}`}
                      onClick={() => togglePlatform(platform)}
                    >
                      {isSelected && <Check size={12} className="check-icon" />}
                      <span>{platform}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rating Filter Group */}
            <div className="filter-group">
              <h3 className="filter-group-title">Minimum Rating</h3>
              <div className="rating-options-list">
                {RATINGS.map((rating) => (
                  <button
                    key={rating.value}
                    className={`rating-pill ${selectedRating === rating.value ? 'active' : ''}`}
                    onClick={() => setSelectedRating(rating.value)}
                  >
                    <Star size={14} fill={selectedRating === rating.value ? '#00F2FE' : 'none'} />
                    <span>{rating.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Games Output Section */}
          <main className="discovery-grid-container">
            {/* Status bar: games count */}
            <div className="discovery-status-bar">
              <span className="results-count">
                Showing <strong className="highlight">{filteredAndSortedGames.length}</strong> {filteredAndSortedGames.length === 1 ? 'game' : 'games'}
              </span>

              {activeFiltersCount > 0 && (
                <button className="clear-all-link" onClick={handleClearFilters}>
                  Clear all filters ({activeFiltersCount})
                </button>
              )}
            </div>

            {/* Render Loading State, Error State, Games Grid OR Empty State */}
            {loading ? (
              <div className="loading-state glass-panel text-center">
                <Loader2 className="spinner-icon icon-cyan" size={40} />
                <p>Loading games from Express server...</p>
              </div>
            ) : error ? (
              <div className="error-state glass-panel text-center">
                <AlertCircle size={48} className="icon-pink margin-b" />
                <h3 className="error-title">Backend Connection Failed</h3>
                <p className="error-description">{error}</p>
                <button className="btn btn-primary margin-top" onClick={loadGamesFromBackend}>
                  <RotateCcw size={16} />
                  <span>Retry Connection</span>
                </button>
              </div>
            ) : filteredAndSortedGames.length > 0 ? (
              <div className="discovery-games-grid">
                {filteredAndSortedGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <div className="empty-results glass-panel">
                <div className="empty-icon-wrapper">
                  <Frown size={48} className="empty-icon" />
                </div>
                <h3 className="empty-title">No games found</h3>
                <p className="empty-description">
                  We couldn't find any games matching your current filter selection. Try adjusting your search query or clear selected genres/platforms.
                </p>
                <button className="btn btn-primary btn-clear-filters" onClick={handleClearFilters}>
                  <RotateCcw size={16} />
                  <span>Clear Filters</span>
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
