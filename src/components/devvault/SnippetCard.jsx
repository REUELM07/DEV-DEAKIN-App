import { useState } from 'react';
import { Code2, Copy, Check, Star, Pencil, Trash2 } from 'lucide-react';
import '../styles/SnippetCard.css';

function SnippetCard({ snippet, onToggleFavourite, onEdit, onDelete }) {
    const [copied, setCopied] = useState(false);

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(snippet.code);
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch (error) {
            console.error('Unable to copy code:', error);
        }
    };

    return (
        <div className="snippet-card">

            <div className="snippet-card-header">
                <div className="snippet-card-title">
                    <div className="snippet-icon">
                        <Code2 size={20} />
                    </div>

                    <div>
                        <h3>{snippet.title}</h3>
                        <span className="snippet-language">
                            {snippet.language}
                        </span>
                    </div>
                </div>

                <button
                    className={`snippet-favourite ${snippet.isFavourite ? 'active' : ''}`}
                    onClick={() => onToggleFavourite(snippet)}
                    title="Toggle favourite"
                >
                    <Star
                        size={19}
                        fill={snippet.isFavourite ? 'currentColor' : 'none'}
                    />
                </button>
            </div>

            <p className="snippet-description">
                {snippet.description || 'No description provided.'}
            </p>

            <pre className="snippet-code">
                <code>{snippet.code}</code>
            </pre>

            <div className="snippet-card-footer">
                <button onClick={copyCode} className="snippet-action">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy Code'}
                </button>

                <div className="snippet-management">
                    <button
                        onClick={() => onEdit(snippet)}
                        className="snippet-action"
                        title="Edit snippet"
                    >
                        <Pencil size={16} />
                    </button>

                    <button
                        onClick={() => onDelete(snippet.id)}
                        className="snippet-action delete-action"
                        title="Delete snippet"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

        </div>
    );
}

export default SnippetCard;