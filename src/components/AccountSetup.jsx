import { useState } from 'react';

export function AccountSetup({ onComplete }) {
    const [accounts, setAccounts] = useState([
        { id: crypto.randomUUID(), name: 'HDFC Savings', type: 'savings', balance: 0 },
        { id: crypto.randomUUID(), name: 'SBI Savings', type: 'savings', balance: 0 },
        { id: crypto.randomUUID(), name: 'HDFC Credit Card', type: 'credit', balance: 0 }
    ]);

    const handleUpdate = (index, field, value) => {
        const updated = [...accounts];
        updated[index] = { ...updated[index], [field]: value };
        setAccounts(updated);
    };

    const handleAdd = () => {
        setAccounts([...accounts, { id: crypto.randomUUID(), name: 'New Account', type: 'savings', balance: 0 }]);
    };

    const handleRemove = (index) => {
        const updated = accounts.filter((_, i) => i !== index);
        setAccounts(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onComplete(accounts);
    };

    return (
        <div className="modal-overlay">
            <div className="glass-panel modal-content">
                <h2>Setup Your Accounts</h2>
                <p>Let's track your current balances.</p>

                <form onSubmit={handleSubmit}>
                    <div className="account-list">
                        {accounts.map((acc, index) => (
                            <div key={acc.id} className="account-row">
                                <input
                                    type="text"
                                    value={acc.name}
                                    onChange={(e) => handleUpdate(index, 'name', e.target.value)}
                                    placeholder="Account Name"
                                    className="input-base"
                                    required
                                />
                                <select
                                    value={acc.type}
                                    onChange={(e) => handleUpdate(index, 'type', e.target.value)}
                                    className="input-base"
                                >
                                    <option value="savings">Savings</option>
                                    <option value="credit">Credit Card</option>
                                    <option value="wallet">Wallet</option>
                                </select>
                                <input
                                    type="number"
                                    value={acc.balance}
                                    onChange={(e) => handleUpdate(index, 'balance', parseFloat(e.target.value) || 0)}
                                    placeholder="Current Balance"
                                    className="input-base"
                                />
                                <button type="button" onClick={() => handleRemove(index)} className="delete-btn">×</button>
                            </div>
                        ))}
                    </div>

                    <button type="button" onClick={handleAdd} className="text-btn">+ Add another account</button>

                    <button type="submit" className="primary-btn full-width" style={{ marginTop: '2rem' }}>
                        Start Tracking
                    </button>
                </form>
            </div>
        </div>
    );
}
