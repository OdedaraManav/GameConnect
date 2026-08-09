import React from 'react';
import { Search, X, Flame } from 'lucide-react';
import { POPULAR_TAGS } from '../data/mockData';

export default function SearchBar({ searchQuery, setSearchQuery, selectedTag, setSelectedTag }) {
  const handleTagClick = (tag) => {
    if (selectedTag === tag) {
      setSelectedTag('');
      setSearchQuery('');
    } else {
      setSelectedTag(tag);
      setSearchQuery(tag);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedTag('');
  };

  return (
    <div className="search-section-wrapper">
      <div className="container">
        <div className="search-box-container glass-panel">
          {/* Main Search Bar */}
          <div className="search-input-wrapper">
            <Search className="search-icon" size={22} />
            <input
              type="text"
              className="search-input"
              placeholder="Search for a game... (e.g. PUBG, Valorant, Minecraft)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedTag('');
              }}
            />
            {searchQuery && (
              <button 
                className="search-clear-btn" 
                onClick={handleClear} 
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Popular Tag Chips */}
          <div className="search-tags-wrapper">
            <div className="popular-label">
              <Flame size={16} className="flame-icon" />
              <span>Popular Tags:</span>
            </div>
            <div className="tags-list">
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  className={`tag-chip ${selectedTag === tag || searchQuery.toLowerCase() === tag.toLowerCase() ? 'active' : ''}`}
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
