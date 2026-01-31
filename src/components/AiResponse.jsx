
export function AiResponse({ response, onClose }) {
    if (!response) return null;

    return (
        <div className="glass-panel ai-response-card" style={{ marginTop: '1rem', position: 'relative' }}>
            <div className="ai-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#f472b6' }}>
                <strong>✨ AI Assistant</strong>
                <button
                    onClick={onClose}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                    ×
                </button>
            </div>
            <div className="ai-body" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem', color: '#e2e8f0' }}>
                {response}
            </div>
        </div>
    );
}
