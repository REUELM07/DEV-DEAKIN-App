import crypto from 'node:crypto';

const OTP_LENGTH = 6;
const OTP_EXPIRY = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const otpSecret = process.env.OTP_HASH_SECRET || process.env.JWT_SECRET;

if (!otpSecret) {
  throw new Error('OTP_HASH_SECRET or JWT_SECRET must be configured.');
}

// Generate a six-digit OTP
export function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString().padStart(OTP_LENGTH, '0');
}

// Create a secure hash of the OTP
export function hashOTP(otp, challengeId) {
  return crypto
    .createHmac('sha256', otpSecret)
    .update(`${challengeId}:${otp}`)
    .digest('hex');
}

// Check whether the entered OTP matches
export function verifyOTPHash(enteredOTP, savedHash, challengeId) {
  const enteredHash = hashOTP(enteredOTP, challengeId);

  const savedBuffer = Buffer.from(savedHash, 'hex');
  const enteredBuffer = Buffer.from(enteredHash, 'hex');

  if (savedBuffer.length !== enteredBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(savedBuffer, enteredBuffer);
}

// Return OTP settings
export function getOTPSettings() {
  return {
    expiryTime: Date.now() + OTP_EXPIRY,
    maxAttempts: MAX_ATTEMPTS
  };
}

// Generate a unique challenge ID
export function generateChallengeId() {
  return crypto.randomUUID();
}