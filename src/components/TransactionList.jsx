import { CreditCard, Wallet, Landmark } from 'lucide-react';

export function TransactionList({ transactions, onDelete, accounts = [], onUpdate }) {
    if (transactions.length === 0) {
        return (
            <div className="empty-state glass-panel">
                <p>No transactions yet.</p>
                <p className="hint">Try typing <strong>"10 coffee"</strong> above!</p>
            </div>
        );
    }

    const getIcon = (type) => {
        switch (type) {
            case 'credit': case 'Credit Card': return <CreditCard size={20} />;
            case 'wallet': case 'Wallet': return <Wallet size={20} />;
            default: return <Landmark size={20} />;
        }
    };

    const getAccountParams = (id) => {
        const acc = accounts.find(a => a.id === id);
        return { type: acc ? acc.type : 'bank', name: acc ? acc.name : 'Unknown' };
    };

    return (
        <div className="transaction-list">
            {transactions.map((t) => {
                const accParams = getAccountParams(t.accountId);

                return (
                    <div key={t.id} className="transaction-item glass-panel">
                        {/* Left: Account Switcher */}
                        {onUpdate && accounts.length > 0 && (
                            <div className="account-switcher" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: '#94a3b8', marginRight: '1rem' }}>
                                <div style={{ transform: 'scale(1.4)', display: 'flex' }}>
                                    {getIcon(accParams.type)}
                                </div>
                                <select
                                    value={t.accountId || ''}
                                    onChange={(e) => onUpdate({ ...t, accountId: e.target.value })}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                >
                                    {accounts.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="t-left" style={{ flex: 1 }}>
                            <div className="t-main-info">
                                <span className="t-tag">
                                    {t.tag || t.description || t.category}
                                </span>
                                {(t.tag || t.description) && (
                                    <span className="t-category-badge">{t.category}</span>
                                )}
                            </div>
                            <span className="t-date">
                                {new Date(t.date).toLocaleString('en-US', {
                                    hour: 'numeric', minute: 'numeric', hour12: true,
                                    day: 'numeric', month: 'short'
                                })}
                            </span>
                        </div>
                        <div className="t-right" style={{ textAlign: 'right' }}>
                            <span className={`t-amount ${t.type === 'income' ? 'amt-income' : 'amt-expense'}`}>
                                ₹{t.amount.toFixed(2)}
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
                );
            })}
        </div>
    );
}
