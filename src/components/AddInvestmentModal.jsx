import { useState } from 'react';
import { StorageService } from '../services/storage';

export function AddInvestmentModal({ onClose, onAdded }) {
    const [formData, setFormData] = useState({
        assetClass: 'MF',
        identifier: '',
        exchange: '',
        quantity: '',
        buyPrice: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                assetClass: formData.assetClass,
                identifier: formData.identifier,
                exchange: formData.assetClass === 'STOCK' || formData.assetClass === 'GOLD' ? (formData.exchange || 'NSE') : '',
                quantity: Number(formData.quantity),
                buyPrice: Number(formData.buyPrice),
                metadata: {} // Future use
            };

            await StorageService.saveHolding(payload);

            // Wait a moment for GAS to potentially process (it's async though)
            // Ideally we show a 'Saved, refresh later' toast, but for now just close
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
                <h3>Add Investment</h3>

                <form onSubmit={handleSubmit} className="setup-form">
                    <div className="form-group">
                        <label>Asset Class</label>
                        <select name="assetClass" value={formData.assetClass} onChange={handleChange}>
                            <option value="MF">Mutual Fund</option>
                            <option value="STOCK">Stock</option>
                            <option value="GOLD">Gold</option>
                            <option value="EPF">EPF</option>
                            <option value="PPF">PPF</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>
                            {formData.assetClass === 'MF' ? 'AMFI Scheme Code (e.g., 120503)' :
                                formData.assetClass === 'STOCK' ? 'Ticker Symbol (e.g., RELIANCE)' :
                                    'Identifier / Name'}
                        </label>
                        <input
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleChange}
                            placeholder="Required"
                            required
                        />
                        {formData.assetClass === 'MF' && <small style={{ color: '#64748b' }}>Find codes on AMFI website</small>}
                    </div>

                    {(formData.assetClass === 'STOCK' || formData.assetClass === 'GOLD') && (
                        <div className="form-group">
                            <label>Exchange</label>
                            <select name="exchange" value={formData.exchange} onChange={handleChange}>
                                <option value="NSE">NSE</option>
                                <option value="BSE">BSE</option>
                            </select>
                        </div>
                    )}

                    <div className="row">
                        <div className="form-group">
                            <label>Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                step="any"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Avg Buy Price</label>
                            <input
                                type="number"
                                name="buyPrice"
                                value={formData.buyPrice}
                                onChange={handleChange}
                                step="any"
                            />
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Add Investment'}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
                    display: flex; justify-content: center; align-items: center; z-index: 1000;
                    backdrop-filter: blur(4px);
                }
                .modal {
                    width: 90%; max-width: 400px; padding: 2rem;
                    border: 1px solid rgba(255,255,255,0.2);
                }
                .setup-form .row { display: flex; gap: 1rem; }
            `}</style>
        </div>
    );
}
