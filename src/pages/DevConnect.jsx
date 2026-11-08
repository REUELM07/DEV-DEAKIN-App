import React, { useEffect, useRef, useState } from 'react';
import {
    Search, Users, Circle, MessageCircle, Send, ArrowLeft, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DevConnectWelcome from '../components/devconnect/DevConnectWelcome';
import '../components/styles/DevConnect.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function DevConnect() {
    const { currentUser, token } = useAuth();

    const [showWelcome, setShowWelcome] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [onlineDevelopers, setOnlineDevelopers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [activeChat, setActiveChat] = useState(null);
    const [conversationId, setConversationId] = useState('');
    const [messages, setMessages] = useState([]);
    const [chatMessage, setChatMessage] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [chatError, setChatError] = useState('');
    const [otherUserTyping, setOtherUserTyping] = useState(false);

    const messageEndRef = useRef(null);
    const typingTimerRef = useRef(null);

    const username = currentUser?.username || currentUser?.fullName || 'Developer';

    const getHeaders = (includeJson = false) => ({
        Authorization: `Bearer ${token}`,
        ...(includeJson ? { 'Content-Type': 'application/json' } : {})
    });

    // Send online status to the backend
    useEffect(() => {
        if (!token || showWelcome) return;

        const updatePresence = async () => {
            try {
                await fetch(`${API_URL}/api/devconnect/presence/heartbeat`, {
                    method: 'POST',
                    headers: getHeaders()
                });
            } catch (requestError) {
                console.error('Presence update failed:', requestError);
            }
        };

        updatePresence();
        const heartbeatTimer = setInterval(updatePresence, 10000);

        return () => {
            clearInterval(heartbeatTimer);
            fetch(`${API_URL}/api/devconnect/presence/offline`, {
                method: 'POST',
                headers: getHeaders()
            }).catch((requestError) => {
                console.error('Offline update failed:', requestError);
            });
        };
    }, [token, showWelcome]);

    // Retrieve online developers
    useEffect(() => {
        if (!token || showWelcome) return;

        const getOnlineDevelopers = async () => {
            try {
                const response = await fetch(`${API_URL}/api/devconnect/online`, {
                    headers: getHeaders()
                });
                const data = await response.json();

                if (response.ok) {
                    const developers = Array.isArray(data) ? data : (data.developers || []);
                    setOnlineDevelopers(developers);
                }
            } catch (requestError) {
                console.error('Unable to retrieve online developers:', requestError);
            }
        };

        getOnlineDevelopers();
        const onlineTimer = setInterval(getOnlineDevelopers, 10000);

        return () => clearInterval(onlineTimer);
    }, [token, showWelcome]);

    // Search developers by username
    const handleSearch = async (event) => {
        event.preventDefault();

        if (searchText.trim().length < 2) {
            setSearchResults([]);
            setError('Enter at least 2 characters to search.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(
                `${API_URL}/api/devconnect/developers?username=${encodeURIComponent(searchText.trim())}`,
                { headers: getHeaders() }
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Developer search failed.');
            }

            const developers = Array.isArray(data) ? data : (data.developers || []);
            setSearchResults(developers);

            if (developers.length === 0) {
                setError('No developers found.');
            }
        } catch (requestError) {
            setError(requestError.message);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    // Open or create a private conversation
    const openChat = async (developer) => {
        setChatLoading(true);
        setChatError('');

        try {
            const response = await fetch(`${API_URL}/api/devconnect/conversations`, {
                method: 'POST',
                headers: getHeaders(true),
                body: JSON.stringify({ developerId: developer.id })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Unable to open this conversation.');
            }

            setActiveChat(data.developer || developer);
            setConversationId(data.conversationId);
            setMessages([]);
        } catch (requestError) {
            setChatError(requestError.message);
        } finally {
            setChatLoading(false);
        }
    };

    const closeChat = () => {
        setActiveChat(null);
        setConversationId('');
        setMessages([]);
        setChatMessage('');
        setOtherUserTyping(false);
        setChatError('');
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };

    // Keep the conversation active and refresh messages while the chat is open
    useEffect(() => {
        if (!conversationId || !token) return;

        let isMounted = true;

        const refreshConversation = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/api/devconnect/conversations/${conversationId}/messages`,
                    { headers: getHeaders() }
                );
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Unable to load messages.');
                }

                if (isMounted) {
                    setMessages(data.messages || []);
                    setOtherUserTyping(Boolean(data.isOtherUserTyping));
                    setChatError('');
                }
            } catch (requestError) {
                if (isMounted) setChatError(requestError.message);
            }
        };

        const sendConversationHeartbeat = async () => {
            try {
                await fetch(
                    `${API_URL}/api/devconnect/conversations/${conversationId}/heartbeat`,
                    { method: 'POST', headers: getHeaders() }
                );
            } catch (requestError) {
                console.error('Conversation heartbeat failed:', requestError);
            }
        };

        refreshConversation();
        sendConversationHeartbeat();

        const messageTimer = setInterval(refreshConversation, 2000);
        const conversationTimer = setInterval(sendConversationHeartbeat, 15000);

        return () => {
            isMounted = false;
            clearInterval(messageTimer);
            clearInterval(conversationTimer);
        };
    }, [conversationId, token]);

    // Scroll to the latest message
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendTypingStatus = async (isTyping) => {
        if (!conversationId) return;

        try {
            await fetch(`${API_URL}/api/devconnect/conversations/${conversationId}/typing`, {
                method: 'POST',
                headers: getHeaders(true),
                body: JSON.stringify({ isTyping })
            });
        } catch (requestError) {
            console.error('Typing status update failed:', requestError);
        }
    };

    const handleMessageChange = (event) => {
        setChatMessage(event.target.value);

        if (!conversationId) return;

        sendTypingStatus(true);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

        typingTimerRef.current = setTimeout(() => {
            sendTypingStatus(false);
        }, 1800);
    };

    const handleSendMessage = async (event) => {
        event.preventDefault();
        const messageText = chatMessage.trim();

        if (!messageText || !conversationId) return;

        setChatMessage('');
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        sendTypingStatus(false);

        try {
            const response = await fetch(
                `${API_URL}/api/devconnect/conversations/${conversationId}/messages`,
                {
                    method: 'POST',
                    headers: getHeaders(true),
                    body: JSON.stringify({ message: messageText })
                }
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Message could not be sent.');
            }

            if (data.message) {
                setMessages((previousMessages) => {
                    const alreadyAdded = previousMessages.some(
                        (item) => item.id && item.id === data.message.id
                    );
                    return alreadyAdded ? previousMessages : [...previousMessages, data.message];
                });
            }
        } catch (requestError) {
            setChatError(requestError.message);
            setChatMessage(messageText);
        }
    };

    const formatMessageTime = (sentAt) => {
        if (!sentAt) return '';
        const date = typeof sentAt === 'number'
            ? new Date(sentAt)
            : new Date(sentAt);
        if (Number.isNaN(date.getTime())) return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="devconnect-page">
            {showWelcome ? (
                <DevConnectWelcome
                    username={username}
                    onContinue={() => setShowWelcome(false)}
                />
            ) : (
                <div className="devconnect-main">
                    <div className="devconnect-header">
                        <div>
                            <h1>DevConnect</h1>
                            <p>Find developers and connect with the community.</p>
                        </div>
                        <span className="devconnect-user-label">@{username}</span>
                    </div>

                    <div className={`devconnect-layout ${activeChat ? 'chat-is-open' : ''}`}>
                        <aside className="devconnect-sidebar">
                            <h2>
                                <Users size={20} />
                                Online Developers
                            </h2>

                            {onlineDevelopers.length === 0 ? (
                                <p className="devconnect-empty">No other developers are online.</p>
                            ) : (
                                onlineDevelopers.map((developer) => (
                                    <div className="devconnect-person" key={developer.id}>
                                        <Circle size={10} fill="#22c55e" color="#22c55e" />
                                        <span>@{developer.username}</span>
                                    </div>
                                ))
                            )}
                        </aside>

                        <section className="devconnect-content">
                            {activeChat ? (
                                <div className="devconnect-chat-panel">
                                    <div className="devconnect-chat-header">
                                        <button
                                            type="button"
                                            className="devconnect-back-button"
                                            onClick={closeChat}
                                            aria-label="Back to developer search"
                                        >
                                            <ArrowLeft size={19} />
                                        </button>

                                        <div className="devconnect-person-avatar">
                                            {(activeChat.username || '?').charAt(0).toUpperCase()}
                                        </div>

                                        <div className="devconnect-chat-person">
                                            <h2>@{activeChat.username}</h2>
                                            <p>Private conversation</p>
                                        </div>

                                        <button
                                            type="button"
                                            className="devconnect-close-button"
                                            onClick={closeChat}
                                            aria-label="Close conversation"
                                        >
                                            <X size={19} />
                                        </button>
                                    </div>

                                    <div className="devconnect-message-list">
                                        {messages.length === 0 && !chatError && (
                                            <div className="devconnect-chat-empty">
                                                <MessageCircle size={30} />
                                                <p>This is the beginning of your conversation.</p>
                                                <span>Send a message to get started.</span>
                                            </div>
                                        )}

                                        {messages.map((message, index) => {
                                            const isMine = message.senderId === currentUser?.uid
                                                || message.senderId === currentUser?.id
                                                || message.senderId === currentUser?.userId;

                                            return (
                                                <div
                                                    className={`devconnect-message-row ${isMine ? 'my-message-row' : ''}`}
                                                    key={message.id || `${message.sentAt}-${index}`}
                                                >
                                                    <div className={`devconnect-message ${isMine ? 'my-message' : 'their-message'}`}>
                                                        <p>{message.message}</p>
                                                        <span>{formatMessageTime(message.sentAt)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {otherUserTyping && (
                                            <div className="devconnect-typing">
                                                @{activeChat.username} is typing...
                                            </div>
                                        )}
                                        <div ref={messageEndRef} />
                                    </div>

                                    {chatError && <p className="devconnect-chat-error">{chatError}</p>}

                                    <form className="devconnect-message-form" onSubmit={handleSendMessage}>
                                        <input
                                            type="text"
                                            value={chatMessage}
                                            onChange={handleMessageChange}
                                            placeholder="Write a message..."
                                            maxLength={1000}
                                            aria-label="Write a message"
                                        />
                                        <button type="submit" disabled={!chatMessage.trim()}>
                                            <Send size={18} />
                                            <span>Send</span>
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <>
                                    <div className="devconnect-search-box">
                                        <h2>Find Developers</h2>
                                        <p>Search for other developers using their usernames.</p>

                                        <form onSubmit={handleSearch}>
                                            <input
                                                type="text"
                                                placeholder="Search username..."
                                                value={searchText}
                                                onChange={(event) => setSearchText(event.target.value)}
                                            />
                                            <button type="submit" disabled={loading}>
                                                <Search size={18} />
                                                {loading ? 'Searching...' : 'Search'}
                                            </button>
                                        </form>

                                        {error && <p className="devconnect-error">{error}</p>}
                                        {chatError && <p className="devconnect-error">{chatError}</p>}
                                    </div>

                                    <div className="devconnect-results">
                                        {searchResults.map((developer) => (
                                            <div className="devconnect-person-card" key={developer.id}>
                                                <div className="devconnect-person-avatar">
                                                    {(developer.username || '?').charAt(0).toUpperCase()}
                                                </div>

                                                <div>
                                                    <h3>@{developer.username}</h3>
                                                    <p>DEV@Deakin Developer</p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => openChat(developer)}
                                                    disabled={chatLoading}
                                                >
                                                    <MessageCircle size={18} />
                                                    {chatLoading ? 'Opening...' : 'Message'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </section>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DevConnect;