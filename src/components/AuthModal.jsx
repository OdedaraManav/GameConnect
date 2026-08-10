import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, LogIn, UserPlus, Mail, Lock, User, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'

  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setErrorMessage('');
    setSuccessMessage('');
    setUsername('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleTabSwitch = (newMode) => {
    setMode(newMode);
    setErrorMessage('');
    setSuccessMessage('');
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        setErrorMessage('Please enter both email and password.');
        return;
      }

      setLoading(true);
      const res = await login(email.trim(), password);
      setLoading(false);

      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.error || 'Invalid credentials.');
      }
    } else {
      // Sign up / Register
      if (!username.trim() || !email.trim() || !password.trim()) {
        setErrorMessage('All fields (username, email, password) are required.');
        return;
      }

      setLoading(true);
      const res = await register(username.trim(), email.trim(), password);
      setLoading(false);

      if (res.success) {
        setSuccessMessage('Account created successfully! Switching to Login...');
        setTimeout(() => {
          setMode('login');
          setSuccessMessage('Account created! Please log in with your credentials.');
        }, 1200);
      } else {
        setErrorMessage(res.error || 'Registration failed.');
      }
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div 
        className="auth-modal-content glass-panel" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button className="auth-modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Modal Header Tabs */}
        <div className="auth-modal-header">
          <div className="auth-tabs">
            <button 
              type="button"
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('login')}
            >
              <LogIn size={18} />
              <span>Login</span>
            </button>
            <button 
              type="button"
              className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('signup')}
            >
              <UserPlus size={18} />
              <span>Sign Up</span>
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="auth-alert error-alert flex-align">
            <AlertCircle size={18} className="alert-icon" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="auth-alert success-alert flex-align">
            <CheckCircle2 size={18} className="alert-icon" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="form-group">
              <label htmlFor="auth-username" className="form-label">Username</label>
              <div className="input-icon-wrapper">
                <User size={18} className="input-icon" />
                <input
                  id="auth-username"
                  type="text"
                  className="form-input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email" className="form-label">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="auth-email"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="auth-password" className="form-label">Password</label>
            <div className="input-icon-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input form-input-password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full margin-t-sm"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spinner-icon" />
                <span>{mode === 'login' ? 'Logging in...' : 'Registering...'}</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Log In to GameConnect' : 'Create Account'}</span>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className="auth-modal-footer">
          {mode === 'login' ? (
            <p className="auth-switch-text">
              Don't have an account?{' '}
              <button type="button" className="auth-switch-link" onClick={() => handleTabSwitch('signup')}>
                Sign Up
              </button>
            </p>
          ) : (
            <p className="auth-switch-text">
              Already have an account?{' '}
              <button type="button" className="auth-switch-link" onClick={() => handleTabSwitch('login')}>
                Log In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
