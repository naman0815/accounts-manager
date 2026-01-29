import { useState } from 'react';
import { ChevronDown, Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react';

export function BalanceCard({ accounts, selectedAccountId, onSelectAccount, monthlyIncome, monthlyExpense }) {
    const [showBalance, setShowBalance] = useState(true);

    const selectedAccount = accounts.find(a => a.id === selectedAccountId) || (accounts.length > 0 ? accounts[0] : null);
    const balance = selectedAccount ? selectedAccount.balance : 0;

    return (
        <div className="balance-card">
            {/* Top Row: Account & Menu */}
            <div className="card-header">
                <div className="account-selector">
                    <select
                        value={selectedAccountId}
                        onChange={(e) => onSelectAccount(e.target.value)}
                        className="account-select"
                    >
                        {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                    </select>
                    <ChevronDown size={16} className="chevron-icon" />
                </div>
                {/* Optional: Menu or More icon could go here */}
            </div>

            {/* Middle: Total Balance */}
            <div className="card-body">
                <div className="balance-label">Total Balance</div>
                <div className="balance-amount-row">
                    <h2 className="balance-amount">
                        {showBalance
                            ? `₹${balance.toLocaleString('en-IN')}`
                            : '••••••'}
                    </h2>
                    <button
                        className="toggle-btn"
                        onClick={() => setShowBalance(!showBalance)}
                    >
                        {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                </div>
            </div>

            {/* Bottom: Income vs Expense */}
            <div className="card-footer">
                <div className="stat-item">
                    <div className="stat-label">
                        <TrendingUp size={14} className="icon-up" /> Income
                    </div>
                    <div className="stat-value">₹{monthlyIncome.toLocaleString()}</div>
                </div>
                <div className="stat-item">
                    <div className="stat-label">
                        <TrendingDown size={14} className="icon-down" /> Expense
                    </div>
                    <div className="stat-value">₹{monthlyExpense.toLocaleString()}</div>
                </div>
            </div>

            <style>{`
                .balance-card {
                    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                    border-radius: 20px;
                    padding: 1.5rem;
                    color: white;
                    box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.5);
                    margin-bottom: 2rem;
                    position: relative;
                    overflow: hidden;
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .account-selector {
                    position: relative;
                    display: flex;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 0.25rem 0.75rem;
                }

                .account-select {
                    appearance: none;
                    background: transparent;
                    border: none;
                    color: white;
                    font-size: 0.9rem;
                    font-weight: 500;
                    padding-right: 1.5rem;
                    cursor: pointer;
                }
                .account-select:focus { outline: none; }
                .account-select option { color: #0f172a; }

                .chevron-icon {
                    position: absolute;
                    right: 0.5rem;
                    pointer-events: none;
                    opacity: 0.8;
                }

                .balance-label {
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 0.25rem;
                }

                .balance-amount-row {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .balance-amount {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin: 0;
                    line-height: 1;
                    letter-spacing: -1px;
                }

                .toggle-btn {
                    background: rgba(255,255,255,0.1);
                    border: none;
                    color: white;
                    padding: 0.5rem;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center; justify-content: center;
                    transition: background 0.2s;
                }
                .toggle-btn:hover { background: rgba(255,255,255,0.2); }

                .card-footer {
                    display: flex;
                    justify-content: space-between;
                }

                .stat-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .stat-label {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.8rem;
                    color: rgba(255,255,255,0.7);
                }

                .stat-value {
                    font-size: 1.1rem;
                    font-weight: 600;
                }

                .icon-up { color: #4ade80; }
                .icon-down { color: #f87171; }
            `}</style>
        </div>
    );
}
