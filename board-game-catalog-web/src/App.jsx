// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import CollectionPage from './pages/Main/CollectionPage';
import AddGamePage from './pages/Main/AddGamePage';
import GameDetailPage from './pages/Main/GameDetailPage';
import WishlistPage from './pages/Main/WishlistPage';
import AddToWishlistPage from './pages/Main/AddToWishlistPage';
import PublicCollectionPage from './pages/PublicCollectionPage';
import NotFoundPage from './pages/NotFoundPage';
import { AuthProvider, AuthContext } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { userToken, isLoading } = React.useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !userToken) {
      navigate('/login');
    }
  }, [userToken, isLoading, navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return userToken ? children : null;
};

const AppContent = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/collections/:username" element={<PublicCollectionPage />} />

        <Route path="/" element={<PrivateRoute><CollectionPage /></PrivateRoute>} />
        <Route path="/collection" element={<PrivateRoute><CollectionPage /></PrivateRoute>} />
        <Route path="/add-game" element={<PrivateRoute><AddGamePage /></PrivateRoute>} />
        <Route path="/game/:id" element={<PrivateRoute><GameDetailPage /></PrivateRoute>} />
        <Route path="/wishlist" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
        <Route path="/add-to-wishlist" element={<PrivateRoute><AddToWishlistPage /></PrivateRoute>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};


const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
