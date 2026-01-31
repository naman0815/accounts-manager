import { useState } from 'react';
import { StorageService } from '../services/storage';

export function AddInvestmentModal({ onClose, onAdded }) {
    const [assetClass, setAssetClass] = useState('MF');

    // Common Fields
    const [identifier, setIdentifier] = useState('');
    const [exchange, setExchange] = useState('NSE');

    // MF Specific
    const [investType, setInvestType] = useState('SIP'); // 'SIP' | 'LUMPSUM'
    const [sipAmount, setSipAmount] = useState('');
    const [sipDate, setSipDate] = useState('');
    const [lumpsumAmount, setLumpsumAmount] = useState('');

    // Stock/Gold Specific
    const [quantity, setQuantity] = useState('');
    const [buyPrice, setBuyPrice] = useState('');

    // Metadata (EPF/PPF)
    const [pfBalance, setPfBalance] = useState('');
    const [pfMonthly, setPfMonthly] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                assetClass,
                identifier,
                exchange: (assetClass === 'STOCK' || assetClass === 'GOLD') ? exchange : '',
                quantity: 0,
                buyPrice: 0,
                metadata: {}
            };

            // Logic based on Asset Class
            if (assetClass === 'MF') {
                if (investType === 'SIP') {
                    payload.metadata = {
                        type: 'SIP',
                        sipAmount: Number(sipAmount),
                        startDate: sipDate
                    };
                    // Backend creates 'fake' quantity/invested value from this
                    payload.quantity = 0;
                } else {
                    payload.metadata = {
                        type: 'LUMPSUM',
                        amount: Number(lumpsumAmount)
                    };
                }
            } else if (assetClass === 'STOCK' || assetClass === 'GOLD') {
                payload.quantity = Number(quantity);
                payload.buyPrice = Number(buyPrice);
            } else if (assetClass === 'EPF') {
                payload.metadata = {
                    balance: Number(pfBalance),
                    monthly: Number(pfMonthly)
                };
            } else if (assetClass === 'PPF') {
                payload.metadata = {
                    balance: Number(pfBalance)
                };
            }

            // Fallback identifier if empty (e.g. EPF/PPF)
            if (!payload.identifier) {
                if (assetClass === 'EPF') payload.identifier = 'EPF';
                if (assetClass === 'PPF') payload.identifier = 'PPF';
            }

            await StorageService.saveHolding(payload);

            setTimeout(() => {
                onAdded();
                onClose();
            }, 1000);

        } catch (err) {
            setError("Failed to save. Check internet or backend URL.");
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>Add Investment</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="setup-form">
                    {/* Asset Class Selector */}
                    <div className="form-group">
                        <label>Asset Class</label>
                        <div className="toggle-group">
                            {['MF', 'STOCK', 'GOLD', 'EPF', 'PPF'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    className={`toggle-btn ${assetClass === type ? 'active' : ''}`}
                                    onClick={() => setAssetClass(type)}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dynamic Fields */}
                    {assetClass === 'MF' && (
                        <>
                            <div className="form-group">
                                <label>AMFI Scheme Code</label>
                                <input
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    required
                                />
                                <small style={{ color: '#64748b' }}>Find on AMFI website</small>
                            </div>

                            <div className="form-group">
                                <label>Investment Type</label>
                                <div className="toggle-group">
                                    <button type="button" className={`toggle-btn ${investType === 'SIP' ? 'active' : ''}`} onClick={() => setInvestType('SIP')}>SIP</button>
                                    <button type="button" className={`toggle-btn ${investType === 'LUMPSUM' ? 'active' : ''}`} onClick={() => setInvestType('LUMPSUM')}>One-Time</button>
                                </div>
                            </div>

                            {investType === 'SIP' ? (
                                <div className="row">
                                    <div className="form-group">
                                        <label>Monthly Amount</label>
                                        <input type="number" value={sipAmount} onChange={(e) => setSipAmount(e.target.value)} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Start Date</label>
                                        <input type="date" value={sipDate} onChange={(e) => setSipDate(e.target.value)} required />
                                    </div>
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label>Total Invested Amount</label>
                                    <input type="number" value={lumpsumAmount} onChange={(e) => setLumpsumAmount(e.target.value)} required />
                                </div>
                            )}
                        </>
                    )}

                    {(assetClass === 'STOCK' || assetClass === 'GOLD') && (
                        <>
                            <div className="form-group">
                                <label>Ticker Symbol</label>
                                <input
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Exchange</label>
                                <select value={exchange} onChange={(e) => setExchange(e.target.value)}>
                                    <option value="NSE">NSE</option>
                                    <option value="BSE">BSE</option>
                                </select>
                            </div>
                            <div className="row">
                                <div className="form-group">
                                    <label>Quantity</label>
                                    <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} step="any" required />
                                </div>
                                <div className="form-group">
                                    <label>Avg Price</label>
                                    <input type="number" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} step="any" required />
                                </div>
                            </div>
                        </>
                    )}

                    {assetClass === 'EPF' && (
                        <>
                            <div className="row">
                                <div className="form-group">
                                    <label>Current Balance</label>
                                    <input type="number" value={pfBalance} onChange={(e) => setPfBalance(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Monthly Contribution</label>
                                    <input type="number" value={pfMonthly} onChange={(e) => setPfMonthly(e.target.value)} required />
                                </div>
                            </div>
                        </>
                    )}

                    {assetClass === 'PPF' && (
                        <div className="form-group">
                            <label>Current Balance</label>
                            <input type="number" value={pfBalance} onChange={(e) => setPfBalance(e.target.value)} required />
                        </div>
                    )}

                    {error && <div className="error-message">{error}</div>}

                    <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
                            {loading ? 'Saving to Cloud...' : 'Add Investment'}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.6);
                    display: flex; justify-content: center; align-items: center; z-index: 1000;
                    backdrop-filter: blur(8px);
                }
                .modal {
                    width: 90%; max-width: 420px; padding: 2rem;
                    border: 1px solid rgba(255,255,255,0.1);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }
                .setup-form .row { display: flex; gap: 1rem; }
                .setup-form .row .form-group { flex: 1; }
                
                .toggle-group {
                    display: flex; gap: 0.5rem; background: rgba(255,255,255,0.05);
                    padding: 0.25rem; border-radius: 8px; flex-wrap: wrap;
                }
                .toggle-btn {
                    flex: 1; padding: 0.5rem; border: none; background: transparent;
                    color: #94a3b8; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 500;
                    transition: all 0.2s; white-space: nowrap;
                }
                .toggle-btn.active {
                    background: #3b82f6; color: white; shadow: 0 1px 2px rgba(0,0,0,0.1);
                }
                
                input, select {
                    width: 100%; padding: 0.75rem; border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(0,0,0,0.2); color: white;
                    font-size: 0.95rem; margin-top: 0.25rem;
                }
                input:focus, select:focus {
                    outline: none; border-color: #3b82f6;
                    background: rgba(0,0,0,0.3);
                }
                label { display: block; font-size: 0.85rem; color: #cbd5e1; font-weight: 500; }
            `}</style>
        </div>
    );
}
