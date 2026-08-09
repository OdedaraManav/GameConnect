import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Bookmark, Heart, Monitor, Smartphone, Tv } from 'lucide-react';

export default function GameCard({ game }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

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
    <div className="game-card glass-panel">
      {/* Game Image Banner */}
      <div className="game-image-container">
        <img 
          src={game.image} 
          alt={game.name} 
          className="game-image" 
          loading="lazy"
        />
        <div className="game-image-overlay"></div>
        
        {/* Featured Tag Badge */}
        {game.featuredTag && (
          <span className="game-badge">{game.featuredTag}</span>
        )}

        {/* Wishlist Button */}
        <button
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={() => setIsWishlisted(!isWishlisted)}
          aria-label="Bookmark game"
          title={isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={16} fill={isWishlisted ? '#FF2A85' : 'none'} color={isWishlisted ? '#FF2A85' : '#FFF'} />
        </button>
      </div>

      {/* Game Card Details */}
      <div className="game-card-body">
        <div className="game-header">
          <h3 className="game-title">{game.name}</h3>
          <div className="game-rating">
            <Star size={14} className="star-icon" fill="#00F2FE" />
            <span className="rating-value">{game.rating}</span>
            <span className="reviews-count">({game.reviewsCount})</span>
          </div>
        </div>

        <p className="game-genre">{game.genre}</p>
        <p className="game-description">{game.description}</p>

        {/* Footer info: platforms & action */}
        <div className="game-card-footer">
          <div className="game-platforms">
            {game.platforms.map((platform) => (
              <span className="platform-tag" key={platform}>
                {renderPlatformIcon(platform)}
                <span className="platform-name">{platform}</span>
              </span>
            ))}
          </div>

          <Link to={`/games/${game.id}`} className="btn-view-game">
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
