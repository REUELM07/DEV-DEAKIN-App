import express from 'express';
import { db } from './firebaseAdmin.js';
import { verifyToken } from './authMiddleware.js';

const router = express.Router();

//upgrade the user's subscription
router.post('/upgrade', verifyToken, async (req, res) => {
  try {
    //get the logged-in user's ID from the verified token
    const userId = req.user.userId;

    //find the user in Firestore
    const userRef = db.collection('users').doc(userId);
    const userDocument = await userRef.get();

    if (!userDocument.exists) {
      return res.status(404).json({
        message: 'User account not found.'
      });
    }

    const userData = userDocument.data();

    //prevent users from upgrading twice
    if (userData.subscription === 'Paid') {
      return res.status(400).json({
        message: 'You already have a Paid subscription.'
      });
    }

    //update the subscription
    await userRef.update({
      subscription: 'Paid',
      subscriptionUpdatedAt: new Date().toISOString()
    });

    return res.json({
      message: 'Subscription upgraded successfully.',
      user: {
        id: userDocument.id,
        fullName: userData.fullName || userData.name || '',
        email: userData.email,
        subscription: 'Paid'
      }
    });
  } catch (error) {
    console.error('Subscription upgrade error:', error.message);

    return res.status(500).json({
      message: 'Unable to upgrade your subscription.'
    });
  }
});

export default router;