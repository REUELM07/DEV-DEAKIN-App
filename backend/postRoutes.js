import express from 'express';
import { db } from './firebaseAdmin.js';
import { verifyToken, optionalAuth } from './authMiddleware.js';

const router = express.Router();

// get posts according to the user's subscription
router.get('/', optionalAuth, async (req, res) => {
  try {
    let userSubscription = 'Free';

    // check the subscription of a logged-in user
    if (req.user) {
      const userId = req.user.userId;

      const userDocument = await db
        .collection('users')
        .doc(userId)
        .get();

      if (!userDocument.exists) {
        return res.status(404).json({
          message: 'User account not found.'
        });
      }

      const userData = userDocument.data();

      // get the subscription from firestore
      userSubscription =
        userData.subscription === 'Paid' ? 'Paid' : 'Free';
    }

    // retrieve posts from firestore
    const postsSnapshot = await db.collection('posts').get();

    // prepare the posts the user is allowed to see
    const posts = [];

    postsSnapshot.forEach((document) => {
      const postData = document.data();

      // treat older posts without a plan as Free
      const postPlan = postData.postPlan || 'Free';

      // only paid users can see Paid posts
      if (
        userSubscription === 'Paid' ||
        postPlan === 'Free'
      ) {
        posts.push({
          id: document.id,
          ...postData,
          postPlan: postPlan
        });
      }
    });

    // show the newest posts first
    posts.sort((firstPost, secondPost) => {
      const firstDate = new Date(firstPost.createdAt || 0).getTime();
      const secondDate = new Date(secondPost.createdAt || 0).getTime();

      return secondDate - firstDate;
    });

    return res.status(200).json({
      posts: posts
    });

  } catch (error) {
    console.error('Post retrieval error:', error.message);

    return res.status(500).json({
      message: 'Unable to retrieve posts. Please try again.'
    });
  }
});

// save a new post
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      postType,
      postPlan,
      title,
      description,
      abstractText,
      articleText,
      tags
    } = req.body;

    // validate the post type
    if (!['Question', 'Article'].includes(postType)) {
      return res.status(400).json({
        message: 'Please select a valid post type.'
      });
    }

    // validate the post plan
    if (!['Free', 'Paid'].includes(postPlan)) {
      return res.status(400).json({
        message: 'Please select a valid post plan.'
      });
    }

    // validate the title
    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        message: 'Please enter a title.'
      });
    }

    // validate the tags
    if (!Array.isArray(tags) || tags.length === 0 || tags.length > 3) {
      return res.status(400).json({
        message: 'Please provide between 1 and 3 tags.'
      });
    }

    if (
      !tags.every(tag =>
        typeof tag === 'string' && tag.trim() !== ''
      )
    ) {
      return res.status(400).json({
        message: 'All tags must contain valid text.'
      });
    }

    // validate the question content
    if (
      postType === 'Question' &&
      (typeof description !== 'string' || !description.trim())
    ) {
      return res.status(400).json({
        message: 'Please describe your question.'
      });
    }

    // validate the article content
    if (
      postType === 'Article' &&
      (
        typeof abstractText !== 'string' ||
        !abstractText.trim() ||
        typeof articleText !== 'string' ||
        !articleText.trim()
      )
    ) {
      return res.status(400).json({
        message: 'Please provide the article abstract and content.'
      });
    }

    // prepare the post data
    const post = {
      postType,
      postPlan,
      title: title.trim(),
      description: typeof description === 'string'
        ? description.trim()
        : '',
      abstractText: typeof abstractText === 'string'
        ? abstractText.trim()
        : '',
      articleText: typeof articleText === 'string'
        ? articleText.trim()
        : '',
      tags: tags.map(tag => tag.trim()),
      authorId: req.user.userId,
      createdAt: new Date().toISOString()
    };

    // save the post in firestore
    const postRef = await db.collection('posts').add(post);

    return res.status(201).json({
      message: 'Your post has been submitted successfully!',
      postId: postRef.id
    });

  } catch (error) {
    console.error('Post creation error:', error.message);

    return res.status(500).json({
      message: 'Unable to save your post. Please try again.'
    });
  }
});

export default router;