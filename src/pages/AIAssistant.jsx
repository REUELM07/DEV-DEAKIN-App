import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, UserRound, Send, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AIWelcome from '../components/ai/AIWelcome';
import '../components/styles/AIAssistant.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function AIAssistant() {
    const { token, currentUser } = useAuth();

    const [showWelcome, setShowWelcome] = useState(true);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);
    useEffect(() => {messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
    });
    }, [messages, loading]);

    const handleSend = async () => {
        const userMessage = messageInput.trim();

        if (!userMessage || loading) {
            return;
        }

        setMessages((previousMessages) => [
            ...previousMessages,
            { role: 'user', content: userMessage }
        ]);

        setMessageInput('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: userMessage
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Unable to get an AI response.');
            }

            setMessages((previousMessages) => [
                ...previousMessages,
                { role: 'assistant', content: data.reply }
            ]);

        } catch (error) {
            setMessages((previousMessages) => [
                ...previousMessages,
                {
                    role: 'assistant',
                    content: error.message || 'Something went wrong. Please try again.'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="ai-assistant-page">

            <AnimatePresence mode="wait">

                {showWelcome ? (

                    <AIWelcome key="welcome" fullName={currentUser?.fullName} onStart={() => setShowWelcome(false)} />

                ) : (

                    <motion.div
                        key="chat"
                        className="ai-chat-container"
                        initial={{ opacity: 0, y: 25, scale: 0.97, filter: 'blur(8px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.5 }}
                    >

                        <div className="ai-chat-header">
                            <div className="ai-chat-heading">
                                <div className="ai-chat-icon">
                                    <Sparkles size={23} />
                                </div>

                                <div>
                                    <h2>AI Learning Assistant</h2>
                                    <p>Your personal programming companion</p>
                                </div>
                            </div>

                            <span className="ai-online-status">
                                <span></span>
                                Online
                            </span>
                        </div>

                        <div className="ai-chat-messages">

                            {messages.length === 0 && (
                                <div className="ai-chat-empty">
                                    <div className="ai-empty-icon">
                                        <Bot size={35} />
                                    </div>

                                    <h3>What would you like to learn?</h3>

                                    <p>
                                        Ask me about programming, debugging,
                                        algorithms, or any software development topic.
                                    </p>
                                
                                </div>
                            )}

                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    className={`ai-message-row ${message.role}`}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <div className="ai-message-avatar">
                                        {message.role === 'user'
                                            ? <UserRound size={18} />
                                            : <Bot size={18} />
                                        }
                                    </div>

                                    <div className="ai-message-content">
                                        <span>
                                            {message.role === 'user' ? 'You' : 'AI Assistant'}
                                        </span>

                                        <div className="ai-message-bubble">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {loading && (
                                <div className="ai-message-row assistant">
                                    <div className="ai-message-avatar">
                                        <Bot size={18} />
                                    </div>

                                    <div className="ai-message-content">
                                        <span>AI Assistant</span>

                                        <div className="ai-typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        <div className="ai-chat-input-area">
                            <textarea
                                value={messageInput}
                                onChange={(event) => setMessageInput(event.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask your programming question..."
                                rows="1"
                                disabled={loading}
                            />

                            <button
                                type="button"
                                onClick={handleSend}
                                disabled={!messageInput.trim() || loading}
                                aria-label="Send message"
                            >
                                <Send size={19} />
                            </button>
                        </div>

                        <p className="ai-chat-disclaimer">
                            AI can make mistakes. Verify important information.
                        </p>

                    </motion.div>

                )}

            </AnimatePresence>

        </div>
    );
}

export default AIAssistant;