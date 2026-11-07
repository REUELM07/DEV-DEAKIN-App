import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import SiteHeader from './components/SiteHeader';
import HeroBanner from './components/HeroBanner';
import ArticleSection from './components/ArticleSection';
import TutorialSection from './components/TutorialSection';
import SubscribeBar from './components/SubscribeBar';
import SiteFooter from './components/SiteFooter';

import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Post from './pages/Post';
import Pricing from './pages/Pricing';
import BrowsePosts from './pages/BrowsePosts';
import DevVault from './pages/DevVault';

import { useAuth } from './contexts/AuthContext';

import CursorFollower from './components/CursorFollower';

import './App.css';

// Load AI Assistant only when the page is opened
const AIAssistant = lazy(() => import('./pages/AIAssistant'));

function Home() {
  return (
    <>
      <HeroBanner />
      <ArticleSection />
      <TutorialSection />
      <SubscribeBar />
    </>
  );
}

// Protect pages that require login
function ProtectedRoute({ children }) {
  const { currentUser, token, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <SiteHeader />

      <CursorFollower />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/post" element={<Post />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/browse-posts" element={<BrowsePosts />} />

        <Route
          path="/devvault"
          element={
            <ProtectedRoute>
              <DevVault />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div>Loading AI Assistant...</div>}>
                <AIAssistant />
              </Suspense>
            </ProtectedRoute>
          }
        />
      </Routes>

      <SiteFooter />
    </BrowserRouter>
  );
}

export default App;