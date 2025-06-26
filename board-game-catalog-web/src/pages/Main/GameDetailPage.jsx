// src/pages/Main/GameDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import { updateCollectionEntry, deleteCollectionEntry } from '../../api/api'; // getGameDetails is no longer needed here

const GameDetailPage = () => {
  const { id: collectionEntryId } = useParams(); // This is the collection entry ID
  const navigate = useNavigate();
  const location = useLocation(); // Use useLocation hook to access state

  // Initialize state from location.state.item (passed from CollectionPage)
  const initialItem = location.state?.item;

  const [gameData, setGameData] = useState(initialItem);
  const [isLoading, setIsLoading] = useState(false); // No longer loading details, as we get them from state
  const [error, setError] = useState(null);
  const [personalNotes, setPersonalNotes] = useState(initialItem?.personal_notes || '');
  const [customTags, setCustomTags] = useState(initialItem?.custom_tags || '');
  const [forSaleTrade, setForSaleTrade] = useState(initialItem?.for_sale_trade || false);
  const [saleTradeNotes, setSaleTradeNotes] = useState(initialItem?.sale_trade_notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // No useEffect to fetch gameDetails needed if always navigated with full item.
  // If you want to enable direct access to /game/:id, you'd re-introduce a fetch
  // but it would need to fetch the UserCollection item, not just general game details.
  // For now, this page assumes it always receives full item data via navigation state.

  const handleUpdateGame = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);
    try {
      const updates = {
        personal_notes: personalNotes,
        custom_tags: customTags,
        for_sale_trade: forSaleTrade,
        sale_trade_notes: saleTradeNotes,
      };
      await updateCollectionEntry(collectionEntryId, updates);
      alert('Game updated successfully!');
      // Update local state to reflect changes without re-fetching everything
      setGameData(prev => ({
        ...prev,
        personal_notes: personalNotes,
        custom_tags: customTags,
        for_sale_trade: forSaleTrade,
        sale_trade_notes: saleTradeNotes,
      }));
    } catch (e) {
      console.error('Error updating game:', e);
      alert(`Failed to update game: ${e.response?.data?.detail || e.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteGame = async () => {
    if (window.confirm(`Are you sure you want to remove "${gameData?.game?.title || 'this game'}" from your collection?`)) {
      try {
        await deleteCollectionEntry(collectionEntryId);
        alert(`${gameData?.game?.title || 'Game'} removed from collection.`);
        navigate('/collection'); // Go back to collection list
      } catch (e) {
        console.error('Error deleting game:', e);
        alert(`Failed to remove game: ${e.response?.data?.detail || e.message}`);
      }
    }
  };

  // If initialItem wasn't provided, this page might not have data
  if (!gameData && !isLoading) {
    return <div className="error-message">Error: Game data not found. Please navigate from your collection.</div>;
  }
  if (isLoading) {
    return <LoadingSpinner message="Loading Game Details..." />;
  }
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const game = gameData.game; // Access the nested game object

  return (
    <div className="main-container game-details-page">
      <h2>{game.title}</h2>
      <img src={game.box_art_url || 'https://via.placeholder.com/300'} alt={game.title} />

      <div className="detail-section">
        <h3>Core Info</h3>
        <p>Publisher: {game.publisher}</p>
        <p>Year Published: {game.year_published}</p>
        <p>Players: {game.min_players}-{game.max_players}</p>
        <p>Playing Time: {game.playing_time_min}-{game.playing_time_max} min</p>
        <p>Recommended Age: {game.recommended_age}+</p>
        <p>BGG Rating: {parseFloat(game.bgg_rating).toFixed(2)} ({game.bgg_num_voters} voters)</p>
        {game.bgg_link && <a href={game.bgg_link} target="_blank" rel="noopener noreferrer">View on BoardGameGeek</a>}
      </div>

      <div className="detail-section">
        <h3>Personal Notes</h3>
        <textarea
          placeholder="Add your personal notes about this game..."
          value={personalNotes}
          onChange={(e) => setPersonalNotes(e.target.value)}
        ></textarea>
      </div>

      <div className="detail-section">
        <h3>Custom Tags (comma-separated)</h3>
        <input
          type="text"
          placeholder="e.g., Strategy, Eurogame, Family"
          value={customTags}
          onChange={(e) => setCustomTags(e.target.value)}
        />
      </div>

      <div className="detail-section">
        <h3>Sale/Trade Status</h3>
        <div className="switch-container">
          <span>Mark for Sale/Trade:</span>
          <input
            type="checkbox"
            checked={forSaleTrade}
            onChange={(e) => setForSaleTrade(e.target.checked)}
          />
        </div>
        {forSaleTrade && (
          <textarea
            placeholder="Notes for sale/trade (e.g., 'Mint condition, $40', 'Looking for Ark Nova')"
            value={saleTradeNotes}
            onChange={(e) => setSaleTradeNotes(e.target.value)}
          ></textarea>
        )}
      </div>

      <div className="button-group">
        <button onClick={handleUpdateGame} disabled={isUpdating}>
          {isUpdating ? 'Updating...' : 'Save Changes'}
        </button>
        <button onClick={handleDeleteGame} style={{ backgroundColor: 'red' }}>
          Remove from Collection
        </button>
      </div>
    </div>
  );
};

export default GameDetailPage;
