import { useState } from 'react';

const CATEGORIES = [
    "Food & Dining",
    "Lifestyle & Entertainment",
    "Transport & Travel",
    "Bills & Services",
    "Health & Fitness",
    "Shopping & Electronics",
    "Finance & EMIs",
    "Investments & Wallets"
];

export function Settings({ accounts, onUpdateAccounts, budgets, onUpdateBudgets, onClose }) {
    const [activeTab, setActiveTab] = useState('budgets');

    // Budgets State with immediate updates in UI, saved on change
    const handleBudgetChange = (category, value) => {
        const newBudgets = { ...budgets, [category]: parseFloat(value) || 0 };
        onUpdateBudgets(newBudgets);
    };

    // Accounts State
    const handleAccountChange = (index, field, value) => {
        const updated = [...accounts];
        updated[index] = { ...updated[index], [field]: value };
        onUpdateAccounts(updated);
    };

    return (
        <div className="modal-overlay">
            <div className="glass-panel modal-content settings-modal">
                <div className="settings-header">
                    <h2>Settings</h2>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>

                <div className="tabs">
                    <button
                        className={`tab-btn ${activeTab === 'budgets' ? 'active' : ''}`}
                        onClick={() => setActiveTab('budgets')}
                    >
                        Budgets
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'accounts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('accounts')}
                    >
                        Accounts
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'cloud' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cloud')}
                    >
                        Cloud Sync
                    </button>
                </div>

                <div className="settings-body">
                    {activeTab === 'budgets' && (
                        <div className="budget-list">
                            <p className="hint-text">Set your monthly limit for each category.</p>
                            {CATEGORIES.map(cat => (
                                <div key={cat} className="setting-row">
                                    <label>{cat}</label>
                                    <div className="input-group">
                                        <span className="prefix">₹</span>
                                        <input
                                            type="number"
                                            value={budgets[cat] || ''}
                                            onChange={(e) => handleBudgetChange(cat, e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'accounts' && (
                        <div className="account-list-edit">
                            {accounts.map((acc, index) => (
                                <div key={acc.id} className="setting-row account-edit-row">
                                    <div className="acc-info">
                                        <input
                                            type="text"
                                            value={acc.name}
                                            onChange={(e) => handleAccountChange(index, 'name', e.target.value)}
                                            className="edit-input"
                                        />
                                        <span className="acc-type-badge">{acc.type}</span>
                                    </div>
                                    <div className="input-group">
                                        <span className="prefix">₹</span>
                                        <input
                                            type="number"
                                            value={acc.balance}
                                            onChange={(e) => handleAccountChange(index, 'balance', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'cloud' && (
                        <div className="cloud-settings">
                            <p className="hint-text">Connect your Google Sheet backend.</p>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Web App URL</label>
                            <div className="flex-center" style={{ gap: '0.5rem', marginBottom: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="https://script.google.com/..."
                                    className="input-base"
                                    style={{ flex: 1 }}
                                    defaultValue={localStorage.getItem('am_api_url') || ''}
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            localStorage.setItem('am_api_url', e.target.value);
                                        } else {
                                            localStorage.removeItem('am_api_url');
                                        }
                                    }}
                                />
                                <button
                                    className="primary-btn"
                                    style={{ padding: '0.8rem', minWidth: '80px' }}
                                    onClick={async (e) => {
                                        const btn = e.target;
                                        const originalText = btn.innerText;
                                        const url = localStorage.getItem('am_api_url');

                                        if (!url) {
                                            alert("Please enter a URL first.");
                                            return;
                                        }

                                        btn.innerText = "Testing...";
                                        btn.disabled = true;

                                        try {
                                            // Test with redirect: 'follow'
                                            const res = await fetch(`${url}?action=getData`, { redirect: 'follow' });
                                            if (res.ok) {
                                                const data = await res.json();
                                                console.log(data);
                                                alert("✅ Connection Successful! Found " + (data.transactions?.length || 0) + " transactions.");
                                            } else {
                                                throw new Error("Status: " + res.status);
                                            }
                                        } catch (err) {
                                            alert("❌ Connection Failed. " + err.message + "\nCheck URL and permissions.");
                                        } finally {
                                            btn.innerText = "Test";
                                            btn.disabled = false;
                                        }
                                    }}
                                >
                                    Test
                                </button>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                Paste the Web App URL from your Google Apps Script deployment here.
                                Providing this URL will switch storage from your device to your Google Sheet.
                            </p>
                        </div>
                    )}
                </div>

                <div className="settings-footer">
                    <button onClick={onClose} className="primary-btn full-width">Done</button>
                </div>
            </div>
        </div>
    );
}
