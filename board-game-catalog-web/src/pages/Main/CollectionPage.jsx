// src/pages/Main/CollectionPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getUserCollection, deleteCollectionEntry } from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom';

const CollectionPage = () => {
  const { currentUser } = useAuth();
  const [collection, setCollection] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCollection = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getUserCollection();
      setCollection(response.data);
    } catch (e) {
      console.error('Failed to fetch collection:', e);
      setError('Failed to load collection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchCollection();
    }
  }, [currentUser]);

  const handleDelete = async (entryId, gameTitle) => {
    if (window.confirm(`Are you sure you want to remove "${gameTitle}" from your collection?`)) {
      try {
        await deleteCollectionEntry(entryId);
        alert(`${gameTitle} removed from collection.`);
        fetchCollection(); // Refresh the list
      } catch (e) {
        console.error('Error deleting collection entry:', e);
        alert(`Failed to remove game from collection: ${e.response?.data?.detail || e.message}`);
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading Collection..." />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="main-container">
      <div className="header">
        <h2>My Board Game Collection</h2>
        <Link to="/add-game"><button className="add-button">Add New Game</button></Link>
        <Link to="/wishlist"><button className="wishlist-button">Go to Wishlist</button></Link>
      </div>

      {collection.length === 0 ? (
        <p className="empty-message">Your collection is empty. Add some games!</p>
      ) : (
        <div className="collection-list">
          {collection.map((item) => (
            <div key={item.id} className="game-item">
              <Link to={`/game/${item.id}`} state={{ item: item }} style={{ textDecoration: 'none' }}> {/* Pass full item via state */}
                <h3>{item.game?.title || 'Unknown Title'}</h3>
                <img src={item.game?.thumbnail_url || 'https://via.placeholder.com/150'} alt={item.game?.title || 'Game Thumbnail'} />
                <p>Players: {item.game?.min_players}-{item.game?.max_players}</p>
                <p>Playing Time: {item.game?.playing_time_min}-{item.game?.playing_time_max} min</p>
                {item.personal_notes && <p>Notes: {item.personal_notes}</p>}
                {item.custom_tags && <p>Tags: {item.custom_tags}</p>}
                {item.for_sale_trade && <p className="for-sale-trade">FOR SALE/TRADE!</p>}
              </Link>
              <button onClick={() => handleDelete(item.id, item.game?.title)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionPage;
