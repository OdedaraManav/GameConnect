import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, UserPlus, MessageSquare, UserCheck, Monitor, Smartphone, Tv, MapPin, Gamepad2, Compass, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import GameCard from '../components/GameCard';
import { fetchJson } from '../services/api';

export default function PlayerDetails() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [playerFavoriteGames, setPlayerFavoriteGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    async function loadPlayerData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch player by ID from backend
        const playerData = await fetchJson(`/players/${id}`);
        setPlayer(playerData);

        // Fetch games list to render favorite games
        const gamesData = await fetchJson('/games').catch(() => []);
        const favGames = gamesData.filter((g) =>
          playerData.favoriteGameIds ? playerData.favoriteGameIds.includes(g.id) : playerData.games.includes(g.name)
        );
        setPlayerFavoriteGames(favGames);
      } catch (err) {
        if (err.status === 404) {
          setError('Player profile not found');
        } else {
          setError('Unable to load player profile. Please check if the GameConnect server is running.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadPlayerData();
  }, [id]);

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

  // Loading State
  if (loading) {
    return (
      <div className="player-details-page container">
        <div className="loading-state glass-panel text-center margin-t-lg">
          <Loader2 className="spinner-icon icon-cyan" size={44} />
          <p>Fetching player profile from Express server...</p>
        </div>
      </div>
    );
  }

  // Error / 404 State
  if (error || !player) {
    return (
      <div className="player-not-found container text-center">
        <div className="glass-panel not-found-card">
          <Gamepad2 size={64} className="icon-cyan margin-b" />
          <h2>Player Not Found</h2>
          <p>{error || `We couldn't find any gamer profile matching ID #${id}.`}</p>
          <Link to="/players" className="btn btn-primary margin-top">
            <ArrowLeft size={16} />
            <span>Back to Squad Finder</span>
          </Link>
        </div>
      </div>
    );
  }

  const comp = player.compatibility || { games: 95, skill: 90, playstyle: 94, availability: 89 };

  return (
    <div className="player-details-page">
      {/* Breadcrumb Navigation */}
      <div className="container breadcrumb-nav">
        <Link to="/players" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Squad Finder</span>
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{player.username}</span>
      </div>

      <div className="container">
        {/* Player Header Banner */}
        <div className="player-header-card glass-panel">
          <div className="player-header-top">
            <div className="player-avatar-container">
              <img src={player.avatar} alt={player.username} className="player-avatar-large" />
              <span className={`status-indicator-dot ${player.status ? player.status.toLowerCase() : 'online'}`}></span>
            </div>

            <div className="player-header-info">
              <div className="player-badge-row">
                <span className="player-skill-tag">{player.skillLevel}</span>
                <span className="player-status-tag">
                  <span className={`status-indicator ${player.status ? player.status.toLowerCase() : 'online'}`}></span>
                  {player.status || 'Online'}
                </span>
              </div>

              <h1 className="player-details-username">{player.username}</h1>
              <p className="player-details-bio">"{player.bio}"</p>

              <div className="player-details-meta">
                <span className="meta-tag">
                  {renderPlatformIcon(player.platform)}
                  <span>{player.platform}</span>
                </span>
                <span className="meta-tag">
                  <MapPin size={14} className="icon-cyan" />
                  <span>{player.region || 'Global'}</span>
                </span>
                <span className="meta-tag">
                  <Compass size={14} className="icon-pink" />
                  <span>{player.playstyle}</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="player-header-actions">
              <button
                className={`btn ${isConnected ? 'btn-secondary' : 'btn-primary'} btn-action-lg`}
                onClick={() => setIsConnected(!isConnected)}
              >
                {isConnected ? <UserCheck size={18} /> : <UserPlus size={18} />}
                <span>{isConnected ? 'Connected' : 'Connect Squad'}</span>
              </button>

              <button className="btn btn-secondary btn-action-lg">
                <MessageSquare size={18} />
                <span>Message</span>
              </button>

              <button
                className={`btn btn-secondary btn-action-sm ${isFollowing ? 'active' : ''}`}
                onClick={() => setIsFollowing(!isFollowing)}
              >
                <span>{isFollowing ? 'Following' : 'Follow'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Compatibility Overview Section */}
        <div className="compatibility-banner glass-panel margin-t">
          <div className="comp-score-box">
            <div className="score-ring">
              <Sparkles size={20} className="icon-cyan" />
              <span className="score-number">{player.matchPercentage}%</span>
            </div>
            <span className="score-label">MATCH COMPATIBILITY</span>
          </div>

          <div className="comp-categories-grid">
            <div className="comp-category-item">
              <div className="comp-cat-header">
                <span className="cat-name">Games Overlap</span>
                <span className="cat-val">{comp.games}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${comp.games}%` }}></div>
              </div>
            </div>

            <div className="comp-category-item">
              <div className="comp-cat-header">
                <span className="cat-name">Skill Level</span>
                <span className="cat-val">{comp.skill}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill purple" style={{ width: `${comp.skill}%` }}></div>
              </div>
            </div>

            <div className="comp-category-item">
              <div className="comp-cat-header">
                <span className="cat-name">Playstyle</span>
                <span className="cat-val">{comp.playstyle}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill pink" style={{ width: `${comp.playstyle}%` }}></div>
              </div>
            </div>

            <div className="comp-category-item">
              <div className="comp-cat-header">
                <span className="cat-name">Availability</span>
                <span className="cat-val">{comp.availability}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill green" style={{ width: `${comp.availability}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Main Layout: Games & Preferences */}
        <div className="player-details-grid margin-t-lg">
          <div className="player-main-games">
            {/* Common Games Section */}
            {player.commonGames && player.commonGames.length > 0 && (
              <div className="common-games-card glass-panel margin-b-lg">
                <div className="card-title-header flex-align">
                  <ShieldCheck size={20} className="icon-cyan" />
                  <h3 className="card-heading">COMMON GAMES WITH YOU</h3>
                </div>
                <div className="common-games-tags">
                  {player.commonGames.map((g) => (
                    <span key={g} className="common-game-badge">
                      <Gamepad2 size={14} />
                      <span>{g}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Player's Favorite Games Section */}
            <div className="player-games-section">
              <h2 className="section-title-sm gradient-text">PLAYER'S FAVORITE GAMES</h2>
              <div className="player-favorite-grid margin-top">
                {playerFavoriteGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: Preferences Card */}
          <aside className="player-sidebar">
            <div className="preferences-card glass-panel">
              <h3 className="sidebar-card-title flex-align">
                <Compass size={18} className="icon-cyan" />
                <span>Gaming Preferences</span>
              </h3>

              <div className="preference-group">
                <span className="pref-label">Favorite Genres</span>
                <div className="pref-tags-list">
                  {(player.preferences?.favoriteGenres || ['FPS', 'Action']).map((g) => (
                    <span key={g} className="pref-pill">{g}</span>
                  ))}
                </div>
              </div>

              <div className="preference-group">
                <span className="pref-label">Playstyle</span>
                <span className="pref-value">{player.preferences?.playstyle || player.playstyle}</span>
              </div>

              <div className="preference-group">
                <span className="pref-label">Preferred Platform</span>
                <span className="pref-value highlight-cyan">{player.platform}</span>
              </div>

              <div className="preference-group">
                <span className="pref-label">Active Hours</span>
                <span className="pref-value">{player.onlineHours}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
