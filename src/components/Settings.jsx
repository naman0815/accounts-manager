import { useState, useEffect } from 'react';

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

export function Settings({ accounts, onUpdateAccounts, budgets, onUpdateBudgets, onClose, isTabView }) {
    const [activeTab, setActiveTab] = useState('profile');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const name = localStorage.getItem('am_user_name') || 'User';
        setUserName(name);
    }, []);

    const handleNameChange = (e) => {
        const name = e.target.value;
        setUserName(name);
        localStorage.setItem('am_user_name', name);
        // Dispatch event so Header updates immediately
        window.dispatchEvent(new Event('storage'));
    };

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

    const handleUrlChange = (e) => {
        const url = e.target.value.trim();
        if (url) {
            localStorage.setItem('am_api_url', url);
        } else {
            localStorage.removeItem('am_api_url');
        }
    };

    const content = (
        <div className={isTabView ? "" : "glass-panel modal-content settings-modal"}>
            {!isTabView && (
                <div className="settings-header">
                    <h2>Settings</h2>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>
            )}

            <div className="tabs">
                <button
                    className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Profile
                </button>
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
                {activeTab === 'profile' && (
                    <>
                        <div className="setting-row">
                            <label>Your Name</label>
                            <input
                                type="text"
                                value={userName}
                                onChange={handleNameChange}
                                className="input-base"
                                placeholder="Enter your name"
                            />
                        </div>
                        <div className="setting-row">
                            <label>Default Account</label>
                            <select
                                value={localStorage.getItem('am_default_account') || ''}
                                onChange={(e) => {
                                    localStorage.setItem('am_default_account', e.target.value);
                                    window.dispatchEvent(new Event('storage'));
                                }}
                                className="input-base"
                            >
                                <option value="">Select Account...</option>
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                ))}
                            </select>
                        </div>
                        <p className="hint-text">Name displayed on home & default account for new expenses.</p>
                    </>
                )}

                {activeTab === 'budgets' && (
                    <div className="budget-list">
                        <p className="hint-text">Set your monthly limit for each category.</p>

                        {/* Credit Card Budget Special Field */}
                        <div className="setting-row" style={{ borderBottom: '1px solid #334155', marginBottom: '1rem', paddingBottom: '1rem' }}>
                            <label style={{ color: '#f472b6' }}>Credit Card Budget</label>
                            <div className="input-group" style={{ borderColor: '#f472b6' }}>
                                <span className="prefix">₹</span>
                                <input
                                    type="number"
                                    value={budgets['Credit Card'] || ''}
                                    onChange={(e) => handleBudgetChange('Credit Card', e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                        </div>

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
                            <div key={acc.id} className="setting-row account-edit-row" style={{ flexWrap: 'wrap' }}>
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
                                {acc.type === 'Credit Card' && (
                                    <div className="input-group" style={{ marginTop: '0.5rem', width: '100%', borderColor: '#ec4899' }}>
                                        <span className="prefix" style={{ fontSize: '0.8rem', marginRight: '0.5rem', color: '#ec4899' }}>Limit</span>
                                        <input
                                            type="number"
                                            value={acc.limit || ''}
                                            onChange={(e) => handleAccountChange(index, 'limit', parseFloat(e.target.value) || 0)}
                                            placeholder="Credit Limit"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'cloud' && (
                    <div className="cloud-settings">
                        <p className="hint-text">Connect your Google Sheet backend.</p>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Web App URL</label>

                        <div className="flex-center" style={{ gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                placeholder="https://script.google.com/..."
                                className="input-base"
                                style={{ flex: 1, minWidth: '200px' }}
                                defaultValue={localStorage.getItem('am_api_url') || ''}
                                onChange={handleUrlChange}
                            />
                            <button
                                className="primary-btn"
                                style={{ padding: '0.8rem', minWidth: '80px' }}
                                onClick={async (e) => {
                                    const btn = e.target;
                                    const url = localStorage.getItem('am_api_url');

                                    if (!url) {
                                        alert("Please enter a URL first.");
                                        return;
                                    }

                                    if (url.includes('/edit')) {
                                        alert("⚠️ Incorrect URL Format!\n\nYou pasted the Editor URL (ends in /edit).\nYou need the Web App URL (ends in /exec).\n\nGo to Deploy > Manage Deployments > Web App URL.");
                                        return;
                                    }

                                    btn.innerText = "Testing...";
                                    btn.disabled = true;

                                    try {
                                        const res = await fetch(`${url}?action=getData`, { redirect: 'follow', mode: 'cors' });
                                        if (res.ok) {
                                            const data = await res.json();
                                            console.log(data);
                                            alert("✅ Connection Successful!\nFound " + (data.transactions?.length || 0) + " transactions.");
                                        } else {
                                            throw new Error("HTTP " + res.status);
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        alert("❌ Connection Failed.\n" + err.message + "\n\n1. Check URL ends in /exec\n2. Check permission is 'Anyone'");
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
                            Paste the <strong>Web App URL</strong> from your Google Apps Script deployment.
                            It must end in <code>/exec</code>.
                        </p>
                    </div>
                )}
            </div>

            {!isTabView && (
                <div className="settings-footer">
                    <button onClick={onClose} className="primary-btn full-width">Done</button>
                </div>
            )}
        </div>
    );

    if (isTabView) return content;

    return (
        <div className="modal-overlay">
            {content}
        </div>
    );
}
