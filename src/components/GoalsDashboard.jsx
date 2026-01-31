import { useState, useEffect } from 'react';
import { Target, Plus, Trash2, Edit2, CheckCircle } from 'lucide-react';

export function GoalsDashboard({ goals, onUpdate }) {
    const [showModal, setShowModal] = useState(false);

    // Modal State
    const [editingId, setEditingId] = useState(null);
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');

    const openAddModal = () => {
        setEditingId(null);
        setName('');
        setTargetAmount('');
        setCurrentAmount('0');
        setShowModal(true);
    };

    const openEditModal = (goal) => {
        setEditingId(goal.id);
        setName(goal.name);
        setTargetAmount(goal.targetAmount);
        setCurrentAmount(goal.currentAmount);
        setShowModal(true);
    };

    // Add Money Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [addAmount, setAddAmount] = useState('');

    const openAddMoneyModal = (goal) => {
        setSelectedGoal(goal);
        setAddAmount('');
        setShowAddModal(true);
    };

    const submitAddMoney = async (e) => {
        e.preventDefault();
        const amount = parseFloat(addAmount);
        if (amount && selectedGoal) {
            await handleAddMoney(selectedGoal, amount);
            setShowAddModal(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        try {
            const newGoal = {
                id: editingId || (Date.now().toString(36) + Math.random().toString(36).substr(2)),
                name,
                targetAmount: parseFloat(targetAmount),
                currentAmount: parseFloat(currentAmount) || 0,
                createdAt: new Date().toISOString()
            };

            let updatedGoals;
            if (editingId) {
                updatedGoals = goals.map(g => g.id === editingId ? { ...g, ...newGoal } : g);
            } else {
                updatedGoals = [...goals, newGoal];
            }

            await onUpdate(updatedGoals);
            setShowModal(false);
        } catch (error) {
            console.error("Failed to save goal:", error);
            alert("Failed to save goal. Please check console.");
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this goal?')) {
            const updatedGoals = goals.filter(g => g.id !== id);
            await onUpdate(updatedGoals);
        }
    };

    const handleAddMoney = async (goal, amount) => {
        const updatedGoals = goals.map(g => {
            if (g.id === goal.id) {
                return { ...g, currentAmount: g.currentAmount + amount };
            }
            return g;
        });
        await onUpdate(updatedGoals);
    };

    // Calculate total stats
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

    return (
        <div className="goals-dashboard">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button
                    onClick={openAddModal}
                    className="primary-btn flex-center"
                    style={{ gap: '0.5rem', padding: '0.6rem 1.2rem' }}
                >
                    <Plus size={18} />
                    New Goal
                </button>
            </div>

            {goals.length === 0 ? (
                <div className="glass-panel empty-state">
                    <Target size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                    <h3>No Goals Yet</h3>
                    <p>Set a target for something you want to buy.</p>
                </div>
            ) : (
                <>
                    {/* Summary Card */}
                    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div className="label" style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Total Saved</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#34d399' }}>
                                ₹{totalSaved.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                of ₹{totalTarget.toLocaleString()}
                            </div>
                        </div>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700 }}>
                            {Math.round((totalSaved / totalTarget) * 100) || 0}%
                        </div>
                    </div>

                    <div className="goals-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {goals.map(goal => {
                            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                            const isCompleted = progress >= 100;

                            return (
                                <div key={goal.id} className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                                    {isCompleted && (
                                        <div style={{ position: 'absolute', top: 0, right: 0, padding: '0.5rem', background: '#34d399', color: '#0f172a', borderBottomLeftRadius: '8px', fontWeight: 600, fontSize: '0.8rem' }}>
                                            COMPLETED
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <h3 style={{ fontSize: '1.2rem' }}>{goal.name}</h3>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => openEditModal(goal)} className="icon-btn-text"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(goal.id)} className="icon-btn-text" style={{ color: '#f87171' }}><Trash2 size={16} /></button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#34d399', fontWeight: 600 }}>₹{goal.currentAmount.toLocaleString()}</span>
                                        <span style={{ color: '#94a3b8' }}>Target: ₹{goal.targetAmount.toLocaleString()}</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div style={{ height: '8px', background: '#334155', borderRadius: '4px', marginBottom: '1rem', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${progress}%`,
                                            height: '100%',
                                            background: isCompleted ? '#34d399' : 'linear-gradient(90deg, #38bdf8, #818cf8)',
                                            transition: 'width 0.5s ease'
                                        }} />
                                    </div>

                                    {/* Quick Adds */}
                                    {!isCompleted && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleAddMoney(goal, 1000)}
                                            >
                                                + ₹1k
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleAddMoney(goal, 5000)}
                                            >
                                                + ₹5k
                                            </button>
                                            <button
                                                className="btn-icon"
                                                style={{ flex: 1, background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.2)' }}
                                                onClick={() => openAddMoneyModal(goal)}
                                            >
                                                Custom Add
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Goal Edit/Create Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="glass-panel modal-content">
                        <div className="settings-header">
                            <h2>{editingId ? 'Edit Goal' : 'New Goal'}</h2>
                            <button onClick={() => setShowModal(false)} className="close-btn">×</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="setting-row" style={{ display: 'block' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Goal Name</label>
                                <input
                                    type="text"
                                    className="input-base"
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                            <div className="setting-row" style={{ display: 'block' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Target Amount (₹)</label>
                                <input
                                    type="number"
                                    className="input-base"
                                    required
                                    value={targetAmount}
                                    onChange={e => setTargetAmount(e.target.value)}
                                />
                            </div>
                            <div className="setting-row" style={{ display: 'block' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Currently Saved (₹)</label>
                                <input
                                    type="number"
                                    className="input-base"
                                    value={currentAmount}
                                    onChange={e => setCurrentAmount(e.target.value)}
                                />
                            </div>
                            <div style={{ marginTop: '2rem' }}>
                                <button type="submit" className="primary-btn full-width">Save Goal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Money Custom Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="glass-panel modal-content" style={{ maxWidth: '400px' }}>
                        <div className="settings-header">
                            <h2>Add Savings</h2>
                            <button onClick={() => setShowAddModal(false)} className="close-btn">×</button>
                        </div>
                        <form onSubmit={submitAddMoney}>
                            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                                Add amount to <strong>{selectedGoal?.name}</strong>
                            </p>
                            <div className="setting-row" style={{ display: 'block' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Amount (₹)</label>
                                <input
                                    type="number"
                                    className="input-base"
                                    required
                                    autoFocus
                                    value={addAmount}
                                    onChange={e => setAddAmount(e.target.value)}
                                    style={{ fontSize: '1.5rem', textAlign: 'center', padding: '1rem' }}
                                />
                            </div>
                            <div style={{ marginTop: '2rem' }}>
                                <button type="submit" className="primary-btn full-width">Add Money</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
