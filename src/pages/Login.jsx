import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import InputOTP from '../components/otp/InputOTP';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const [challengeId, setChallengeId] = useState('');
  const [showOTP, setShowOTP] = useState(false);

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Request an OTP after checking the login details
  async function handleLogin(event) {
    event.preventDefault();
    setMessage('');

    if (!email.trim() || !password) {
      setMessage('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const cleanEmail = email.toLowerCase().trim();

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Unable to log in. Please try again.');
        return;
      }

      setChallengeId(data.challengeId);
      setEmail(cleanEmail);
      setShowOTP(true);

    } catch (error) {
      console.error('Login error:', error);
      setMessage('Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Verify the login OTP
  async function handleOTPVerify(otp) {
    setOtpLoading(true);
    setOtpError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          challengeId: challengeId,
          otp: otp
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setOtpError(data.message || 'Invalid OTP. Please try again.');
        return false;
      }

      // Save the authenticated user and JWT
      login(data.user, data.token);

      // Redirect after the success animation
      setTimeout(() => {
        navigate('/');
      }, 1000);

      return true;

    } catch (error) {
      console.error('OTP verification error:', error);
      setOtpError('Unable to verify OTP. Please try again.');
      return false;
    } finally {
      setOtpLoading(false);
    }
  }

  // Request another login OTP
  async function handleResendOTP() {
    setOtpError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          challengeId: challengeId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setOtpError(data.message || 'Unable to resend OTP.');
        return false;
      }

      return true;

    } catch (error) {
      console.error('Resend OTP error:', error);
      setOtpError('Unable to resend OTP. Please try again.');
      return false;
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        {!showOTP ? (
          <>
            <div className="login-heading">
              <h2>Login to your DEV@Deakin account</h2>
            </div>

            <form className="login-form" onSubmit={handleLogin}>

              <div className="login-field">
                <label htmlFor="email">Your email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="password">Your password</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              {message && (
                <p className="login-message-text">{message}</p>
              )}

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Login'}
              </button>

            </form>

            <div className="signup-message">
              <span>Don't have an account?</span>{' '}
              <Link to="/signup">Sign up</Link>
            </div>
          </>
        ) : (
          <InputOTP
            email={email}
            onVerify={handleOTPVerify}
            onResend={handleResendOTP}
            loading={otpLoading}
            error={otpError}
            expiresIn={300}
          />
        )}

      </div>
    </div>
  );
}

export default Login;