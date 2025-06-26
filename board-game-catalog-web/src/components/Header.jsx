// src/components/Header.jsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import './Header.css';

const Header = () => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="app-header">
      <h1>Board Game Catalog</h1>
      {currentUser ? (
        <div className="user-info">
          <span>Welcome, {currentUser.email}!</span>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div className="user-info">
          <span>Guest</span>
        </div>
      )}
    </header>
  );
};

export default Header;
