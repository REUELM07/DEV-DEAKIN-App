import { Button, Input } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

function SiteHeader() {
  const { currentUser, logout } = useAuth();

  return (
    <header className="site-header">
      <div className="header-container">

        <Link to="/" className="site-logo">
          DEV<span>@</span>Deakin
        </Link>

        <div className="search-area">
          <Input
            fluid
            className="header-search-input"
            placeholder="Search articles, tutorials..."
          />
        </div>

        <div className="header-actions">

          <ThemeToggle />

          <Link to="/post">
            <Button basic className="header-nav-button">
              Post
            </Button>
          </Link>

          <Link to="/browse-posts">
            <Button basic className="header-nav-button">
              Browse Posts
            </Button>
          </Link>

          <Link to="/pricing">
            <Button basic className="header-nav-button">
              Pricing
            </Button>
          </Link>

          {currentUser ? (
            <>
              <span className="welcome-message">
                Welcome, {currentUser.fullName}
              </span>

              <Button className="logout-button" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button basic className="header-nav-button">
                  Login
                </Button>
              </Link>

              <Link to="/signup">
                <Button basic className="header-nav-button">
                  Sign Up
                </Button>
              </Link>
            </>
          )}

        </div>
      </div>
    </header>
  );
}

export default SiteHeader;