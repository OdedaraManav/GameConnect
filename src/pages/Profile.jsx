import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CURRENT_USER } from '../data/mockData';
import GameCard from '../components/GameCard';
import { fetchJson } from '../services/api';
import { Gamepad2, Trophy, Heart, Clock, Compass, MapPin, Monitor, Flame, Activity, Loader2, Edit3, X, Check } from 'lucide-react';

import AnalogTimePicker from '../components/AnalogTimePicker';

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [allGames, setAllGames] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    avatar: '',
    bio: '',
    location: '',
    platform: '',
    playstyle: '',
    availability: '',
    availabilityStart: '',
    availabilityEnd: '',
    status: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // Redirect to Home (/) if user is not authenticated after initial Auth token check finishes
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    async function loadGames() {
      try {
        setLoading(true);
        const data = await fetchJson('/games');
        setAllGames(data);
      } catch (err) {
        console.error('Error fetching games for profile:', err);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      loadGames();
    }
  }, [isAuthenticated]);

  // Toggle body scroll lock when modal opens/closes
  useEffect(() => {
    if (isEditing) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isEditing]);

  const handleOpenEdit = () => {
    setEditForm({
      avatar: user?.avatar || CURRENT_USER.avatar,
      bio: user?.bio || CURRENT_USER.bio,
      location: user?.location || CURRENT_USER.location,
      platform: user?.platform || CURRENT_USER.platform,
      playstyle: user?.playstyle || CURRENT_USER.playstyle,
      availability: user?.availability || CURRENT_USER.availability,
      availabilityStart: user?.availabilityStart || '20:00',
      availabilityEnd: user?.availabilityEnd || '00:00',
      status: user?.status || CURRENT_USER.status
    });
    setSaveError('');
    setSaveSuccess('');
    setIsEditing(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveError('');
    setSaveSuccess('');

    const res = await updateProfile(editForm);
    setSaveLoading(false);

    if (res.success) {
      setSaveSuccess('Profile updated successfully!');
      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccess('');
      }, 1200);
    } else {
      setSaveError(res.error || 'Failed to update profile.');
    }
  };

  const handleTimePickerChange = ({ availabilityStart, availabilityEnd, availability }) => {
    setEditForm((prev) => ({
      ...prev,
      availabilityStart,
      availabilityEnd,
      availability
    }));
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="loading-state glass-panel text-center margin-t-lg">
            <Loader2 className="spinner-icon icon-cyan" size={32} />
            <p>Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  // Real authenticated user properties from PostgreSQL (with safe defaults)
  const activeUsername = user?.username || CURRENT_USER.username;
  const activeAvatar = user?.avatar || CURRENT_USER.avatar;
  const activeBio = user?.bio || CURRENT_USER.bio;
  const activeLocation = user?.location || CURRENT_USER.location;
  const activePlatform = user?.platform || CURRENT_USER.platform;
  const activePlaystyle = user?.playstyle || CURRENT_USER.playstyle;
  const activeAvailability = user?.availability || CURRENT_USER.availability;
  const activeStatus = user?.status || CURRENT_USER.status;

  // Filter favorite games and currently playing games from fetched backend dataset (using mock IDs for now)
  const favoriteGames = allGames.filter((g) => CURRENT_USER.favoriteGameIds.includes(g.id));
  const currentlyPlayingGames = allGames.filter((g) => CURRENT_USER.currentlyPlayingIds.includes(g.id));

  return (
    <div className="profile-page">
      <div className="container">
        {/* Profile Header Banner */}
        <div className="profile-header-card glass-panel">
          <div className="profile-header-top">
            <div className="profile-avatar-container">
              <img src={activeAvatar} alt={activeUsername} className="profile-avatar-img" />
              <span className="profile-status-dot" title={activeStatus}></span>
            </div>

            <div className="profile-user-info">
              <div className="user-badge-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="user-role-badge">PRO PROFILE</span>
                  <span className="user-status-text">
                    <span className="status-indicator"></span> {activeStatus}
                  </span>
                </div>
                <button
                  onClick={handleOpenEdit}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  <Edit3 size={14} /> Edit Profile
                </button>
              </div>

              <h1 className="profile-username">{activeUsername}</h1>
              <p className="profile-bio">{activeBio}</p>

              <div className="profile-meta-tags">
                <span className="meta-tag">
                  <Monitor size={14} className="icon-cyan" />
                  <span>{activePlatform}</span>
                </span>
                <span className="meta-tag">
                  <Flame size={14} className="icon-pink" />
                  <span>{activePlaystyle}</span>
                </span>
                <span className="meta-tag">
                  <MapPin size={14} className="icon-cyan" />
                  <span>{activeLocation}</span>
                </span>
                <span className="meta-tag tag-time">
                  <Clock size={14} />
                  <span>{activeAvailability}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Responsive Scrollable Modal */}
        {isEditing && (
          <div className="modal-backdrop" style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div className="modal-dialog-card glass-panel">
              {/* 1. Fixed Header */}
              <div className="modal-header-fixed">
                <h3 className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  Edit User Profile
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* 2. Scrollable Body containing form fields */}
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                <div className="modal-body-scrollable">
                  {saveError && (
                    <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '0.875rem' }}>
                      {saveError}
                    </div>
                  )}

                  {saveSuccess && (
                    <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Check size={16} /> {saveSuccess}
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.25rem' }}>Avatar Image URL</label>
                    <input
                      type="text"
                      value={editForm.avatar}
                      onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                      className="search-input"
                      style={{ width: '100%', padding: '0.5rem 0.75rem' }}
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.25rem' }}>Bio</label>
                    <textarea
                      rows={3}
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="search-input"
                      style={{ width: '100%', padding: '0.5rem 0.75rem', resize: 'vertical' }}
                      placeholder="Tell other gamers about yourself..."
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.25rem' }}>Location</label>
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className="search-input"
                        style={{ width: '100%', padding: '0.5rem 0.75rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.25rem' }}>Gaming Platform</label>
                      <input
                        type="text"
                        value={editForm.platform}
                        onChange={(e) => setEditForm({ ...editForm, platform: e.target.value })}
                        className="search-input"
                        style={{ width: '100%', padding: '0.5rem 0.75rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.25rem' }}>Playstyle</label>
                      <input
                        type="text"
                        value={editForm.playstyle}
                        onChange={(e) => setEditForm({ ...editForm, playstyle: e.target.value })}
                        className="search-input"
                        style={{ width: '100%', padding: '0.5rem 0.75rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.25rem' }}>Status</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="search-input"
                        style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#1e293b' }}
                      >
                        <option value="Online">Online</option>
                        <option value="In Game">In Game</option>
                        <option value="Away">Away</option>
                        <option value="Offline">Offline</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem' }}>
                      Gaming Availability (Visual Clock Picker)
                    </label>
                    <AnalogTimePicker
                      initialStart={editForm.availabilityStart}
                      initialEnd={editForm.availabilityEnd}
                      onChange={handleTimePickerChange}
                    />
                  </div>
                </div>

                {/* 3. Fixed Sticky Footer */}
                <div className="modal-footer-fixed">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    {saveLoading ? <Loader2 className="spinner-icon" size={16} /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
              {loading ? (
                <div className="loading-state glass-panel text-center">
                  <Loader2 className="spinner-icon icon-cyan" size={32} />
                  <p>Loading favorite games...</p>
                </div>
              ) : (
                <div className="profile-games-grid">
                  {favoriteGames.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              )}
            </div>

            {/* Currently Playing Section */}
            <div className="profile-section margin-t-lg">
              <div className="section-header-simple">
                <h2 className="section-title-sm gradient-text">CURRENTLY PLAYING</h2>
              </div>
              {loading ? (
                <div className="loading-state glass-panel text-center">
                  <Loader2 className="spinner-icon icon-cyan" size={32} />
                  <p>Loading active games...</p>
                </div>
              ) : (
                <div className="profile-games-grid">
                  {currentlyPlayingGames.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              )}
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
