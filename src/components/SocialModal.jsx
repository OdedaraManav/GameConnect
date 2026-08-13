import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  searchUsers,
  sendFriendRequest,
  getIncomingFriendRequests,
  getOutgoingFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendsList,
  removeFriend,
  blockUser,
  unblockUser,
  getBlockedUsers
} from '../services/api';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  UserMinus,
  Ban,
  Search,
  Loader2,
  X,
  Clock,
  Monitor,
  Flame,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function SocialModal({ isOpen, onClose, onRequestCountChange }) {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' | 'requests' | 'search' | 'blocked'

  // Data states
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Status & Feedback states
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Load social data on tab change or modal open
  useEffect(() => {
    if (isOpen && token) {
      loadSocialData();
    }
  }, [isOpen, activeTab, token]);

  const loadSocialData = async () => {
    setLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      // Always fetch incoming requests to keep badge count in sync
      const incRes = await getIncomingFriendRequests(token);
      const incList = incRes.requests || [];
      setIncomingRequests(incList);
      if (onRequestCountChange) {
        onRequestCountChange(incList.length);
      }

      if (activeTab === 'friends') {
        const res = await getFriendsList(token);
        setFriends(res.friends || []);
      } else if (activeTab === 'requests') {
        const outRes = await getOutgoingFriendRequests(token);
        setOutgoingRequests(outRes.requests || []);
      } else if (activeTab === 'blocked') {
        const res = await getBlockedUsers(token);
        setBlockedUsers(res.blockedUsers || []);
      }
    } catch (err) {
      console.error('Error loading social data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await searchUsers(token, searchQuery);
      setSearchResults(res.users || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to search users.' });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async (targetId) => {
    setActionLoadingId(targetId);
    setFeedback({ type: '', message: '' });
    try {
      const res = await sendFriendRequest(token, targetId);
      setFeedback({ type: 'success', message: res.message || 'Friend request sent!' });
      // Refresh search results or outgoing requests
      setSearchResults(prev => prev.filter(u => u.id !== targetId));
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to send request.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setActionLoadingId(requestId);
    setFeedback({ type: '', message: '' });
    try {
      await acceptFriendRequest(token, requestId);
      setFeedback({ type: 'success', message: 'Friend request accepted!' });
      setIncomingRequests(prev => {
        const updated = prev.filter(r => r.id !== requestId);
        if (onRequestCountChange) {
          onRequestCountChange(updated.length);
        }
        return updated;
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to accept request.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setActionLoadingId(requestId);
    setFeedback({ type: '', message: '' });
    try {
      await rejectFriendRequest(token, requestId);
      setFeedback({ type: 'success', message: 'Friend request rejected.' });
      setIncomingRequests(prev => {
        const updated = prev.filter(r => r.id !== requestId);
        if (onRequestCountChange) {
          onRequestCountChange(updated.length);
        }
        return updated;
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to reject request.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnfriend = async (friendId) => {
    setActionLoadingId(friendId);
    setFeedback({ type: '', message: '' });
    try {
      await removeFriend(token, friendId);
      setFeedback({ type: 'success', message: 'User removed from friends list.' });
      setFriends(prev => prev.filter(f => f.id !== friendId));
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to remove friend.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBlock = async (targetUserId) => {
    setActionLoadingId(targetUserId);
    setFeedback({ type: '', message: '' });
    try {
      await blockUser(token, targetUserId);
      setFeedback({ type: 'success', message: 'User blocked.' });
      setFriends(prev => prev.filter(f => f.id !== targetUserId));
      setIncomingRequests(prev => {
        const updated = prev.filter(r => r.senderId !== targetUserId);
        if (onRequestCountChange) {
          onRequestCountChange(updated.length);
        }
        return updated;
      });
      setOutgoingRequests(prev => prev.filter(r => r.receiverId !== targetUserId));
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to block user.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnblock = async (targetUserId) => {
    setActionLoadingId(targetUserId);
    setFeedback({ type: '', message: '' });
    try {
      await unblockUser(token, targetUserId);
      setFeedback({ type: 'success', message: 'User unblocked.' });
      setBlockedUsers(prev => prev.filter(b => b.id !== targetUserId));
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to unblock user.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="modal-dialog-card glass-panel" style={{ maxWidth: '680px', width: '100%', height: '85vh', maxHeight: '680px', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="modal-header-fixed" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} className="icon-cyan" /> Friends & Social Network
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Social Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(15, 23, 42, 0.6)' }}>
          <button
            onClick={() => setActiveTab('friends')}
            style={{
              flex: 1,
              padding: '0.75rem 0.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'friends' ? '2px solid var(--primary-cyan)' : '2px solid transparent',
              color: activeTab === 'friends' ? '#fff' : '#94a3b8',
              fontWeight: activeTab === 'friends' ? 600 : 400,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <Users size={16} /> My Friends
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            style={{
              flex: 1,
              padding: '0.75rem 0.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'requests' ? '2px solid var(--primary-cyan)' : '2px solid transparent',
              color: activeTab === 'requests' ? '#fff' : '#94a3b8',
              fontWeight: activeTab === 'requests' ? 600 : 400,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              position: 'relative'
            }}
          >
            <UserPlus size={16} /> Requests
            {incomingRequests.length > 0 && (
              <span style={{ background: '#FF2A85', color: '#fff', fontSize: '0.7rem', borderRadius: '10px', padding: '1px 6px', marginLeft: '4px' }}>
                {incomingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('search')}
            style={{
              flex: 1,
              padding: '0.75rem 0.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'search' ? '2px solid var(--primary-cyan)' : '2px solid transparent',
              color: activeTab === 'search' ? '#fff' : '#94a3b8',
              fontWeight: activeTab === 'search' ? 600 : 400,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <Search size={16} /> Find Gamers
          </button>

          <button
            onClick={() => setActiveTab('blocked')}
            style={{
              flex: 1,
              padding: '0.75rem 0.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'blocked' ? '2px solid var(--primary-cyan)' : '2px solid transparent',
              color: activeTab === 'blocked' ? '#fff' : '#94a3b8',
              fontWeight: activeTab === 'blocked' ? 600 : 400,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <Ban size={16} /> Blocked
          </button>
        </div>

        {/* Feedback Message */}
        {feedback.message && (
          <div style={{
            padding: '0.6rem 1rem',
            background: feedback.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
            borderBottom: `1px solid ${feedback.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
            color: feedback.type === 'error' ? '#f87171' : '#4ade80',
            fontSize: '0.825rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            {feedback.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Scrollable Tab Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#94a3b8' }}>
              <Loader2 className="spinner-icon icon-cyan" size={28} />
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>Loading social network...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: MY FRIENDS */}
              {activeTab === 'friends' && (
                <div>
                  {friends.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                      <Users size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                      <p style={{ fontSize: '0.95rem' }}>You have no friends on your list yet.</p>
                      <button
                        onClick={() => setActiveTab('search')}
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: '1rem', padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                      >
                        + Find & Add Gamers
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                      {friends.map((friend) => (
                        <div
                          key={friend.id}
                          className="glass-panel"
                          style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            background: 'rgba(15, 23, 42, 0.7)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '0.75rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <div style={{ position: 'relative' }}>
                              <img
                                src={friend.avatar}
                                alt={friend.username}
                                style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                              <span style={{
                                position: 'absolute',
                                bottom: '2px',
                                right: '2px',
                                width: '11px',
                                height: '11px',
                                borderRadius: '50%',
                                backgroundColor: friend.status === 'Online' ? '#22c55e' : friend.status === 'In Game' ? '#a855f7' : '#94a3b8',
                                border: '2px solid #0f172a'
                              }} />
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
                                {friend.username}
                              </h4>
                              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <span style={{ color: friend.status === 'Online' ? '#4ade80' : '#cbd5e1' }}>{friend.status || 'Online'}</span>
                              </p>
                              {friend.availability && (
                                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '2px' }}>
                                  <Clock size={11} /> {friend.availability}
                                </span>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.6rem' }}>
                            <button
                              onClick={() => handleUnfriend(friend.id)}
                              disabled={actionLoadingId === friend.id}
                              className="btn btn-secondary btn-sm"
                              style={{ flex: 1, fontSize: '0.75rem', padding: '4px 8px', justifyContent: 'center' }}
                            >
                              <UserMinus size={13} /> Unfriend
                            </button>
                            <button
                              onClick={() => handleBlock(friend.id)}
                              disabled={actionLoadingId === friend.id}
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', fontSize: '0.75rem', padding: '4px 8px', justifyContent: 'center' }}
                            >
                              <Ban size={13} /> Block
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: REQUESTS */}
              {activeTab === 'requests' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Incoming Requests */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-cyan)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      INCOMING FRIEND REQUESTS ({incomingRequests.length})
                    </h4>
                    {incomingRequests.length === 0 ? (
                      <p style={{ fontSize: '0.825rem', color: '#94a3b8', fontStyle: 'italic' }}>No pending incoming friend requests.</p>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                        {incomingRequests.map((req) => (
                          <div key={req.id} className="glass-panel" style={{ padding: '0.75rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <img src={req.sender?.avatar} alt={req.sender?.username} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                              <div>
                                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#fff', display: 'block' }}>{req.sender?.username}</span>
                                <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>{req.sender?.platform || 'Gamer'}</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => handleAcceptRequest(req.id)}
                                disabled={actionLoadingId === req.id}
                                className="btn btn-primary btn-sm"
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleRejectRequest(req.id)}
                                disabled={actionLoadingId === req.id}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Outgoing Requests */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      SENT OUTGOING REQUESTS ({outgoingRequests.length})
                    </h4>
                    {outgoingRequests.length === 0 ? (
                      <p style={{ fontSize: '0.825rem', color: '#94a3b8', fontStyle: 'italic' }}>No pending outgoing friend requests.</p>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                        {outgoingRequests.map((req) => (
                          <div key={req.id} className="glass-panel" style={{ padding: '0.75rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <img src={req.receiver?.avatar} alt={req.receiver?.username} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                              <div>
                                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#fff', display: 'block' }}>{req.receiver?.username}</span>
                                <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>Pending approval</span>
                              </div>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>Sent</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: FIND GAMERS */}
              {activeTab === 'search' && (
                <div>
                  <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search gamers by username..."
                      className="search-input"
                      style={{ flex: 1, padding: '0.6rem 0.85rem' }}
                    />
                    <button type="submit" disabled={searchLoading} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
                      {searchLoading ? <Loader2 className="spinner-icon" size={16} /> : 'Search'}
                    </button>
                  </form>

                  {searchResults.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem', marginTop: '2rem' }}>
                      {searchQuery ? 'No gamers found matching your search query.' : 'Type a username to discover other gamers.'}
                    </p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                      {searchResults.map((u) => (
                        <div key={u.id} className="glass-panel" style={{ padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img src={u.avatar} alt={u.username} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                            <div>
                              <h5 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: 0 }}>{u.username}</h5>
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{u.platform} • {u.playstyle}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleSendRequest(u.id)}
                            disabled={actionLoadingId === u.id}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '5px 10px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                          >
                            + Add Friend
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: BLOCKED USERS */}
              {activeTab === 'blocked' && (
                <div>
                  {blockedUsers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                      <Ban size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                      <p style={{ fontSize: '0.95rem' }}>No users currently blocked.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                      {blockedUsers.map((bUser) => (
                        <div key={bUser.id} className="glass-panel" style={{ padding: '0.75rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <img src={bUser.avatar} alt={bUser.username} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                            <div>
                              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#fff', display: 'block' }}>{bUser.username}</span>
                              <span style={{ fontSize: '0.725rem', color: '#ef4444' }}>Blocked</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnblock(bUser.id)}
                            disabled={actionLoadingId === bUser.id}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            Unblock
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer-fixed" style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
