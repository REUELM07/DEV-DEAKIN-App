import { BrowserRouter, Routes, Route } from 'react-router-dom';

import SiteHeader from './components/SiteHeader';
import HeroBanner from './components/HeroBanner';
import ArticleSection from './components/ArticleSection';
import TutorialSection from './components/TutorialSection';
import SubscribeBar from './components/SubscribeBar';
import SiteFooter from './components/SiteFooter';

import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Post from './pages/Post';

import './App.css';

import CursorFollower from './components/CursorFollower';

import Pricing from './pages/Pricing';
import BrowsePosts from './pages/BrowsePosts';
import { Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import DevVault from './pages/DevVault';


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
        <Route path="/devvault" element={<ProtectedRoute> <DevVault /> </ProtectedRoute>}/>
      </Routes>

      <SiteFooter />
    </BrowserRouter>
  );
}

export default App;