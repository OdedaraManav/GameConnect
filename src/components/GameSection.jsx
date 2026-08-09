import React from 'react';
import GameCard from './GameCard';
import { Gamepad2, SearchX } from 'lucide-react';

export default function GameSection({ games, searchQuery }) {
  return (
    <section id="games" className="games-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header center">
          <div className="section-badge">
            <Gamepad2 size={14} />
            <span>Curated Library</span>
          </div>
          <h2 className="section-title">
            RECOMMENDED <span className="gradient-text">GAMES</span>
          </h2>
          <p className="section-subtitle">
            Explore top-rated multiplayer and single-player titles with active gaming communities.
          </p>
        </div>

        {/* Games Grid */}
        {games.length > 0 ? (
          <div className="games-grid">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="no-results-box glass-panel">
            <SearchX size={48} className="no-results-icon" />
            <h3>No games found matching "{searchQuery}"</h3>
            <p>Try searching for popular terms like PUBG, Valorant, or Minecraft.</p>
          </div>
        )}
      </div>
    </section>
  );
}
