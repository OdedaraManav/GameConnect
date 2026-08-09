import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ArrowLeft, Users, Calendar, Building, Monitor, Smartphone, Tv, Gamepad2, ChevronRight } from 'lucide-react';
import GameCard from '../components/GameCard';
import { MOCK_GAMES } from '../data/mockData';

export default function GameDetails() {
  const { id } = useParams();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeScreenshot, setActiveScreenshot] = useState(0);

  // Find target game from MOCK_GAMES by numeric ID
  const game = MOCK_GAMES.find((g) => g.id === parseInt(id, 10));

  // If game is not found, render clean fallback state
  if (!game) {
    return (
      <div className="game-details-not-found container text-center">
        <div className="glass-panel not-found-card">
          <Gamepad2 size={64} className="icon-cyan margin-b" />
          <h2>Game Not Found</h2>
          <p>We couldn't find any game matching ID #{id}.</p>
          <Link to="/games" className="btn btn-primary margin-top">
            <ArrowLeft size={16} />
            <span>Back to Discovery Library</span>
          </Link>
        </div>
      </div>
    );
  }

  // Find similar games (same primary genre or high rating, excluding current game)
  const primaryGenre = game.genre.split('/')[0].trim();
  const similarGames = MOCK_GAMES.filter(
    (g) => g.id !== game.id && (g.genre.includes(primaryGenre) || g.rating >= 4.7)
  ).slice(0, 3);

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

  const screenshotsList = game.screenshots || [game.image];

  return (
    <div className="game-details-page">
      {/* Top Breadcrumb Nav */}
      <div className="container breadcrumb-nav">
        <Link to="/games" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Discovery</span>
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{game.name}</span>
      </div>

      {/* Main Details Container */}
      <div className="container">
        {/* Large Hero Banner */}
        <div className="game-details-hero glass-panel">
          <img 
            src={screenshotsList[activeScreenshot] || game.image} 
            alt={game.name} 
            className="details-hero-bg" 
          />
          <div className="details-hero-overlay"></div>

          <div className="details-hero-content">
            <div className="details-tags">
              <span className="game-badge">{game.genre}</span>
              {game.featuredTag && (
                <span className="game-badge tag-neon">{game.featuredTag}</span>
              )}
            </div>

            <h1 className="details-title">{game.name}</h1>

            <div className="details-meta-bar">
              <div className="game-rating">
                <Star size={16} fill="#00F2FE" color="#00F2FE" />
                <span className="rating-value">{game.rating}</span>
                <span className="reviews-count">({game.reviewsCount} Reviews)</span>
              </div>

              <div className="meta-divider">|</div>

              <div className="game-platforms">
                {game.platforms.map((p) => (
                  <span key={p} className="platform-tag">
                    {renderPlatformIcon(p)}
                    <span>{p}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="details-actions">
              <Link to="/players" className="btn btn-primary btn-find-squad">
                <Users size={18} />
                <span>Find Players for {game.name.split(':')[0]}</span>
              </Link>

              <button
                className={`btn btn-secondary btn-wishlist-detail ${isWishlisted ? 'active' : ''}`}
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart size={18} fill={isWishlisted ? '#FF2A85' : 'none'} color={isWishlisted ? '#FF2A85' : '#FFF'} />
                <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Info Section: Details & Screenshots */}
        <div className="details-grid-layout">
          {/* Left Column: Description & Specs */}
          <div className="details-main-info glass-panel">
            <h2 className="section-subtitle-sm gradient-text">ABOUT THE GAME</h2>
            <p className="details-full-description">
              {game.fullDescription || game.description}
            </p>

            <h3 className="section-subtitle-sm margin-t">GAME SPECIFICATIONS</h3>
            <div className="specs-grid">
              <div className="spec-item">
                <Calendar size={16} className="icon-cyan" />
                <div>
                  <span className="spec-label">Release Date</span>
                  <span className="spec-value">{game.releaseDate || '2022'}</span>
                </div>
              </div>

              <div className="spec-item">
                <Building size={16} className="icon-cyan" />
                <div>
                  <span className="spec-label">Developer</span>
                  <span className="spec-value">{game.developer || 'Game Studio'}</span>
                </div>
              </div>

              <div className="spec-item">
                <Building size={16} className="icon-cyan" />
                <div>
                  <span className="spec-label">Publisher</span>
                  <span className="spec-value">{game.publisher || 'Publisher Games'}</span>
                </div>
              </div>

              <div className="spec-item">
                <Gamepad2 size={16} className="icon-cyan" />
                <div>
                  <span className="spec-label">Genre</span>
                  <span className="spec-value">{game.genre}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Screenshots Gallery */}
          <div className="details-media-sidebar glass-panel">
            <h2 className="section-subtitle-sm gradient-text">SCREENSHOTS GALLERY</h2>
            <div className="active-screenshot-wrapper">
              <img 
                src={screenshotsList[activeScreenshot] || game.image} 
                alt={`${game.name} preview`} 
                className="active-screenshot-img"
              />
            </div>

            <div className="screenshots-thumbnails-list">
              {screenshotsList.map((src, index) => (
                <button
                  key={index}
                  className={`thumbnail-btn ${activeScreenshot === index ? 'active' : ''}`}
                  onClick={() => setActiveScreenshot(index)}
                >
                  <img src={src} alt={`Thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Similar Games Section */}
        {similarGames.length > 0 && (
          <div className="similar-games-section margin-t-lg">
            <div className="section-header flex-between">
              <div>
                <span className="section-badge">MORE TITLES</span>
                <h2 className="similar-title gradient-text">SIMILAR GAMES YOU MIGHT LIKE</h2>
              </div>
              <Link to="/games" className="see-all-link">
                <span>View All Games</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="similar-games-grid margin-top">
              {similarGames.map((simGame) => (
                <GameCard key={simGame.id} game={simGame} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
