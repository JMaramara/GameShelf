// src/pages/Main/AddGamePage.jsx
import React, { useState } from 'react';
import { searchBGG, addGameToCollection } from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const AddGamePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    if (searchQuery.length < 2) {
      alert('Please enter at least 2 characters for search.');
      return;
    }
    setIsLoadingSearch(true);
    try {
      const response = await searchBGG(searchQuery);
      setSearchResults(response.data);
      if (response.data.length === 0) {
        setError(`No games found for "${searchQuery}".`);
      }
    } catch (e) {
      console.error('BGG Search Error:', e);
      setError(`Failed to search BoardGameGeek: ${e.response?.data?.detail || e.message}`);
      setSearchResults([]);
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const handleAddGame = async (bggId, gameTitle) => {
    if (window.confirm(`Add "${gameTitle}" to your collection?`)) {
      setIsAddingGame(true);
      setError(null);
      try {
        await addGameToCollection(bggId, '', '');
        alert(`${gameTitle} added to your collection!`);
        navigate('/collection');
      } catch (e) {
        console.error('Add Game to Collection Error:', e);
        alert(`Failed to add game to collection: ${e.response?.data?.detail || e.message}`);
      } finally {
        setIsAddingGame(false);
      }
    }
  };

  return (
    <div className="main-container">
      <h2>Add New Game</h2>
      <form onSubmit={handleSearch} className="add-game-form">
        <input
          type="text"
          placeholder="Search by game title (e.g., Catan, Wingspan)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" disabled={isLoadingSearch || isAddingGame}>
          {isLoadingSearch ? 'Searching...' : 'Search BoardGameGeek'}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}
      {isAddingGame && <LoadingSpinner message="Adding game..." />}

      {searchResults.length > 0 && (
        <div>
          <h3>Search Results:</h3>
          {searchResults.map((game) => (
            <div key={game.bgg_id} className="game-search-result">
              <img src={game.thumbnail_url || 'https://via.placeholder.com/80'} alt={game.title} />
              <div className="info">
                <h4>{game.title}</h4>
                {game.year_published && <p>Year: {game.year_published}</p>}
                <button onClick={() => handleAddGame(game.bgg_id, game.title)} disabled={isAddingGame}>Add to Collection</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddGamePage;
