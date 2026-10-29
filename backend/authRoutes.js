import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './firebaseAdmin.js';
import { verifyToken } from './authMiddleware.js';

const router = express.Router();

//register a new user
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: 'Please provide your name, email and password.'
      });
    }

    const cleanName = fullName.trim();
    const cleanEmail = email.toLowerCase().trim();

    if (!cleanName || !cleanEmail.includes('@')) {
      return res.status(400).json({
        message: 'Please enter a valid name and email address.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters.'
      });
    }

    const existingUsers = await db.collection('users')
      .where('email', '==', cleanEmail)
      .limit(1)
      .get();

    if (!existingUsers.empty) {
      return res.status(409).json({
        message: 'An account with this email already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRef = await db.collection('users').add({
      fullName: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      subscription: 'Free',
      createdAt: new Date().toISOString()
    });

    const token = jwt.sign(
      {
        userId: userRef.id,
        email: cleanEmail
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
      }
    );

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: userRef.id,
        fullName: cleanName,
        email: cleanEmail,
        subscription: 'Free'
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);

    return res.status(500).json({
      message: 'Unable to create your account.'
    });
  }
});

//login an existing user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Please enter your email and password.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const userResults = await db.collection('users')
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
        email: userData.email,
        subscription: userData.subscription || 'Free'
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);

    return res.status(500).json({
      message: 'Unable to log in.'
    });
  }
});

//get the current logged-in user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userDocument = await db.collection('users')
      .doc(req.user.userId)
      .get();

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