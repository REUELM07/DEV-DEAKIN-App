import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import InputOTP from '../components/otp/InputOTP';
import './SignUp.css';

function SignUp() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [challengeId, setChallengeId] = useState('');
  const [showOTP, setShowOTP] = useState(false);

  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Validate the form and request a registration OTP
  async function handleSignUp(event) {
    event.preventDefault();
    setMessage('');

    const cleanUsername = username.trim();

    if (!fullName.trim() || !cleanUsername || !email.trim() || !password || !confirmPassword) {
      setMessage('Please fill in all fields.');
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
      setMessage('Username must contain 3-20 characters using only letters, numbers and underscores.');
      return;
    }

    if (!email.includes('@')) {
      setMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const cleanEmail = email.toLowerCase().trim();

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          username: cleanUsername,
          email: cleanEmail,
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Unable to create your account.');
        return;
      }

      setChallengeId(data.challengeId);
      setEmail(cleanEmail);
      setShowOTP(true);

    } catch (error) {
      console.error('Sign up error:', error);
      setMessage('Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Verify registration OTP and create the account
  async function handleOTPVerify(otp) {
    setOtpLoading(true);
    setOtpError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register/verify-otp`, {
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

      setMessage('Account verified successfully!');

      setTimeout(() => {
        navigate('/login');
      }, 1500);

      return true;

    } catch (error) {
      console.error('Registration OTP error:', error);
      setOtpError('Unable to verify OTP. Please try again.');
      return false;
    } finally {
      setOtpLoading(false);
    }
  }

  // Request another registration OTP
  async function handleResendOTP() {
    setOtpError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register/resend-otp`, {
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
    <div className="signup-page">
      <div className="signup-card">

        {!showOTP ? (
          <>
            <div className="signup-heading">
              <h1>Create your account</h1>
            </div>

            <form className="signup-form" onSubmit={handleSignUp}>

              <div className="signup-field">
                <label htmlFor="fullName">Full name</label>
                <input
                  type="text"
                  id="fullName"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                />
              </div>

              <div className="signup-field">
                <label htmlFor="signupUsername">Username</label>
                <input
                  type="text"
                  id="signupUsername"
                  placeholder="Choose a username (e.g. reuel_dev)"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  minLength={3}
                  maxLength={20}
                  required
                />
                <small>3-20 characters. Letters, numbers and underscores only.</small>
              </div>

              <div className="signup-field">
                <label htmlFor="signupEmail">Email address</label>
                <input
                  type="email"
                  id="signupEmail"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="signup-field">
                <label htmlFor="signupPassword">Password</label>
                <input
                  type="password"
                  id="signupPassword"
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <div className="signup-field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Enter your password again"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>

              {message && (
                <p className="signup-message-text">{message}</p>
              )}

              <button
                type="submit"
                className="signup-button"
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Create Account'}
              </button>

            </form>

            <div className="login-message">
              <span>Already have an account?</span>{' '}
              <Link to="/login">Login</Link>
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

export default SignUp;