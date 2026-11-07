import { useState } from 'react';
import { X, Code2 } from 'lucide-react';
import '../styles/AddSnippetModal.css';

function AddSnippetModal({ onClose, onSave }) {
    const [snippetTitle, setSnippetTitle] = useState('');
    const [snippetDescription, setSnippetDescription] = useState('');
    const [snippetLanguage, setSnippetLanguage] = useState('javascript');
    const [snippetCode, setSnippetCode] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!snippetTitle.trim() || !snippetCode.trim()) {
            setError('Please enter a title and your code snippet.');
            return;
        }

        try {
            setSaving(true);
            setError('');

            await onSave({
                title: snippetTitle.trim(),
                description: snippetDescription.trim(),
                language: snippetLanguage,
                code: snippetCode.trim()
            });

            onClose();

        } catch (error) {
            setError(error.message || 'Unable to save your snippet.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="snippet-modal-overlay" onClick={onClose}>
            <div
                className="snippet-modal"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="snippet-modal-header">
                    <div>
                        <div className="snippet-modal-icon">
                            <Code2 size={21} />
                        </div>
                        <h2>Add New Snippet</h2>
                        <p>Save a useful piece of code to your personal library.</p>
                    </div>

                    <button
                        type="button"
                        className="snippet-modal-close"
                        onClick={onClose}
                    >
                        <X size={21} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="snippet-form-group">
                        <label>Snippet Title *</label>
                        <input
                            type="text"
                            placeholder="e.g. Array Sorting"
                            value={snippetTitle}
                            onChange={(event) => setSnippetTitle(event.target.value)}
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="snippet-form-group">
                        <label>Description</label>
                        <textarea
                            placeholder="What does this code do?"
                            value={snippetDescription}
                            onChange={(event) => setSnippetDescription(event.target.value)}
                            maxLength={300}
                            rows={2}
                        />
                    </div>

                    <div className="snippet-form-group">
                        <label>Programming Language *</label>
                        <select
                            value={snippetLanguage}
                            onChange={(event) => setSnippetLanguage(event.target.value)}
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="c">C</option>
                            <option value="cpp">C++</option>
                            <option value="csharp">C#</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="sql">SQL</option>
                            <option value="typescript">TypeScript</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="snippet-form-group">
                        <label>Code *</label>
                        <textarea
                            className="snippet-code-input"
                            placeholder="Write or paste your code here..."
                            value={snippetCode}
                            onChange={(event) => setSnippetCode(event.target.value)}
                            rows={8}
                            required
                        />
                    </div>

                    {error && (
                        <p className="snippet-form-error">{error}</p>
                    )}

                    <div className="snippet-modal-actions">
                        <button
                            type="button"
                            className="snippet-cancel-button"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="snippet-save-button"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Snippet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddSnippetModal;