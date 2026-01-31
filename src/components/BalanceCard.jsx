import { useState } from 'react';
import { ChevronDown, Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react';

export function BalanceCard({ accounts, selectedAccountId, onSelectAccount, monthlyIncome, monthlyExpense, budgets }) {
    const [showBalance, setShowBalance] = useState(true);

    // Filter accounts if type is specified (e.g. for only CC view if needed, but generic here)
    const activeAccount = accounts.find(a => a.id === selectedAccountId) || (accounts.length > 0 ? accounts[0] : null);

    // Derived values
    const isCredit = activeAccount?.type === 'Credit Card' || activeAccount?.type === 'credit';
    const balance = activeAccount ? activeAccount.balance : 0;
    const limit = activeAccount?.limit || 0;

    // For Credit Cards: Balance is usually negative (debt). 
    // "Used" = Math.abs(balance). 
    // "Available" = Limit - Used.
    const used = Math.abs(balance);
    const utilization = limit > 0 ? (used / limit) * 100 : 0;

    // Censored string matches length of digits (approx)
    const censored = "•".repeat(balance.toString().length + 1);

    return (
        <div className="balance-card">
            {/* Top Row: Account & Menu */}
            <div className="card-header">
                <div className="account-selector">
                    <select
                        value={selectedAccountId || ''}
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

            {/* Middle: Main Hero Text */}
            <div className="card-body">
                <div className="balance-label">
                    {isCredit ? 'Used / Limit' : 'Total Balance'}
                </div>

                <div className="balance-amount-row">
                    <h2 className="balance-amount">
                        {showBalance
                            ? (isCredit
                                ? `₹${used.toLocaleString()} / ₹${limit.toLocaleString()}`
                                : `₹${balance.toLocaleString('en-IN')}`)
                            : (isCredit
                                ? `₹${"•".repeat(used.toString().length)} / ₹${"•".repeat(limit.toString().length)}`
                                : `₹ ${censored}`)}
                    </h2>
                    <button
                        className="toggle-btn"
                        onClick={() => setShowBalance(!showBalance)}
                    >
                        {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                </div>

                {/* Credit Check Bar (Only for Credit Cards) */}
                {/* Credit Cards: Show Budget Bar if budget exists, else Show Credit Utilization */}
                {isCredit && (
                    <div className="credit-bar-container">
                        {/* 1. Credit Limit Utilization Bar */}
                        <div style={{ marginBottom: budgets?.['Credit Card'] ? '1rem' : '0' }}>
                            <div className="credit-bar-bg">
                                <div
                                    className="credit-bar-fill"
                                    style={{
                                        width: `${Math.min(utilization, 100)}%`,
                                        background: utilization > 90 ? '#ef4444' : utilization > 50 ? '#f59e0b' : '#38bdf8'
                                    }}
                                ></div>
                            </div>
                            <div className="credit-bar-labels">
                                <span>{utilization.toFixed(0)}% Limit Used</span>
                                <span>₹{(limit - used).toLocaleString()} Available</span>
                            </div>
                        </div>

                        {/* 2. Monthly Budget Bar (If set) */}
                        {budgets?.['Credit Card'] > 0 && (
                            <div>
                                <div className="credit-bar-bg" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                    <div
                                        className="credit-bar-fill"
                                        style={{
                                            width: `${Math.min((monthlyExpense / budgets['Credit Card']) * 100, 100)}%`,
                                            background: (monthlyExpense / budgets['Credit Card']) > 1 ? '#ef4444' : '#10b981'
                                        }}
                                    ></div>
                                </div>
                                <div className="credit-bar-labels">
                                    <span>Budget: {((monthlyExpense / budgets['Credit Card']) * 100).toFixed(0)}%</span>
                                    <span>₹{(budgets['Credit Card'] - monthlyExpense).toLocaleString()} Left</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

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
                    min-height: 220px;
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
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
                    margin-bottom: 1.5rem;
                    position: relative;
                }

                .balance-amount {
                    font-size: 1.8rem; /* Slightly smaller to fit "Used / Limit" */
                    font-weight: 700;
                    margin: 0;
                    line-height: 1.2;
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
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                }
                .toggle-btn:hover { background: rgba(255,255,255,0.2); }

                /* Credit Bar */
                .credit-bar-container {
                    margin-bottom: 1.5rem;
                }
                .credit-bar-bg {
                    height: 8px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 0.3rem;
                }
                .credit-bar-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.5s ease;
                }
                .credit-bar-labels {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.75rem;
                    color: rgba(255,255,255,0.8);
                }


                .card-footer {
                    display: flex;
                    gap: 2rem;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    padding-top: 1rem;
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
                    font-size: 1.1rem;
                    font-weight: 600;
                }

                .icon-up { color: #4ade80; }
                .icon-down { color: #f87171; }


            `}</style>
        </div>
    );
}
