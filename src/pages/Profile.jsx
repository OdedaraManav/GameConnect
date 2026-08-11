import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CURRENT_USER } from '../data/mockData';
import GameCard from '../components/GameCard';
import { fetchJson } from '../services/api';
import { Gamepad2, Trophy, Heart, Clock, Compass, MapPin, Monitor, Flame, Activity, Loader2, Edit3, X, Check, Plus, Trash2, Star, Target, ShieldCheck, AlertCircle } from 'lucide-react';

import AnalogTimePicker from '../components/AnalogTimePicker';
import SocialModal from '../components/SocialModal';
import { Users } from 'lucide-react';

export default function Profile() {
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    updateProfile,
    addFavorite,
    removeFavorite,
    addPlaying,
    removePlaying,
    createGameProfile,
    deleteGameProfile
  } = useAuth();

  const navigate = useNavigate();
  const [allGames, setAllGames] = useState([]);
  const [loading, setLoading] = useState(true);

  // Social Modal State
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);

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

  // Add Game Modal State ('favorite' | 'playing' | null)
  const [addGameModal, setAddGameModal] = useState(null);
  const [gameActionLoading, setGameActionLoading] = useState(false);

  // Game Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    gameId: '',
    gamerTag: '',
    gameAccountId: '',
    rank: '',
    level: '',
    platform: 'PC',
    region: 'Asia / India'
  });
  const [profileSaveLoading, setProfileSaveLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

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
        if (data.length > 0) {
          setProfileForm((prev) => ({ ...prev, gameId: data[0].id }));
        }
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
    if (isEditing || addGameModal || isProfileModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isEditing, addGameModal, isProfileModalOpen]);

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

  const handleAddGame = async (gameId) => {
    setGameActionLoading(true);
    if (addGameModal === 'favorite') {
      await addFavorite(gameId);
    } else if (addGameModal === 'playing') {
      await addPlaying(gameId);
    }
    setGameActionLoading(false);
    setAddGameModal(null);
  };

  const handleRemoveFavorite = async (gameId) => {
    setGameActionLoading(true);
    await removeFavorite(gameId);
    setGameActionLoading(false);
  };

  const handleRemovePlaying = async (gameId) => {
    setGameActionLoading(true);
    await removePlaying(gameId);
    setGameActionLoading(false);
  };

  const handleSaveGameProfile = async (e) => {
    e.preventDefault();
    setProfileSaveLoading(true);
    setProfileError('');

    if (!profileForm.gamerTag.trim()) {
      setProfileError('GamerTag / In-game handle is required.');
      setProfileSaveLoading(false);
      return;
    }

    const res = await createGameProfile({
      gameId: profileForm.gameId,
      gamerTag: profileForm.gamerTag,
      gameAccountId: profileForm.gameAccountId,
      rank: profileForm.rank,
      level: profileForm.level ? parseInt(profileForm.level, 10) : null,
      platform: profileForm.platform,
      region: profileForm.region
    });

    setProfileSaveLoading(false);
    if (res.success) {
      setIsProfileModalOpen(false);
      setProfileForm((prev) => ({
        ...prev,
        gamerTag: '',
        gameAccountId: '',
        rank: '',
        level: ''
      }));
    } else {
      setProfileError(res.error || 'Failed to save game profile.');
    }
  };

  const handleDeleteGameProfile = async (profileId) => {
    setGameActionLoading(true);
    await deleteGameProfile(profileId);
    setGameActionLoading(false);
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

  // Real authenticated user game relationships from PostgreSQL
  const favoriteGames = user?.favoriteGames || [];
  const currentlyPlayingGames = user?.playingGames || [];
  const userGameProfiles = user?.gameProfiles || [];

  // Available games to add to favorites / currently playing list
  const existingFavIds = favoriteGames.map((g) => g.id);
  const existingPlayingIds = currentlyPlayingGames.map((g) => g.id);

  const availableGamesToAdd = allGames.filter((g) => {
    if (addGameModal === 'favorite') return !existingFavIds.includes(g.id);
    if (addGameModal === 'playing') return !existingPlayingIds.includes(g.id);
    return true;
  });

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => setIsSocialModalOpen(true)}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  >
                    <Users size={14} /> Social & Friends
                  </button>
                  <button
                    onClick={handleOpenEdit}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  >
                    <Edit3 size={14} /> Edit Profile
                  </button>
                </div>
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

        {/* Add Game Selection Modal */}
        {addGameModal && (
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
            <div className="modal-dialog-card glass-panel" style={{ maxWidth: '640px' }}>
              <div className="modal-header-fixed">
                <h3 className="gradient-text" style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {addGameModal === 'favorite' ? (
                    <>
                      <Star size={18} className="icon-cyan" /> Select Favorite Game
                    </>
                  ) : (
                    <>
                      <Gamepad2 size={18} className="icon-pink" /> Select Currently Playing Game
                    </>
                  )}
                </h3>
                <button
                  type="button"
                  onClick={() => setAddGameModal(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body-scrollable" style={{ padding: '1.25rem' }}>
                {availableGamesToAdd.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8' }}>
                    <p style={{ fontSize: '0.95rem' }}>All available games in the catalog have already been added to your profile!</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                    {availableGamesToAdd.map((game) => (
                      <div
                        key={game.id}
                        onClick={() => !gameActionLoading && handleAddGame(game.id)}
                        className="glass-panel"
                        style={{
                          cursor: 'pointer',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          background: 'rgba(18, 24, 38, 0.7)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = addGameModal === 'favorite' ? '#00F2FE' : '#FF2A85';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <img src={game.image} alt={game.name} style={{ width: '100%', height: '110px', objectFit: 'cover' }} />
                        <div style={{ padding: '0.65rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f3f4f6', marginBottom: '2px', lineHeight: 1.3 }}>
                              {game.name}
                            </h4>
                            <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>{game.genre}</span>
                          </div>
                          <button
                            type="button"
                            disabled={gameActionLoading}
                            className={`btn ${addGameModal === 'favorite' ? 'btn-primary' : 'btn-accent'} btn-sm`}
                            style={{ marginTop: '10px', padding: '5px 10px', fontSize: '0.75rem', width: '100%', justifyContent: 'center' }}
                          >
                            + Add Game
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-footer-fixed">
                <button
                  type="button"
                  onClick={() => setAddGameModal(null)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Game Profile Modal */}
        {isProfileModalOpen && (
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
            <div className="modal-dialog-card glass-panel" style={{ maxWidth: '540px' }}>
              <div className="modal-header-fixed">
                <h3 className="gradient-text" style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Target size={18} className="icon-cyan" /> Add Game Profile
                </h3>
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveGameProfile} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                <div className="modal-body-scrollable" style={{ padding: '1.25rem' }}>
                  {profileError && (
                    <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '0.875rem' }}>
                      {profileError}
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.3rem' }}>Target Game *</label>
                    <select
                      value={profileForm.gameId}
                      onChange={(e) => setProfileForm({ ...profileForm, gameId: parseInt(e.target.value, 10) })}
                      className="search-input"
                      style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#1e293b' }}
                    >
                      {allGames.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.3rem' }}>
                      In-Game Handle / GamerTag *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.gamerTag}
                      onChange={(e) => setProfileForm({ ...profileForm, gamerTag: e.target.value })}
                      className="search-input"
                      style={{ width: '100%', padding: '0.5rem 0.75rem' }}
                      placeholder="e.g. ManavViper#1234 or Manav_99"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.3rem' }}>
                      Public Game Account ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={profileForm.gameAccountId}
                      onChange={(e) => setProfileForm({ ...profileForm, gameAccountId: e.target.value })}
                      className="search-input"
                      style={{ width: '100%', padding: '0.5rem 0.75rem' }}
                      placeholder="e.g. Riot ID, SteamID64, PUBG Account ID"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.3rem' }}>Rank (Optional)</label>
                      <input
                        type="text"
                        value={profileForm.rank}
                        onChange={(e) => setProfileForm({ ...profileForm, rank: e.target.value })}
                        className="search-input"
                        style={{ width: '100%', padding: '0.5rem 0.75rem' }}
                        placeholder="e.g. Diamond II"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.3rem' }}>Level (Optional)</label>
                      <input
                        type="number"
                        min="1"
                        max="9999"
                        value={profileForm.level}
                        onChange={(e) => setProfileForm({ ...profileForm, level: e.target.value })}
                        className="search-input"
                        style={{ width: '100%', padding: '0.5rem 0.75rem' }}
                        placeholder="e.g. 85"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.3rem' }}>Platform</label>
                      <select
                        value={profileForm.platform}
                        onChange={(e) => setProfileForm({ ...profileForm, platform: e.target.value })}
                        className="search-input"
                        style={{ width: '100%', padding: '0.5rem 0.75rem', background: '#1e293b' }}
                      >
                        <option value="PC">PC</option>
                        <option value="PlayStation 5">PlayStation 5</option>
                        <option value="Xbox Series X">Xbox Series X</option>
                        <option value="Mobile">Mobile</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.3rem' }}>Region</label>
                      <input
                        type="text"
                        value={profileForm.region}
                        onChange={(e) => setProfileForm({ ...profileForm, region: e.target.value })}
                        className="search-input"
                        style={{ width: '100%', padding: '0.5rem 0.75rem' }}
                        placeholder="e.g. Asia / India"
                      />
                    </div>
                  </div>

                  <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.25)', fontSize: '0.775rem', color: '#facc15', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>This profile will be saved as <strong>Self-reported</strong> until verified via official API integration.</span>
                  </div>
                </div>

                <div className="modal-footer-fixed">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={profileSaveLoading}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    {profileSaveLoading ? <Loader2 className="spinner-icon" size={16} /> : 'Save Game Profile'}
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
              <div className="section-header-simple" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="section-title-sm gradient-text" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Star size={18} className="icon-cyan" /> FAVORITE GAMES
                </h2>
                <button
                  type="button"
                  onClick={() => setAddGameModal('favorite')}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                >
                  <Plus size={14} /> Add Favorite
                </button>
              </div>

              {loading ? (
                <div className="loading-state glass-panel text-center">
                  <Loader2 className="spinner-icon icon-cyan" size={32} />
                  <p>Loading favorite games...</p>
                </div>
              ) : favoriteGames.length === 0 ? (
                <div className="glass-panel text-center" style={{ padding: '2rem 1.5rem', color: '#94a3b8', borderRadius: '12px' }}>
                  <p style={{ marginBottom: '0.75rem' }}>No favorite games added yet.</p>
                  <button
                    type="button"
                    onClick={() => setAddGameModal('favorite')}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                  >
                    + Add Favorite Game
                  </button>
                </div>
              ) : (
                <div className="profile-games-grid">
                  {favoriteGames.map((game) => (
                    <div key={game.id} style={{ position: 'relative' }}>
                      <GameCard game={game} />
                      <button
                        type="button"
                        onClick={() => handleRemoveFavorite(game.id)}
                        disabled={gameActionLoading}
                        title="Remove from Favorites"
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(239, 68, 68, 0.85)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          cursor: 'pointer',
                          zIndex: 5,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.85)'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Currently Playing Section */}
            <div className="profile-section margin-t-lg">
              <div className="section-header-simple" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="section-title-sm gradient-text" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Gamepad2 size={18} className="icon-pink" /> CURRENTLY PLAYING
                </h2>
                <button
                  type="button"
                  onClick={() => setAddGameModal('playing')}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                >
                  <Plus size={14} /> Add Playing Game
                </button>
              </div>

              {loading ? (
                <div className="loading-state glass-panel text-center">
                  <Loader2 className="spinner-icon icon-cyan" size={32} />
                  <p>Loading active games...</p>
                </div>
              ) : currentlyPlayingGames.length === 0 ? (
                <div className="glass-panel text-center" style={{ padding: '2rem 1.5rem', color: '#94a3b8', borderRadius: '12px' }}>
                  <p style={{ marginBottom: '0.75rem' }}>No games added to currently playing list.</p>
                  <button
                    type="button"
                    onClick={() => setAddGameModal('playing')}
                    className="btn btn-accent btn-sm"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                  >
                    + Add Playing Game
                  </button>
                </div>
              ) : (
                <div className="profile-games-grid">
                  {currentlyPlayingGames.map((game) => (
                    <div key={game.id} style={{ position: 'relative' }}>
                      <GameCard game={game} />
                      <button
                        type="button"
                        onClick={() => handleRemovePlaying(game.id)}
                        disabled={gameActionLoading}
                        title="Remove from Currently Playing"
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(239, 68, 68, 0.85)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          cursor: 'pointer',
                          zIndex: 5,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.85)'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Game Profiles Section (Optional User-Created Profiles) */}
            <div className="profile-section margin-t-lg">
              <div className="section-header-simple" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="section-title-sm gradient-text" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Target size={18} className="icon-cyan" /> GAME PROFILES
                </h2>
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                >
                  <Plus size={14} /> Add Game Profile
                </button>
              </div>

              {userGameProfiles.length === 0 ? (
                <div className="glass-panel text-center" style={{ padding: '2rem 1.5rem', color: '#94a3b8', borderRadius: '12px' }}>
                  <p style={{ marginBottom: '0.75rem' }}>No optional game profiles created yet.</p>
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(true)}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                  >
                    + Add Game Profile
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                  {userGameProfiles.map((gp) => (
                    <div
                      key={gp.id}
                      className="glass-panel"
                      style={{
                        borderRadius: '14px',
                        overflow: 'hidden',
                        position: 'relative',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        background: 'rgba(15, 22, 36, 0.75)',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      {/* Card Cover & Header */}
                      <div style={{ height: '90px', position: 'relative', overflow: 'hidden' }}>
                        <img
                          src={gp.game?.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'}
                          alt={gp.game?.name || 'Game Cover'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.65)' }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,22,36,0.95), transparent)' }} />
                        <span style={{ position: 'absolute', bottom: '8px', left: '12px', fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                          {gp.game?.name || 'Game'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteGameProfile(gp.id)}
                          disabled={gameActionLoading}
                          title="Delete Game Profile"
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'rgba(239, 68, 68, 0.85)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '26px',
                            height: '26px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            cursor: 'pointer',
                            zIndex: 5
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Card Body */}
                      <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
                        {/* Verification Badge */}
                        <div>
                          {gp.verificationStatus === 'VERIFIED' ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '20px',
                              fontSize: '0.725rem',
                              fontWeight: 600,
                              background: 'rgba(34, 197, 94, 0.2)',
                              color: '#4ade80',
                              border: '1px solid rgba(34, 197, 94, 0.4)'
                            }}>
                              <ShieldCheck size={12} /> Verified ✓
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '20px',
                              fontSize: '0.725rem',
                              fontWeight: 600,
                              background: 'rgba(234, 179, 8, 0.15)',
                              color: '#facc15',
                              border: '1px solid rgba(234, 179, 8, 0.3)'
                            }}>
                              <AlertCircle size={12} /> Self-reported / Not verified
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.825rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0' }}>
                            <span style={{ color: '#94a3b8' }}>GamerTag:</span>
                            <span style={{ fontWeight: 600, color: 'var(--primary-cyan)' }}>{gp.gamerTag}</span>
                          </div>

                          {gp.rank && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0' }}>
                              <span style={{ color: '#94a3b8' }}>Rank:</span>
                              <span style={{ fontWeight: 500 }}>{gp.rank}</span>
                            </div>
                          )}

                          {gp.level && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0' }}>
                              <span style={{ color: '#94a3b8' }}>Level:</span>
                              <span style={{ fontWeight: 500 }}>Lvl {gp.level}</span>
                            </div>
                          )}

                          {gp.platform && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0' }}>
                              <span style={{ color: '#94a3b8' }}>Platform:</span>
                              <span>{gp.platform}</span>
                            </div>
                          )}

                          {gp.region && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0' }}>
                              <span style={{ color: '#94a3b8' }}>Region:</span>
                              <span>{gp.region}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
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

      {/* Social & Friends Network Modal */}
      <SocialModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
      />
    </div>
  );
}
