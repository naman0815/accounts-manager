export function TransactionList({ transactions, onDelete }) {
    if (transactions.length === 0) {
        return (
            <div className="empty-state glass-panel">
                <p>No transactions yet.</p>
                <p className="hint">Try typing <strong>"10 coffee"</strong> above!</p>
            </div>
        );
    }

    return (
        <div className="transaction-list">
            {transactions.map((t) => (
                <div key={t.id} className="transaction-item glass-panel">
                    <div className="t-left">
                        <div className="t-main-info">
                            {/* Prioritize tag (local), then description (cloud), then category */}
                            <span className="t-tag">
                                {t.tag || t.description || t.category}
                            </span>
                            {(t.tag || t.description) && (
                                <span className="t-category-badge">{t.category}</span>
                            )}
                        </div>
                        <span className="t-date">
                            {new Date(t.date).toLocaleString('en-US', {
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: true,
                                day: 'numeric',
                                month: 'short'
                            })}
                        </span>
                    </div>
                    <div className="t-right">
                        <span className={`t-amount ${t.type === 'income' ? 'amt-income' : 'amt-expense'}`}>
                            {t.type === 'income' ? '+' : ''}₹{t.amount.toFixed(2)}
                        </span>
                        <button
                            className="delete-btn"
                            onClick={() => onDelete(t.id)}
                            title="Delete transaction"
                        >
                            ×
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
