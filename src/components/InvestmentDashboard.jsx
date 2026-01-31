import { useState, useEffect, useMemo } from 'react';
import { StorageService } from '../services/storage';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AddInvestmentModal } from './AddInvestmentModal';

export function InvestmentDashboard({ investments, onUpdate }) {
    const [showAddModal, setShowAddModal] = useState(false);

    // Removed internal loadInvestments to rely on parent state for correct scroll logic syncing

    // Process Data for Chart
    const { totalValue, assetAllocation, groupedInvestments } = useMemo(() => {
        let total = 0;
        const allocation = {};
        const grouped = {};

        investments.forEach(inv => {
            const val = inv.currentValue || 0;
            total += val;

            // Allocation
            const type = inv.assetClass;
            allocation[type] = (allocation[type] || 0) + val;

            // Grouping
            if (!grouped[type]) grouped[type] = [];
            grouped[type].push(inv);
        });

        // Format for Recharts
        const chartData = Object.keys(allocation).map(key => ({
            name: key,
            value: allocation[key]
        }));

        return { totalValue: total, assetAllocation: chartData, groupedInvestments: grouped };
    }, [investments]);

    // Colors for Chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (investments.length === 0 && !onUpdate) return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>Loading Investments...</div>;

    return (
        <div className="investment-dashboard">
            {/* Header Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none',
                        background: '#fff', color: '#0f172a',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                        fontSize: '0.9rem'
                    }}
                >
                    + Add Investment
                </button>
            </div>

            {investments.length === 0 ? (
                <div className="glass-panel empty-state">
                    <h3>No Investments Found</h3>
                    <p>Add your holdings to see them here.</p>
                </div>
            ) : (
                <>
                    {/* Summary */}
                    <div className="summary-card glass-panel">
                        <span className="label">Total Portfolio</span>
                        <div className="total-amount">₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                    </div>

                    {/* Chart */}
                    <div className="glass-panel" style={{ height: '300px', marginBottom: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#64748b' }}>Asset Allocation</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={assetAllocation}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {assetAllocation.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Lists */}
                    <div className="holdings-list">
                        {Object.entries(groupedInvestments).map(([type, items]) => (
                            <div key={type} className="asset-group glass-panel" style={{ marginBottom: '1rem' }}>
                                <div className="group-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                                    <h4 style={{ margin: 0 }}>{type}</h4>
                                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                        ₹{items.reduce((sum, i) => sum + i.currentValue, 0).toLocaleString()}
                                    </span>
                                </div>
                                {items.map((item, idx) => (
                                    <div key={idx} className="holding-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{item.identifier}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                {item.quantity} units • Avg ₹{item.buyPrice}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 600 }}>₹{item.currentValue.toLocaleString()}</div>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: item.assetClass === 'EPF' || item.assetClass === 'PPF' ? '#f59e0b' : '#10b981'
                                            }}>
                                                {item.assetClass === 'EPF' || item.assetClass === 'PPF' ? 'CALCULATED' : 'LIVE'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {showAddModal && (
                <AddInvestmentModal
                    onClose={() => setShowAddModal(false)}
                    onAdded={async () => {
                        // Refresh data via parent
                        await onUpdate();
                    }}
                />
            )}
        </div>
    );
}
