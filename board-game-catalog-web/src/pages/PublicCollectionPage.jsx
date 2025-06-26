// src/pages/Public/PublicCollectionPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicCollection, getPublicWishlist } from '../api/api'; // FIX: Changed path from "../../api/api"
import LoadingSpinner from '../components/LoadingSpinner'; // FIX: Changed path from "../../components/LoadingSpinner"

const PublicCollectionPage = () => {
  const { username } = useParams();
  const [collection, setCollection] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [collectionResponse, wishlistResponse] = await Promise.all([
          getPublicCollection(username),
          getPublicWishlist(username)
        ]);
        setCollection(collectionResponse.data);
        setWishlist(wishlistResponse.data);
      } catch (e) {
        console.error('Failed to fetch public profile:', e);
        setError(`Failed to load ${username}'s profile. It might be private or not exist.`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [username]);

  if (isLoading) {
    return <LoadingSpinner message={`Loading ${username}'s profile...`} />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="public-profile-container">
      <h1>{username}'s Board Game Collection</h1>

      <h2 className="section-title">Owned Games</h2>
      {collection.length === 0 ? (
        <p className="empty-message">No owned games to display (or collection is private).</p>
      ) : (
        <div className="game-grid">
          {collection.map((item) => (
            <div key={item.id} className="game-card">
              <img src={item.game?.thumbnail_url || 'https://via.placeholder.com/100'} alt={item.game?.title || 'Game Thumbnail'} />
              <h4>{item.game?.title || 'Unknown'}</h4>
              {item.game?.bgg_rating && <p className="bgg-rating">BGG: {parseFloat(item.game.bgg_rating).toFixed(2)}</p>}
              {item.for_sale_trade && (
                <p className="sale-trade">FOR SALE/TRADE!</p>
              )}
              {item.sale_trade_notes && <p className="sale-trade-notes">{item.sale_trade_notes}</p>}
            </div>
          ))}
        </div>
      )}

      <h2 className="section-title">Wishlist</h2>
      {wishlist.length === 0 ? (
        <p className="empty-message">No wishlist items to display (or wishlist is private).</p>
      ) : (
        <div className="game-grid">
          {wishlist.map((item) => (
            <div key={item.id} className="game-card">
              <h3>{item.game?.title || 'Unknown Title'}</h3>
              <img src={item.game?.thumbnail_url || 'https://via.placeholder.com/100'} alt={item.game?.title || 'Game Thumbnail'} />
              {item.priority && <p>Priority: {item.priority}</p>}
              {item.notes && <p>{item.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicCollectionPage;
