import express from 'express';
import { db } from './firebaseAdmin.js';
import { verifyToken } from './authMiddleware.js';

const router = express.Router();
const snippets = db.collection('snippets');

// Get snippets belonging to the logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const snapshot = await snippets
      .where('userId', '==', userId)
      .get();

    const userSnippets = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ snippets: userSnippets });

  } catch (error) {
    console.error('Get snippets error:', error.message);
    res.status(500).json({ message: 'Unable to retrieve snippets.' });
  }
});


// Add a new snippet
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, language, code } = req.body;

    if (
      typeof title !== 'string' ||
      typeof description !== 'string' ||
      typeof language !== 'string' ||
      typeof code !== 'string' ||
      !title.trim() ||
      !language.trim() ||
      !code.trim()
    ) {
      return res.status(400).json({
        message: 'Please provide a title, language and code.'
      });
    }

    if (
      title.length > 100 ||
      description.length > 300 ||
      code.length > 20000
    ) {
      return res.status(400).json({
        message: 'One or more snippet fields are too long.'
      });
    }

    const newSnippet = {
      userId: req.user.userId,
      title: title.trim(),
      description: description.trim(),
      language: language.trim(),
      code,
      isFavourite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const snippetRef = await snippets.add(newSnippet);

    res.status(201).json({
      message: 'Snippet added successfully.',
      snippet: {
        id: snippetRef.id,
        ...newSnippet
      }
    });

  } catch (error) {
    console.error('Add snippet error:', error.message);
    res.status(500).json({ message: 'Unable to add snippet.' });
  }
});


// Update an existing snippet
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, description, language, code, isFavourite } = req.body;

    const snippetRef = snippets.doc(req.params.id);
    const snippetDoc = await snippetRef.get();

    if (!snippetDoc.exists || snippetDoc.data().userId !== req.user.userId) {
      return res.status(404).json({
        message: 'Snippet not found.'
      });
    }

    const updatedData = {};

    if (typeof title === 'string' && title.trim()) {
      if (title.length > 100) {
        return res.status(400).json({ message: 'Title is too long.' });
      }
      updatedData.title = title.trim();
    }

    if (typeof description === 'string') {
      if (description.length > 300) {
        return res.status(400).json({ message: 'Description is too long.' });
      }
      updatedData.description = description.trim();
    }

    if (typeof language === 'string' && language.trim()) {
      updatedData.language = language.trim();
    }

    if (typeof code === 'string' && code.trim()) {
      if (code.length > 20000) {
        return res.status(400).json({ message: 'Code is too long.' });
      }
      updatedData.code = code;
    }

    if (typeof isFavourite === 'boolean') {
      updatedData.isFavourite = isFavourite;
    }

    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        message: 'No valid changes were provided.'
      });
    }

    updatedData.updatedAt = new Date().toISOString();

    await snippetRef.update(updatedData);

    res.json({
      message: 'Snippet updated successfully.'
    });

  } catch (error) {
    console.error('Update snippet error:', error.message);
    res.status(500).json({ message: 'Unable to update snippet.' });
  }
});


// Delete an existing snippet
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const snippetRef = snippets.doc(req.params.id);
    const snippetDoc = await snippetRef.get();

    if (!snippetDoc.exists || snippetDoc.data().userId !== req.user.userId) {
      return res.status(404).json({
        message: 'Snippet not found.'
      });
    }

    await snippetRef.delete();

    res.json({
      message: 'Snippet deleted successfully.'
    });

  } catch (error) {
    console.error('Delete snippet error:', error.message);
    res.status(500).json({ message: 'Unable to delete snippet.' });
  }
});

export default router;