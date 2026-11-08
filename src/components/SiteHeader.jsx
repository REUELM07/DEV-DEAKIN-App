import { Button, Input } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

function SiteHeader() {
  const { currentUser, logout } = useAuth();

  return (
    <header className="site-header">
      <div className="header-container">

        {/* First row: Brand, search and a small community highlight */}
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

        <div className="header-spotlight">
          <span className="spotlight-dot"></span>
          <div>
            <strong>THE DEVELOPER SPACE</strong>
            <span>Learn something. Build something.</span>
          </div>
          <span className="spotlight-spark">✦</span>
        </div>

        {/* Second row: Navigation and account actions */}
        <div className="header-actions">

          {currentUser ? (
            <div className="header-context header-context-logged">
              <span className="context-icon">✦</span>
              <span>
                <strong>Keep building.</strong>
                <small>Your developer community is ready.</small>
              </span>
            </div>
          ) : (
            <div className="header-context header-context-guest">
              <span className="context-lock">✧</span>
              <span>
                Want to unlock <strong>AI Assistant, DevVault &amp; DevConnect?</strong>
                {' '}<Link to="/signup">Sign up</Link> or <Link to="/login">log in</Link>.
              </span>
            </div>
          )}

          <div className="header-nav-group">
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

            {currentUser && (
              <>
                <Link to="/ai-assistant">
                  <Button basic className="header-nav-button">
                    AI Assistant
                  </Button>
                </Link>

                <Link to="/devvault">
                  <Button basic className="header-nav-button">
                    DevVault
                  </Button>
                </Link>

                <Link to="/devconnect">
                  <Button basic className="header-nav-button">
                    DevConnect
                  </Button>
                </Link>
              </>
            )}

            {currentUser ? (
              <>
                <span className="welcome-message">
                  Welcome, {currentUser.fullName || currentUser.username || 'Developer'}
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
                  <Button basic className="header-nav-button signup-nav-button">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
