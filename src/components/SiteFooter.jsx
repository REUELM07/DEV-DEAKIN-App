import { Icon } from 'semantic-ui-react';

function SiteFooter() {
  return (
    <footer className="site-footer">

      <div className="footer-section">
        <h3>Explore</h3>
        <p>Articles</p>
        <p>Tutorials</p>
        <p>About DEV@Deakin</p>
      </div>

      <div className="footer-section">
        <h3>Support</h3>
        <p>Help</p>
        <p>Contact Us</p>
        <p>Feedback</p>
      </div>

      <div className="footer-section">
        <h3>Stay Connected</h3>

        <div className="social-icons">
          <a href="https://github.com/" target="_blank" rel="noreferrer">
            <Icon name="github" />
          </a>

          <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
            <Icon name="linkedin" />
          </a>

          <Icon name="instagram" />
          <Icon name="facebook" />
        </div>

      </div>

    </footer>
  );
}

export default SiteFooter;