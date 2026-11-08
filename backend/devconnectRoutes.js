import express from 'express';
import { db } from './firebaseAdmin.js';
import { verifyToken } from './authMiddleware.js';

const router = express.Router();

const users = db.collection('users');
const presence = db.collection('devconnectPresence');
const conversations = db.collection('devconnectConversations');

const INACTIVE_LIMIT = 2 * 60 * 1000;

// Check whether a user belongs to a conversation
function isParticipant(conversation, userId) {
    return conversation.participants?.includes(userId);
}

// Update the current user's activity in a conversation
async function updateConversationActivity(conversationRef, userId) {
    await conversationRef.update({
        [`participantActivity.${userId}`]: Date.now()
    });
}

// Delete a conversation and all its messages
async function deleteConversation(conversationRef) {
    const messagesRef = conversationRef.collection('messages');

    while (true) {
        const snapshot = await messagesRef.limit(400).get();

        if (snapshot.empty) {
            break;
        }

        const batch = db.batch();

        snapshot.docs.forEach((messageDoc) => {
            batch.delete(messageDoc.ref);
        });

        await batch.commit();
    }

    await conversationRef.delete();
}

// Check whether both participants have been inactive for 2 minutes
async function cleanupInactiveConversation(conversationRef, conversationData) {
    const activity = conversationData.participantActivity || {};
    const now = Date.now();

    const bothInactive = conversationData.participants.every((userId) => {
        const lastActive = activity[userId] || 0;

        return now - lastActive >= INACTIVE_LIMIT;
    });

    if (bothInactive) {
        await deleteConversation(conversationRef);
        return true;
    }

    return false;
}

// Automatically check inactive conversations every 30 seconds
setInterval(async () => {
    try {
        const snapshot = await conversations.get();

        for (const conversationDoc of snapshot.docs) {
            const conversationData = conversationDoc.data();

            await cleanupInactiveConversation(
                conversationDoc.ref,
                conversationData
            );
        }
    } catch (error) {
        console.error('Conversation cleanup error:', error.message);
    }
}, 30000);


// ========================================
// DEVELOPER SEARCH
// ========================================

router.get('/developers', verifyToken, async (req, res) => {
    try {
        const searchName = (req.query.username || '').toLowerCase().trim();

        if (!searchName) {
            return res.json([]);
        }

        const snapshot = await users
            .where('usernameLower', '>=', searchName)
            .where('usernameLower', '<=', searchName + '\uf8ff')
            .limit(10)
            .get();

        const developers = snapshot.docs
            .filter((doc) => doc.id !== req.user.userId)
            .map((doc) => ({
                id: doc.id,
                username: doc.data().username
            }));

        return res.json(developers);

    } catch (error) {
        console.error('Developer search error:', error);
        return res.status(500).json({
            message: 'Unable to search developers.'
        });
    }
});


// ========================================
// ONLINE PRESENCE
// ========================================

router.post('/presence/heartbeat', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const userDoc = await users.doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        await presence.doc(userId).set({
            username: userDoc.data().username,
            isOnline: true,
            lastHeartbeat: Date.now()
        });

        return res.json({ message: 'Presence updated.' });

    } catch (error) {
        console.error('Presence heartbeat error:', error);
        return res.status(500).json({
            message: 'Unable to update presence.'
        });
    }
});

router.post('/presence/offline', verifyToken, async (req, res) => {
    try {
        await presence.doc(req.user.userId).set({
            isOnline: false,
            lastHeartbeat: Date.now()
        }, { merge: true });

        return res.json({ message: 'User is offline.' });

    } catch (error) {
        console.error('Presence offline error:', error);
        return res.status(500).json({
            message: 'Unable to update presence.'
        });
    }
});

router.get('/online', verifyToken, async (req, res) => {
    try {
        const snapshot = await presence
            .where('isOnline', '==', true)
            .get();

        const now = Date.now();

        const onlineDevelopers = snapshot.docs
            .filter((doc) => {
                const data = doc.data();

                return (
                    doc.id !== req.user.userId &&
                    now - data.lastHeartbeat < 30000
                );
            })
            .map((doc) => ({
                id: doc.id,
                username: doc.data().username
            }));

        return res.json(onlineDevelopers);

    } catch (error) {
        console.error('Online developers error:', error);
        return res.status(500).json({
            message: 'Unable to load online developers.'
        });
    }
});


// ========================================
// CREATE OR REOPEN CONVERSATION
// ========================================

router.post('/conversations', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const developerId = req.body.developerId;

        if (!developerId || developerId === userId) {
            return res.status(400).json({
                message: 'Please select another developer.'
            });
        }

        const developerDoc = await users.doc(developerId).get();

        if (!developerDoc.exists) {
            return res.status(404).json({
                message: 'Developer not found.'
            });
        }

        const participants = [userId, developerId].sort();
        const conversationId = participants.join('_');

        const conversationRef = conversations.doc(conversationId);
        const conversationDoc = await conversationRef.get();

        if (conversationDoc.exists) {
            const conversationData = conversationDoc.data();

            const deleted = await cleanupInactiveConversation(
                conversationRef,
                conversationData
            );

            if (!deleted) {
                await updateConversationActivity(conversationRef, userId);

                return res.json({
                    conversationId,
                    developer: {
                        id: developerId,
                        username: developerDoc.data().username
                    }
                });
            }
        }

        const now = Date.now();

        await conversationRef.set({
            participants,
            participantActivity: {
                [userId]: now,
                [developerId]: 0
            },
            createdAt: now,
            lastActivityAt: now
        });

        return res.status(201).json({
            conversationId,
            developer: {
                id: developerId,
                username: developerDoc.data().username
            }
        });

    } catch (error) {
        console.error('Create conversation error:', error);
        return res.status(500).json({
            message: 'Unable to open conversation.'
        });
    }
});


