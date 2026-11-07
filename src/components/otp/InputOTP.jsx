import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import ParticleSphere from './ParticleSphere';
import '../styles/InputOTP.css';

function InputOTP({
  email = '',
  onVerify,
  onResend,
  loading = false,
  error = '',
  expiresIn = 300
}) {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(expiresIn);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);

  const inputRef = useRef(null);

  // Update the countdown timer
  useEffect(() => {
    if (timer <= 0) return;

    const countdown = setInterval(() => {
      setTimer((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);

  // Clear OTP when an error is received
  useEffect(() => {
    setOtp('');
    setVerified(false);
  }, [error]);

  // Accept only six numeric digits
  function handleChange(event) {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(digits);
  }

  // Submit OTP for backend verification
  async function handleSubmit(event) {
    event.preventDefault();

    if (otp.length !== 6 || loading || verified || timer === 0) {
      return;
    }

    if (onVerify) {
      const result = await onVerify(otp);

      // Show success animation only after backend verification
      if (result === true) {
        setVerified(true);
      }
    }
  }

  // Request another OTP
  async function handleResend() {
    if (!onResend || loading || resending) return;

    setResending(true);

    try {
      const result = await onResend();

      if (result !== false) {
        setOtp('');
        setTimer(expiresIn);
        setVerified(false);
        inputRef.current?.focus();
      }
    } finally {
      setResending(false);
    }
  }

  // Format the remaining time
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds
    ).padStart(2, '0')}`;
  }

  return (
    <div className="otp-card">

      <div className="otp-glow otp-glow-top" />
      <div className="otp-glow otp-glow-bottom" />

      <div className="otp-content">

        <div className="otp-sphere-container">

          <div className="otp-ring otp-ring-one" />
          <div className="otp-ring otp-ring-two" />
          <div className="otp-ring otp-ring-three" />

          <div className="otp-sphere">
            <ParticleSphere />
          </div>

          <AnimatePresence>
            {verified && (
              <motion.div
                className="otp-success-overlay"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <ShieldCheck size={42} />
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        <div className="otp-heading">

          <h2>
            {verified ? 'VERIFICATION COMPLETE' : 'ENTER CREDENTIALS'}
          </h2>

          <p>
            {verified
              ? 'Your identity has been successfully verified.'
              : `Enter the 6-digit verification code sent to ${email || 'your email address'}.`}
          </p>

        </div>

        <form onSubmit={handleSubmit} className="otp-form">

          <div
            className="otp-input-container"
            onClick={() => inputRef.current?.focus()}
          >

            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={handleChange}
              disabled={loading || verified || timer === 0}
              aria-label="Six-digit verification code"
              className="otp-hidden-input"
            />

            {Array.from({ length: 6 }).map((_, index) => {

              const digit = otp[index] || '';

              return (
                <div
                  key={index}
                  className={`otp-slot ${
                    index === otp.length ? 'otp-slot-active' : ''
                  } ${verified ? 'otp-slot-success' : ''}`}
                >

                  <AnimatePresence mode="popLayout">

                    {digit && (
                      <motion.span
                        key={`${index}-${digit}`}
                        initial={{ opacity: 0, scale: 0.5, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                      >
                        {digit}
                      </motion.span>
                    )}

                  </AnimatePresence>

                </div>
              );
            })}

          </div>

          <div className="otp-status">
            {otp.length === 0
              ? 'AWAITING VERIFICATION CODE'
              : `ENTERED ${otp.length} / 6 DIGITS`}
          </div>

          {error && (
            <p className="otp-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="otp-verify-button"
            disabled={otp.length !== 6 || loading || verified || timer === 0}
          >
            {loading ? 'Verifying...' : verified ? 'Verified' : 'Verify Code'}
          </button>

        </form>

        <div className="otp-footer">

          <span className={timer === 0 ? 'otp-expired' : ''}>
            {timer === 0
              ? 'CODE EXPIRED'
              : `EXPIRES IN ${formatTime(timer)}`}
          </span>

          <button
            type="button"
            onClick={handleResend}
            disabled={loading || resending || verified}
            className="otp-resend-button"
          >
            <RefreshCw size={14} />
            {resending ? 'Sending...' : 'Resend Code'}
          </button>

        </div>

      </div>
    </div>
  );
}

export default InputOTP;