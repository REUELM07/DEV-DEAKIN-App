import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './firebaseAdmin.js';
import postRoutes from './postRoutes.js';
import authRoutes from './authRoutes.js';
import subscriptionRoutes from './subscriptionRoutes.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//allow requests from the react website
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));

//read json request data
app.use(express.json());

//check whether the backend is running
app.get('/api/health', (req, res) => {
  res.json({
    message: 'Subscription backend is running successfully.'
  });
});

//check the firestore connection
app.get('/api/firebase-test', async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').limit(1).get();

    res.json({
      message: 'Firebase Admin SDK connected successfully.',
      usersCollectionAccessible: true,
      sampleUserFound: !usersSnapshot.empty
    });
  } catch (error) {
    console.error('Firebase connection error:', error.message);

    res.status(500).json({
      message: 'Unable to connect to Firebase.'
    });
  }
});

app.use('/api/posts', postRoutes);

//connect the authentication routes
app.use('/api/auth', authRoutes);

//connect the subscription routes
app.use('/api/subscription', subscriptionRoutes);

//start the backend server
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});