// ========================================
// CONVERSATION HEARTBEAT
// ========================================

router.post('/conversations/:conversationId/heartbeat', verifyToken, async (req, res) => {
    try {
        const conversationRef = conversations.doc(req.params.conversationId);
        const conversationDoc = await conversationRef.get();

        if (!conversationDoc.exists) {
            return res.status(404).json({
                message: 'Conversation no longer exists.'
            });
        }

        const conversationData = conversationDoc.data();
        const userId = req.user.userId;

        if (!isParticipant(conversationData, userId)) {
            return res.status(403).json({
                message: 'You cannot access this conversation.'
            });
        }

        const deleted = await cleanupInactiveConversation(
            conversationRef,
            conversationData
        );

        if (deleted) {
            return res.status(410).json({
                message: 'This conversation has expired.'
            });
        }

        await updateConversationActivity(conversationRef, userId);

        return res.json({ message: 'Conversation activity updated.' });

    } catch (error) {
        console.error('Conversation heartbeat error:', error);
        return res.status(500).json({
            message: 'Unable to update conversation activity.'
        });
    }
});


// ========================================
// GET CONVERSATION MESSAGES
// ========================================

router.get('/conversations/:conversationId/messages', verifyToken, async (req, res) => {
    try {
        const conversationRef = conversations.doc(req.params.conversationId);
        const conversationDoc = await conversationRef.get();

        if (!conversationDoc.exists) {
            return res.status(404).json({
                message: 'Conversation no longer exists.'
            });
        }

        const conversationData = conversationDoc.data();
        const userId = req.user.userId;

        if (!isParticipant(conversationData, userId)) {
            return res.status(403).json({
                message: 'You cannot access these messages.'
            });
        }

        const deleted = await cleanupInactiveConversation(
            conversationRef,
            conversationData
        );

        if (deleted) {
            return res.status(410).json({
                message: 'This conversation has expired.'
            });
        }

        await updateConversationActivity(conversationRef, userId);

        const messagesSnapshot = await conversationRef
            .collection('messages')
            .orderBy('sentAt', 'asc')
            .limit(100)
            .get();

        const messages = messagesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));

        const updatedConversation = await conversationRef.get();
        const updatedData = updatedConversation.data();

        const typingIsActive =
            updatedData.typingUserId &&
            updatedData.typingUserId !== userId &&
            Date.now() - (updatedData.typingAt || 0) < 3000;

        return res.json({
            messages,
            isOtherUserTyping: Boolean(typingIsActive)
        });

    } catch (error) {
        console.error('Get messages error:', error);
        return res.status(500).json({
            message: 'Unable to load messages.'
        });
    }
});


// ========================================
// SEND MESSAGE
// ========================================

router.post('/conversations/:conversationId/messages', verifyToken, async (req, res) => {
    try {
        const conversationRef = conversations.doc(req.params.conversationId);
        const conversationDoc = await conversationRef.get();

        if (!conversationDoc.exists) {
            return res.status(404).json({
                message: 'Conversation no longer exists.'
            });
        }

        const conversationData = conversationDoc.data();
        const userId = req.user.userId;

        if (!isParticipant(conversationData, userId)) {
            return res.status(403).json({
                message: 'You cannot send messages here.'
            });
        }

        const deleted = await cleanupInactiveConversation(
            conversationRef,
            conversationData
        );

        if (deleted) {
            return res.status(410).json({
                message: 'This conversation has expired.'
            });
        }

        const messageText = (req.body.message || '').trim();

        if (!messageText || messageText.length > 1000) {
            return res.status(400).json({
                message: 'Message must contain between 1 and 1000 characters.'
            });
        }

        const now = Date.now();

        const messageData = {
            senderId: userId,
            message: messageText,
            sentAt: now
        };

        const messageRef = await conversationRef
            .collection('messages')
            .add(messageData);

        await conversationRef.update({
            [`participantActivity.${userId}`]: now,
            lastActivityAt: now
        });

        return res.status(201).json({
            id: messageRef.id,
            ...messageData
        });

    } catch (error) {
        console.error('Send message error:', error);
        return res.status(500).json({
            message: 'Unable to send message.'
        });
    }
});


// ========================================
// TYPING INDICATOR
// ========================================

router.post('/conversations/:conversationId/typing', verifyToken, async (req, res) => {
    try {
        const conversationRef = conversations.doc(req.params.conversationId);
        const conversationDoc = await conversationRef.get();

        if (!conversationDoc.exists) {
            return res.status(404).json({
                message: 'Conversation no longer exists.'
            });
        }

        const conversationData = conversationDoc.data();
        const userId = req.user.userId;

        if (!isParticipant(conversationData, userId)) {
            return res.status(403).json({
                message: 'You cannot access this conversation.'
            });
        }

        const deleted = await cleanupInactiveConversation(
            conversationRef,
            conversationData
        );

        if (deleted) {
            return res.status(410).json({
                message: 'This conversation has expired.'
            });
        }

        await conversationRef.update({
            typingUserId: req.body.isTyping ? userId : null,
            typingAt: Date.now(),
            [`participantActivity.${userId}`]: Date.now()
        });

        return res.json({ message: 'Typing status updated.' });

    } catch (error) {
        console.error('Typing status error:', error);
        return res.status(500).json({
            message: 'Unable to update typing status.'
        });
    }
});

export default router;