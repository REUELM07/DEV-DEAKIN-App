import { useEffect, useMemo, useState } from 'react';
import { Search, Code2, Star, Layers, Plus, LoaderCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import SnippetCard from '../components/devvault/SnippetCard';
import AddSnippetModal from '../components/devvault/AddSnippetModal';
import '../components/styles/DevVault.css';

function DevVault() {
    const { token } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Page states
    const [snippets, setSnippets] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('All Languages');
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // Retrieve snippets from the backend
    useEffect(() => {
        async function fetchSnippets() {
            try {
                setLoading(true);
                setError('');

                const response = await fetch(`${API_URL}/api/snippets`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Unable to load snippets.');
                }

                setSnippets(data.snippets || []);

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        if (token) {
            fetchSnippets();
        } else {
            setLoading(false);
            setError('Please log in to access DevVault.');
        }
    }, [token, API_URL]);

    // Get available programming languages
    const languages = [
        'All Languages',
        ...new Set(snippets.map((snippet) => snippet.language))
    ];

    // Calculate dashboard statistics
    const favouriteCount = snippets.filter((snippet) => snippet.isFavourite).length;
    const languageCount = new Set(snippets.map((snippet) => snippet.language)).size;

    // Search and filter snippets using useMemo
    const filteredSnippets = useMemo(() => {
        return snippets.filter((snippet) => {
            const searchValue = searchText.toLowerCase();

            const matchesSearch =
                snippet.title.toLowerCase().includes(searchValue) ||
                (snippet.description || '').toLowerCase().includes(searchValue) ||
                snippet.code.toLowerCase().includes(searchValue);

            const matchesLanguage =
                selectedLanguage === 'All Languages' ||
                snippet.language === selectedLanguage;

            const matchesTab =
                activeTab === 'all' || snippet.isFavourite;

            return matchesSearch && matchesLanguage && matchesTab;
        });
    }, [snippets, searchText, selectedLanguage, activeTab]);

    // Add a new snippet
    const handleAddSnippet = async (snippetDetails) => {
        const response = await fetch(`${API_URL}/api/snippets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(snippetDetails)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Unable to save snippet.');
        }

        // Retrieve the updated snippet list
        const updatedResponse = await fetch(`${API_URL}/api/snippets`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const updatedData = await updatedResponse.json();

        if (!updatedResponse.ok) {
            throw new Error('Snippet saved, but refreshing the library failed.');
        }

        setSnippets(updatedData.snippets || []);
    };

    // Add or remove a snippet from favourites
    const handleToggleFavourite = async (selectedSnippet) => {
        try {
            const updatedFavourite = !selectedSnippet.isFavourite;

            const response = await fetch(`${API_URL}/api/snippets/${selectedSnippet.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    isFavourite: updatedFavourite
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Unable to update favourite.');
            }

            setSnippets((previousSnippets) =>
                previousSnippets.map((snippet) =>
                    snippet.id === selectedSnippet.id
                        ? { ...snippet, isFavourite: updatedFavourite }
                        : snippet
                )
            );

        } catch (error) {
            alert(error.message);
        }
    };

    // Delete a snippet
    const handleDeleteSnippet = async (snippetId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this snippet?');

        if (!confirmDelete) return;

        try {
            const response = await fetch(`${API_URL}/api/snippets/${snippetId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Unable to delete snippet.');
            }

            setSnippets((previousSnippets) =>
                previousSnippets.filter((snippet) => snippet.id !== snippetId)
            );

        } catch (error) {
            alert(error.message);
        }
    };

    // Edit handler
    // The edit form will be connected in the next step
    const handleEditSnippet = (snippet) => {
        alert(`Editing "${snippet.title}" will be available soon.`);
    };

    return (
        <div className="devvault-page">

            {/* Page Heading */}
            <div className="devvault-heading">
                <div>
                    <span className="devvault-label">DEVELOPER WORKSPACE</span>
                    <h1>DevVault</h1>
                    <p>Your personal code library. Save, organise and reuse your code.</p>
                </div>

                <button className="devvault-add-button" onClick={() => setShowAddModal(true)}>
                    <Plus size={19} />
                    Add New Snippet
                </button>
            </div>

            {/* Statistics */}
            <div className="devvault-stats">

                <motion.div className="devvault-stat-card" whileHover={{ y: -4 }}>
                    <div className="devvault-stat-icon">
                        <Code2 size={23} />
                    </div>
                    <div>
                        <p>Total Snippets</p>
                        <h2>{snippets.length}</h2>
                    </div>
                </motion.div>

                <motion.div className="devvault-stat-card" whileHover={{ y: -4 }}>
                    <div className="devvault-stat-icon">
                        <Star size={23} />
                    </div>
                    <div>
                        <p>Favourites</p>
                        <h2>{favouriteCount}</h2>
                    </div>
                </motion.div>

                <motion.div className="devvault-stat-card" whileHover={{ y: -4 }}>
                    <div className="devvault-stat-icon">
                        <Layers size={23} />
                    </div>
                    <div>
                        <p>Languages</p>
                        <h2>{languageCount}</h2>
                    </div>
                </motion.div>

            </div>

            {/* Search and Filters */}
            <div className="devvault-toolbar">
                <div className="devvault-search">
                    <Search size={19} />
                    <input
                        type="text"
                        placeholder="Search your snippets..."
                        value={searchText}
                        onChange={(event) => setSearchText(event.target.value)}
                    />
                </div>

                <select
                    value={selectedLanguage}
                    onChange={(event) => setSelectedLanguage(event.target.value)}
                    className="devvault-language-filter"
                >
                    {languages.map((language) => (
                        <option key={language} value={language}>
                            {language}
                        </option>
                    ))}
                </select>
            </div>

            {/* Snippet Tabs */}
            <div className="devvault-tabs">
                <button
                    className={activeTab === 'all' ? 'active' : ''}
                    onClick={() => setActiveTab('all')}
                >
                    All Snippets
                </button>

                <button
                    className={activeTab === 'favourites' ? 'active' : ''}
                    onClick={() => setActiveTab('favourites')}
                >
                    <Star size={16} />
                    Favourites
                </button>
            </div>

            {/* Snippet Content */}
            <div className="devvault-content">

                {loading ? (
                    <div className="devvault-message">
                        <LoaderCircle className="devvault-loader" size={28} />
                        <p>Loading your snippets...</p>
                    </div>

                ) : error ? (
                    <div className="devvault-message devvault-error">
                        {error}
                    </div>

                ) : filteredSnippets.length === 0 ? (
                    <div className="devvault-empty">
                        <Code2 size={42} />
                        <h3>
                            {activeTab === 'favourites'
                                ? 'No favourite snippets yet'
                                : snippets.length === 0
                                    ? 'Your code library is empty'
                                    : 'No matching snippets found'}
                        </h3>
                        <p>Save your useful code snippets here and access them whenever you need.</p>
                    </div>

                ) : (
                    <div className="devvault-snippet-grid">
                        {filteredSnippets.map((snippet) => (
                            <SnippetCard
                                key={snippet.id}
                                snippet={snippet}
                                onToggleFavourite={handleToggleFavourite}
                                onEdit={handleEditSnippet}
                                onDelete={handleDeleteSnippet}
                            />
                        ))}
                    </div>
                )}

            </div>

            {/* Add Snippet Modal */}
            {showAddModal && (
                <AddSnippetModal
                    onClose={() => setShowAddModal(false)}
                    onSave={handleAddSnippet}
                />
            )}

        </div>
    );
}

export default DevVault;