import { useState } from 'react';
import { ChevronDown, Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react';

export function BalanceCard({ accounts, selectedAccountId, onSelectAccount, monthlyIncome, monthlyExpense }) {
    const [showBalance, setShowBalance] = useState(true);

    const selectedAccount = accounts.find(a => a.id === selectedAccountId) || (accounts.length > 0 ? accounts[0] : null);
    const balance = selectedAccount ? selectedAccount.balance : 0;

    // Censored string matches length of digits (approx)
    const censored = "•".repeat(balance.toString().length + 1);

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
            </div>

            {/* Middle: Total Balance */}
            <div className="card-body">
                <div className="balance-label">Total Balance</div>
                <div className="balance-amount-row">
                    <h2 className="balance-amount">
                        {showBalance
                            ? `₹${balance.toLocaleString('en-IN')}`
                            : `₹ ${censored}`}
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
                    border-radius: 24px;
                    padding: 1.75rem;
                    color: white;
                    box-shadow: 0 15px 30px -10px rgba(59, 130, 246, 0.6);
                    margin-bottom: 2rem;
                    position: relative;
                    overflow: hidden;
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.25rem;
                }

                .account-selector {
                    position: relative;
                    display: flex;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 12px;
                    padding: 0.35rem 0.85rem;
                    backdrop-filter: blur(4px);
                }

                .account-select {
                    appearance: none;
                    background: transparent;
                    border: none;
                    color: white;
                    font-size: 0.9rem;
                    font-weight: 600;
                    padding-right: 1.5rem;
                    cursor: pointer;
                }
                .account-select:focus { outline: none; }
                .account-select option { color: #0f172a; }

                .chevron-icon {
                    position: absolute;
                    right: 0.6rem;
                    pointer-events: none;
                    opacity: 0.8;
                }

                .balance-label {
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                }

                .balance-amount-row {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    position: relative;
                }

                .balance-amount {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin: 0;
                    line-height: 1;
                    letter-spacing: -0.5px;
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
                    /* Fix position to prevent jumping */
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                }
                .toggle-btn:hover { background: rgba(255,255,255,0.2); }

                .card-footer {
                    display: flex;
                    gap: 2rem;
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
                    font-size: 0.85rem;
                    color: rgba(255,255,255,0.8);
                }

                .stat-value {
                    font-size: 1.2rem;
                    font-weight: 600;
                }

                .icon-up { color: #4ade80; }
                .icon-down { color: #f87171; }
            `}</style>
        </div>
    );
}
