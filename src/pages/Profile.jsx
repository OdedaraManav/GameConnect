import React from 'react';
import { CURRENT_USER, MOCK_GAMES } from '../data/mockData';
import GameCard from '../components/GameCard';
import { Gamepad2, Trophy, Heart, Clock, Compass, MapPin, Monitor, Flame, Activity } from 'lucide-react';

export default function Profile() {
  // Filter favorite games and currently playing games
  const favoriteGames = MOCK_GAMES.filter((g) => CURRENT_USER.favoriteGameIds.includes(g.id));
  const currentlyPlayingGames = MOCK_GAMES.filter((g) => CURRENT_USER.currentlyPlayingIds.includes(g.id));

  return (
    <div className="profile-page">
      <div className="container">
        {/* Profile Header Banner */}
        <div className="profile-header-card glass-panel">
          <div className="profile-header-top">
            <div className="profile-avatar-container">
              <img src={CURRENT_USER.avatar} alt={CURRENT_USER.username} className="profile-avatar-img" />
              <span className="profile-status-dot" title={CURRENT_USER.status}></span>
            </div>

            <div className="profile-user-info">
              <div className="user-badge-row">
                <span className="user-role-badge">PRO PROFILE</span>
                <span className="user-status-text">
                  <span className="status-indicator"></span> {CURRENT_USER.status}
                </span>
              </div>

              <h1 className="profile-username">{CURRENT_USER.username}</h1>
              <p className="profile-bio">{CURRENT_USER.bio}</p>

              <div className="profile-meta-tags">
                <span className="meta-tag">
                  <Monitor size={14} className="icon-cyan" />
                  <span>{CURRENT_USER.platform}</span>
                </span>
                <span className="meta-tag">
                  <Flame size={14} className="icon-pink" />
                  <span>{CURRENT_USER.playstyle}</span>
                </span>
                <span className="meta-tag">
                  <MapPin size={14} className="icon-cyan" />
                  <span>{CURRENT_USER.location}</span>
                </span>
                <span className="meta-tag tag-time">
                  <Clock size={14} />
                  <span>{CURRENT_USER.availability}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gaming Overview Statistics */}
        <div className="overview-stats-grid">
          <div className="stat-card glass-panel">
            <div className="stat-icon-wrapper cyan">
              <Gamepad2 size={24} />
            </div>
            <div>
              <span className="stat-value">{CURRENT_USER.stats.gamesPlayed}</span>
              <span className="stat-label">Games Played</span>
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-icon-wrapper purple">
              <Trophy size={24} />
            </div>
            <div>
              <span className="stat-value">{CURRENT_USER.stats.gamesCompleted}</span>
              <span className="stat-label">Games Completed</span>
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-icon-wrapper pink">
              <Heart size={24} />
            </div>
            <div>
              <span className="stat-value">{CURRENT_USER.stats.wishlistCount}</span>
              <span className="stat-label">Wishlist Items</span>
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-icon-wrapper green">
              <Clock size={24} />
            </div>
            <div>
              <span className="stat-value">{CURRENT_USER.stats.hoursPlayed}h</span>
              <span className="stat-label">Hours Logged</span>
            </div>
          </div>
        </div>

        {/* 2-Column Main Section: Left = Games & Currently Playing, Right = Preferences & Activity */}
        <div className="profile-layout-grid margin-t-lg">
          <div className="profile-main-content">
            {/* Favorite Games Section */}
            <div className="profile-section">
              <div className="section-header-simple">
                <h2 className="section-title-sm gradient-text">FAVORITE GAMES</h2>
              </div>
              <div className="profile-games-grid">
                {favoriteGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </div>

            {/* Currently Playing Section */}
            <div className="profile-section margin-t-lg">
              <div className="section-header-simple">
                <h2 className="section-title-sm gradient-text">CURRENTLY PLAYING</h2>
              </div>
              <div className="profile-games-grid">
                {currentlyPlayingGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Column: Preferences & Activity Log */}
          <aside className="profile-sidebar">
            {/* Preferences Card */}
            <div className="preferences-card glass-panel">
              <h3 className="sidebar-card-title flex-align">
                <Compass size={18} className="icon-cyan" />
                <span>Gaming Preferences</span>
              </h3>

              <div className="preference-group">
                <span className="pref-label">Favorite Genres</span>
                <div className="pref-tags-list">
                  {CURRENT_USER.preferences.favoriteGenres.map((g) => (
                    <span key={g} className="pref-pill">{g}</span>
                  ))}
                </div>
              </div>

              <div className="preference-group">
                <span className="pref-label">Favorite Platforms</span>
                <div className="pref-tags-list">
                  {CURRENT_USER.preferences.favoritePlatforms.map((p) => (
                    <span key={p} className="pref-pill pill-cyan">{p}</span>
                  ))}
                </div>
              </div>

              <div className="preference-group">
                <span className="pref-label">Playstyle</span>
                <span className="pref-value">{CURRENT_USER.preferences.playstyle}</span>
              </div>

              <div className="preference-group">
                <span className="pref-label">Preferred Time</span>
                <span className="pref-value">{CURRENT_USER.preferences.playingTime}</span>
              </div>

              <div className="preference-group">
                <span className="pref-label">Match Mode</span>
                <span className="pref-value highlight-cyan">{CURRENT_USER.preferences.mode}</span>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="activity-card glass-panel margin-t">
              <h3 className="sidebar-card-title flex-align">
                <Activity size={18} className="icon-pink" />
                <span>Recent Activity</span>
              </h3>

              <div className="activity-list">
                {CURRENT_USER.activities.map((act) => (
                  <div key={act.id} className="activity-item">
                    <div className="activity-bullet"></div>
                    <div className="activity-info">
                      <p className="activity-text">{act.text}</p>
                      <span className="activity-time">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
