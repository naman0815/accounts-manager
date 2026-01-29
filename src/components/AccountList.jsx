import { useState } from 'react';
import { CreditCard, Wallet, Landmark, Eye, EyeOff } from 'lucide-react';

export function AccountList({ accounts }) {
    const [showBalance, setShowBalance] = useState(true);

    if (!accounts || accounts.length === 0) return null;

    const getIcon = (type) => {
        switch (type) {
            case 'credit': return <CreditCard size={18} />;
            case 'wallet': return <Wallet size={18} />;
            default: return <Landmark size={18} />;
        }
    };

    return (
        <div className="accounts-container glass-panel">
            <div className="acc-header">
                <h3>Your Accounts</h3>
                <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="icon-btn-text"
                    title={showBalance ? "Hide Balance" : "Show Balance"}
                >
                    {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>

            <div className="accounts-grid">
                {accounts.map(acc => (
                    <div key={acc.id} className="account-card">
                        <div className="acc-top">
                            <div className="acc-icon">{getIcon(acc.type)}</div>
                            <span className="acc-name">{acc.name}</span>
                        </div>
                        <div className="acc-bottom">
                            <span className={`acc-balance ${acc.type === 'credit' ? 'credit-debt' : ''}`}>
                                {showBalance ? (
                                    <>
                                        {acc.type === 'credit' && acc.balance > 0 ? '-' : ''}₹{Math.abs(acc.balance).toLocaleString()}
                                    </>
                                ) : '••••••'}
                            </span>
                        </div>

                        {/* Credit Limit Bar */}
                        {acc.type === 'Credit Card' && acc.limit > 0 && (
                            <div className="credit-utilization" style={{ marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
                                    <span>Used: {((Math.abs(acc.balance) / acc.limit) * 100).toFixed(0)}%</span>
                                    <span>Limit: ₹{acc.limit.toLocaleString()}</span>
                                </div>
                                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div
                                        style={{
                                            height: '100%',
                                            width: `${Math.min((Math.abs(acc.balance) / acc.limit) * 100, 100)}%`,
                                            background: (Math.abs(acc.balance) / acc.limit) > 0.8 ? '#f87171' : (Math.abs(acc.balance) / acc.limit) > 0.4 ? '#fbbf24' : '#34d399',
                                            transition: 'width 0.5s ease',
                                            borderRadius: '3px'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
