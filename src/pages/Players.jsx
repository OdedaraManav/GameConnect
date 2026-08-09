import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Filter, RotateCcw, Frown, Check, Monitor, Smartphone, Tv, Sparkles, MessageSquare, UserPlus, Eye, Loader2, AlertCircle } from 'lucide-react';
import { fetchJson } from '../services/api';

const SKILL_LEVELS = ['Any Skill', 'Beginner', 'Intermediate', 'Advanced', 'Competitive'];
const PLAYSTYLES = ['Any Playstyle', 'Casual', 'Competitive', 'Social', 'Explorer', 'Strategic'];
const AVAILABILITIES = ['Any Time', 'Morning', 'Afternoon', 'Evening', 'Night'];
const PLATFORMS = ['Any Platform', 'PC', 'PS5', 'Xbox', 'Mobile'];

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [gamesList, setGamesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedGame, setSelectedGame] = useState('Any Game');
  const [selectedSkill, setSelectedSkill] = useState('Any Skill');
  const [selectedPlaystyle, setSelectedPlaystyle] = useState('Any Playstyle');
  const [selectedAvailability, setSelectedAvailability] = useState('Any Time');
  const [selectedPlatform, setSelectedPlatform] = useState('Any Platform');

  // Fetch players and games list from Express backend
  const loadPlayersData = async () => {
    try {
      setLoading(true);
      setError(null);
      const playersData = await fetchJson('/players');
      setPlayers(playersData);

      const gamesData = await fetchJson('/games').catch(() => []);
      setGamesList(gamesData);
    } catch (err) {
      setError('Unable to load squad players. Please make sure the GameConnect server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayersData();
  }, []);

  // Reset filters handler
  const handleClearFilters = () => {
    setSelectedGame('Any Game');
    setSelectedSkill('Any Skill');
    setSelectedPlaystyle('Any Playstyle');
    setSelectedAvailability('Any Time');
    setSelectedPlatform('Any Platform');
  };

  const activeFiltersCount = (
    (selectedGame !== 'Any Game' ? 1 : 0) +
    (selectedSkill !== 'Any Skill' ? 1 : 0) +
    (selectedPlaystyle !== 'Any Playstyle' ? 1 : 0) +
    (selectedAvailability !== 'Any Time' ? 1 : 0) +
    (selectedPlatform !== 'Any Platform' ? 1 : 0)
  );

  // Filter player profiles
  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      // 1. Game Filter
      const matchesGame = selectedGame === 'Any Game' || 
        player.games.some((g) => g.toLowerCase().includes(selectedGame.toLowerCase()));

      // 2. Skill Level Filter
      const matchesSkill = selectedSkill === 'Any Skill' || 
        player.skillLevel.toLowerCase() === selectedSkill.toLowerCase();

      // 3. Playstyle Filter
      const matchesPlaystyle = selectedPlaystyle === 'Any Playstyle' || 
        player.playstyle.toLowerCase() === selectedPlaystyle.toLowerCase();

      // 4. Availability Filter
      const matchesAvailability = selectedAvailability === 'Any Time' || 
        player.availability.toLowerCase() === selectedAvailability.toLowerCase();

      // 5. Platform Filter
      const matchesPlatform = selectedPlatform === 'Any Platform' || 
        player.platform.toLowerCase() === selectedPlatform.toLowerCase();

      return matchesGame && matchesSkill && matchesPlaystyle && matchesAvailability && matchesPlatform;
    });
  }, [players, selectedGame, selectedSkill, selectedPlaystyle, selectedAvailability, selectedPlatform]);

  const renderPlatformIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'pc':
        return <Monitor size={14} key={platform} title="PC" />;
      case 'mobile':
        return <Smartphone size={14} key={platform} title="Mobile" />;
      default:
        return <Tv size={14} key={platform} title={platform} />;
    }
  };

  return (
    <div className="players-page">
      <div className="container">
        {/* Page Header */}
        <div className="players-header text-center">
          <span className="section-badge">SQUAD MATCHMAKER</span>
          <h1 className="players-title gradient-text">
            FIND YOUR NEXT SQUAD
          </h1>
          <p className="players-subtitle">
            Find gamers who match your games, skill, playstyle, and availability.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="players-filter-bar glass-panel">
          {/* Game Select */}
          <div className="filter-select-group">
            <label className="filter-select-label">Game</label>
            <select 
              value={selectedGame} 
              onChange={(e) => setSelectedGame(e.target.value)}
              className="player-filter-select"
            >
              <option value="Any Game">Any Game</option>
              {gamesList.map((g) => (
                <option key={g.id} value={g.name}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Skill Select */}
          <div className="filter-select-group">
            <label className="filter-select-label">Skill Level</label>
            <select 
              value={selectedSkill} 
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="player-filter-select"
            >
              {SKILL_LEVELS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Playstyle Select */}
          <div className="filter-select-group">
            <label className="filter-select-label">Playstyle</label>
            <select 
              value={selectedPlaystyle} 
              onChange={(e) => setSelectedPlaystyle(e.target.value)}
              className="player-filter-select"
            >
              {PLAYSTYLES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Availability Select */}
          <div className="filter-select-group">
            <label className="filter-select-label">Availability</label>
            <select 
              value={selectedAvailability} 
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="player-filter-select"
            >
              {AVAILABILITIES.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Platform Select */}
          <div className="filter-select-group">
            <label className="filter-select-label">Platform</label>
            <select 
              value={selectedPlatform} 
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="player-filter-select"
            >
              {PLATFORMS.map((pl) => (
                <option key={pl} value={pl}>{pl}</option>
              ))}
            </select>
          </div>

          {/* Reset Action */}
          {activeFiltersCount > 0 && (
            <button className="reset-players-filter-btn" onClick={handleClearFilters}>
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Status Bar */}
        <div className="players-status-bar flex-between">
          <span className="results-count">
            Showing <strong className="highlight">{filteredPlayers.length}</strong> matching gamers
          </span>
        </div>

        {/* Players Grid OR Loading OR Error OR Empty State */}
        {loading ? (
          <div className="loading-state glass-panel text-center">
            <Loader2 className="spinner-icon icon-cyan" size={40} />
            <p>Loading squad players from Express server...</p>
          </div>
        ) : error ? (
          <div className="error-state glass-panel text-center">
            <AlertCircle size={48} className="icon-pink margin-b" />
            <h3 className="error-title">Backend Connection Failed</h3>
            <p className="error-description">{error}</p>
            <button className="btn btn-primary margin-top" onClick={loadPlayersData}>
              <RotateCcw size={16} />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : filteredPlayers.length > 0 ? (
          <div className="players-grid">
            {filteredPlayers.map((player) => (
              <div key={player.id} className="player-card glass-panel">
                {/* Card Header: Avatar & Match Badge */}
                <div className="player-card-header">
                  <div className="player-avatar-wrapper">
                    <img src={player.avatar} alt={player.username} className="player-avatar" />
                    <span className="online-indicator" title="Online now"></span>
                  </div>

                  <div className="player-match-badge">
                    <Sparkles size={12} />
                    <span>{player.matchPercentage}% MATCH</span>
                  </div>
                </div>

                {/* Username & Bio */}
                <div className="player-card-body">
                  <h3 className="player-username">{player.username}</h3>

                  <div className="player-meta-pills">
                    <span className="meta-pill pill-skill">{player.skillLevel}</span>
                    <span className="meta-pill pill-style">{player.playstyle}</span>
                    <span className="meta-pill pill-platform">
                      {renderPlatformIcon(player.platform)}
                      <span>{player.platform}</span>
                    </span>
                  </div>

                  <div className="player-games-list">
                    <span className="games-label">Active Games:</span>
                    <div className="games-tags-wrapper">
                      {player.games.map((g) => (
                        <span key={g} className="player-game-tag">{g}</span>
                      ))}
                    </div>
                  </div>

                  <p className="player-bio">"{player.bio}"</p>

                  <div className="player-hours">
                    <span className="hours-label">Online Hours:</span>
                    <span className="hours-value">{player.onlineHours}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="player-card-footer">
                  <Link to={`/players/${player.id}`} className="btn btn-secondary btn-sm flex-1">
                    <Eye size={14} />
                    <span>View Profile</span>
                  </Link>
                  <button className="btn btn-primary btn-sm flex-1">
                    <UserPlus size={14} />
                    <span>Connect</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-results glass-panel">
            <div className="empty-icon-wrapper">
              <Frown size={48} className="empty-icon" />
            </div>
            <h3 className="empty-title">No gamers found</h3>
            <p className="empty-description">
              No squad players match your exact filter criteria right now. Try expanding your search options.
            </p>
            <button className="btn btn-primary btn-clear-filters" onClick={handleClearFilters}>
              <RotateCcw size={16} />
              <span>Reset Player Filters</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
