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
      </Routes>

      <SiteFooter />
    </BrowserRouter>
  );
}

export default App;