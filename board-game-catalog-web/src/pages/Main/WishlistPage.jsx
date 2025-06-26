// src/pages/Main/WishlistPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getUserWishlist, deleteWishlistEntry, addGameToCollection } from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom';

const WishlistPage = () => {
  const { currentUser } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getUserWishlist();
      setWishlist(response.data);
    } catch (e) {
      console.error('Failed to fetch wishlist:', e);
      setError('Failed to load wishlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchWishlist();
    }
  }, [currentUser]);

  const handleDelete = async (entryId, gameTitle) => {
    if (window.confirm(`Are you sure you want to remove "${gameTitle}" from your wishlist?`)) {
      try {
        await deleteWishlistEntry(entryId);
        alert(`${gameTitle} removed from wishlist.`);
        fetchWishlist(); // Refresh the list
      } catch (e) {
        console.error('Error deleting wishlist entry:', e);
        alert(`Failed to remove game from wishlist: ${e.response?.data?.detail || e.message}`);
      }
    }
  };

  const handleMoveToCollection = async (wishlistEntryId, gameBggId, gameTitle) => {
    if (window.confirm(`Are you sure you want to move "${gameTitle}" to your owned collection?`)) {
      try {
        await addGameToCollection(gameBggId, '', '');
        await deleteWishlistEntry(wishlistEntryId);
        alert(`${gameTitle} moved to your collection!`);
        fetchWishlist(); // Refresh wishlist
      } catch (e) {
        console.error('Error moving to collection:', e);
        alert(`Failed to move game to collection: ${e.response?.data?.detail || e.message}`);
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading Wishlist..." />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="main-container">
      <div className="header">
        <h2>My Wishlist</h2>
        <Link to="/add-to-wishlist"><button className="add-button">Add to Wishlist</button></Link>
      </div>

      {wishlist.length === 0 ? (
        <p className="empty-message">Your wishlist is empty. Add some games!</p>
      ) : (
        <div className="wishlist-list">
          {wishlist.map((item) => (
            <div key={item.id} className="game-item">
              <h3>{item.game?.title || 'Unknown Title'}</h3>
              <img src={item.game?.thumbnail_url || 'https://via.placeholder.com/150'} alt={item.game?.title || 'Game Thumbnail'} />
              {item.priority && <p>Priority: {item.priority}</p>}
              {item.notes && <p>Notes: {item.notes}</p>}
              <button onClick={() => handleMoveToCollection(item.id, item.game?.bgg_id, item.game?.title)}>Move to Owned</button>
              <button onClick={() => handleDelete(item.id, item.game?.title)} style={{ backgroundColor: 'red' }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
