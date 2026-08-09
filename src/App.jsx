import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Games from './pages/Games';
import GameDetails from './pages/GameDetails';
import Players from './pages/Players';
import PlayerDetails from './pages/PlayerDetails';
import Profile from './pages/Profile';

import './App.css';

export default function App() {
  return (
    <Router>
      <div className="gameconnect-app">
        {/* Header Navigation - persistent across pages */}
        <Navbar />

        {/* Dynamic Route View */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/:id" element={<GameDetails />} />
            <Route path="/players" element={<Players />} />
            <Route path="/players/:id" element={<PlayerDetails />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>

        {/* Footer - persistent across pages */}
        <Footer />
      </div>
    </Router>
  );
}
