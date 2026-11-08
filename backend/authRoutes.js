import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './firebaseAdmin.js';
import { verifyToken } from './authMiddleware.js';
import { sendOTPEmail, sendWelcomeEmail } from './emailService.js';
import {
  generateOTP,
  hashOTP,
  verifyOTPHash,
  getOTPSettings,
  generateChallengeId
} from './otpService.js';

const router = express.Router();

const challenges = db.collection('otpChallenges');
const users = db.collection('users');

const OTP_COOLDOWN = 30 * 1000;
const MAX_RESENDS = 3;

// Create and email a new OTP challenge
async function createChallenge(details) {
  const {
  email,
  type,
  fullName = '',
  username = '',
  usernameLower = '',
  passwordHash = '',
  userId = ''
} = details;

  // Limit repeated OTP requests for the same email and purpose
  const recentRequests = await challenges
    .where('email', '==', email)
    .where('type', '==', type)
    .where('createdAt', '>', Date.now() - 15 * 60 * 1000)
    .get();

  if (recentRequests.size >= 3) {
    throw new Error('Too many OTP requests. Please try again later.');
  }

  const challengeId = generateChallengeId();
  const otp = generateOTP();
  const settings = getOTPSettings();

  await challenges.doc(challengeId).set({
    email,
    type,
    fullName,
    username,
    usernameLower,
    passwordHash,
    userId,
    otpHash: hashOTP(otp, challengeId),
    expiresAt: settings.expiryTime,
    attempts: 0,
    maxAttempts: settings.maxAttempts,
    resends: 0,
    resendAfter: Date.now() + OTP_COOLDOWN,
    createdAt: Date.now(),
    consumed: false
  });

  try {
    await sendOTPEmail(email, otp, type);
  } catch (error) {
    await challenges.doc(challengeId).delete();
    throw new Error('Unable to send OTP. Please try again.');
  }

  return challengeId;
}

// Verify an OTP and update its challenge securely
async function verifyChallenge(challengeId, enteredOTP, expectedType) {
  const challengeRef = challenges.doc(challengeId);

  return db.runTransaction(async (transaction) => {
    const challengeDocument = await transaction.get(challengeRef);

    if (!challengeDocument.exists) {
      throw new Error('Invalid or expired verification request.');
    }

    const challenge = challengeDocument.data();

    if (challenge.type !== expectedType || challenge.consumed) {
      throw new Error('Invalid or expired verification request.');
    }

    if (Date.now() > challenge.expiresAt) {
      throw new Error('Your OTP has expired. Please request a new one.');
    }

    if (challenge.attempts >= challenge.maxAttempts) {
      throw new Error('Too many incorrect attempts. Request a new OTP.');
    }

    const correctOTP = verifyOTPHash(
      enteredOTP,
      challenge.otpHash,
      challengeId
    );

    if (!correctOTP) {
      transaction.update(challengeRef, {
        attempts: challenge.attempts + 1
      });

      return { success: false };
    }

    transaction.update(challengeRef, {
      consumed: true,
      consumedAt: Date.now()
    });

    return {
      success: true,
      challenge
    };
  });
}

// Registration: send verification OTP
router.post('/register', async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    if (!fullName || !username || !email || !password) {
      return res.status(400).json({
        message: 'Please provide your name, username, email and password.'
      });
    }

    const cleanName = fullName.trim();
    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.trim();
    const usernameLower = cleanUsername.toLowerCase();

    // Validate username
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
      return res.status(400).json({
        message: 'Username must contain 3-20 characters using only letters, numbers and underscores.'
      });
    }

    // Validate name and email
    if (
      !cleanName ||
      cleanName.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return res.status(400).json({
        message: 'Please enter a valid name and email address.'
      });
    }

    // Validate password
    if (password.length < 6 || password.length > 128) {
      return res.status(400).json({
        message: 'Password must contain between 6 and 128 characters.'
      });
    }

    // Check whether email already exists
    const existingUsers = await users
      .where('email', '==', cleanEmail)
      .limit(1)
      .get();

    if (!existingUsers.empty) {
      return res.status(409).json({
        message: 'An account with this email already exists.'
      });
    }

    // Check whether username already exists
    const existingUsername = await users
      .where('usernameLower', '==', usernameLower)
      .limit(1)
      .get();

    if (!existingUsername.empty) {
      return res.status(409).json({
        message: 'This username is already taken. Please choose another.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const challengeId = await createChallenge({
      email: cleanEmail,
      type: 'registration',
      fullName: cleanName,
      username: cleanUsername,
      usernameLower: usernameLower,
      passwordHash: hashedPassword
    });

    return res.status(200).json({
      message: 'Verification code sent to your email.',
      challengeId,
      expiresIn: 300
    });

  } catch (error) {
    console.error('Registration OTP error:', error.message);

    return res.status(500).json({
      message: error.message || 'Unable to start registration.'
    });
  }
});

