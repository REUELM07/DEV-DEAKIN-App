import express from 'express';
import { verifyToken } from '../authMiddleware.js';
import { generateAIResponse } from '../services/aiService.js';

const router = express.Router();

// Generate an AI response
router.post('/chat', verifyToken, async (req, res) => {
    try {
        const { message } = req.body;

        // Check whether a message was provided
        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({
                message: 'Please enter a message.'
            });
        }

        // Limit message length
        if (message.length > 10000) {
            return res.status(400).json({
                message: 'Message cannot exceed 10,000 characters.'
            });
        }

        // Generate response using Gemini
        const aiReply = await generateAIResponse(message.trim());

        return res.status(200).json({
            reply: aiReply
        });

    } catch (error) {
        console.error('AI Chat Route Error:', error.message);

        return res.status(500).json({
            message: 'Unable to generate an AI response. Please try again.'
        });
    }
});

export default router;