// Registration: verify OTP and create account
router.post('/register/verify-otp', async (req, res) => {
  try {
    const { challengeId, otp } = req.body;

    if (
      typeof challengeId !== 'string' ||
      typeof otp !== 'string' ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        message: 'Please enter a valid six-digit OTP.'
      });
    }

    const result = await verifyChallenge(
      challengeId,
      otp,
      'registration'
    );

    if (!result.success) {
      return res.status(400).json({
        message: 'Incorrect OTP. Please try again.'
      });
    }

    const challenge = result.challenge;

    const existingUsers = await users
      .where('email', '==', challenge.email)
      .limit(1)
      .get();

    if (!existingUsers.empty) {
      return res.status(409).json({
        message: 'An account with this email already exists.'
      });
    }

    const userRef = users.doc();

    await userRef.set({
      fullName: challenge.fullName,
      username: challenge.username,
      usernameLower: challenge.usernameLower,
      email: challenge.email,
      password: challenge.passwordHash,
      subscription: 'Free',
      createdAt: new Date().toISOString()
    });

    // Send welcome email after successful registration
    await sendWelcomeEmail(
      challenge.email,
      challenge.fullName
    );

    return res.status(201).json({
      message: 'Email verified! Your account has been created.'
    });

  } catch (error) {
    console.error('Registration verification error:', error.message);

    return res.status(500).json({
      message: error.message || 'Unable to verify your email.'
    });
  }
});

// Login: verify password and send OTP
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Please enter your email and password.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const userResults = await users
      .where('email', '==', cleanEmail)
      .limit(1)
      .get();

    if (userResults.empty) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    const userDocument = userResults.docs[0];
    const userData = userDocument.data();

    const passwordMatch = await bcrypt.compare(
      password,
      userData.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    const challengeId = await createChallenge({
      email: cleanEmail,
      type: 'login',
      userId: userDocument.id
    });

    return res.json({
      message: 'Login verification code sent to your email.',
      requiresOtp: true,
      challengeId,
      expiresIn: 300
    });

  } catch (error) {
    console.error('Login OTP error:', error.message);

    return res.status(500).json({
      message: error.message || 'Unable to start login.'
    });
  }
});

// Login: verify OTP and issue JWT
router.post('/login/verify-otp', async (req, res) => {
  try {
    const { challengeId, otp } = req.body;

    if (
      typeof challengeId !== 'string' ||
      typeof otp !== 'string' ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        message: 'Please enter a valid six-digit OTP.'
      });
    }

    const result = await verifyChallenge(
      challengeId,
      otp,
      'login'
    );

    if (!result.success) {
      return res.status(400).json({
        message: 'Incorrect OTP. Please try again.'
      });
    }

    const challenge = result.challenge;

    const userDocument = await users.doc(challenge.userId).get();

    if (!userDocument.exists) {
      return res.status(404).json({
        message: 'User account not found.'
      });
    }

    const userData = userDocument.data();

    const token = jwt.sign(
      {
        userId: userDocument.id,
        email: userData.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
      }
    );

    return res.json({
      message: 'Login successful.',
      token,
      user: {
      id: userDocument.id,
      fullName: userData.fullName || userData.name || '',
      username: userData.username || '',
      email: userData.email,
      subscription: userData.subscription || 'Free'
    }
    });

  } catch (error) {
    console.error('Login verification error:', error.message);

    return res.status(500).json({
      message: error.message || 'Unable to verify login.'
    });
  }
});

// Resend OTP for registration or login
async function resendOTP(req, res, expectedType) {
  try {
    const { challengeId } = req.body;

    if (typeof challengeId !== 'string') {
      return res.status(400).json({
        message: 'Invalid verification request.'
      });
    }

    const challengeRef = challenges.doc(challengeId);

    const challengeDocument = await challengeRef.get();

    if (!challengeDocument.exists) {
      return res.status(404).json({
        message: 'Verification request not found.'
      });
    }

    const challenge = challengeDocument.data();

    if (
      challenge.type !== expectedType ||
      challenge.consumed ||
      Date.now() > challenge.expiresAt
    ) {
      return res.status(400).json({
        message: 'This verification request has expired.'
      });
    }

    if (challenge.resends >= MAX_RESENDS) {
      return res.status(429).json({
        message: 'Maximum resend limit reached. Please start again.'
      });
    }

    if (Date.now() < challenge.resendAfter) {
      return res.status(429).json({
        message: 'Please wait before requesting another OTP.'
      });
    }

    const otp = generateOTP();
    const settings = getOTPSettings();

    await challengeRef.update({
      otpHash: hashOTP(otp, challengeId),
      expiresAt: settings.expiryTime,
      attempts: 0,
      resends: challenge.resends + 1,
      resendAfter: Date.now() + OTP_COOLDOWN
    });

    await sendOTPEmail(
      challenge.email,
      otp,
      expectedType
    );

    return res.json({
      message: 'A new verification code has been sent.',
      expiresIn: 300
    });

  } catch (error) {
    console.error('OTP resend error:', error.message);

    return res.status(500).json({
      message: 'Unable to resend OTP. Please try again.'
    });
  }
}

router.post('/register/resend-otp', (req, res) => {
  return resendOTP(req, res, 'registration');
});

router.post('/login/resend-otp', (req, res) => {
  return resendOTP(req, res, 'login');
});

// Get the current logged-in user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userDocument = await users.doc(req.user.userId).get();

    if (!userDocument.exists) {
      return res.status(404).json({
        message: 'User account not found.'
      });
    }

    const userData = userDocument.data();

    return res.json({
      user: {
        id: userDocument.id,
        fullName: userData.fullName || userData.name || '',
        username: userData.username || '',
        email: userData.email,
        subscription: userData.subscription || 'Free'
      }
    });

  } catch (error) {
    console.error('User lookup error:', error.message);

    return res.status(500).json({
      message: 'Unable to retrieve your account.'
    });
  }
});

export default router;