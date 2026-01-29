import { useMemo } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#775DD0', '#00E396'];

export function Stats({ transactions, budgets }) {
    const data = useMemo(() => {
        // Only count expenses
        const expenses = transactions.filter(t => t.type !== 'income');
        const grouped = expenses.reduce((acc, t) => {
            const cat = t.category || "Others";
            acc[cat] = (acc[cat] || 0) + t.amount;
            return acc;
        }, {});

        // Merge with budgets to ensure all budgeted categories show up even if 0 spend
        const allCategories = new Set([...Object.keys(grouped), ...Object.keys(budgets || {})]);

        return Array.from(allCategories)
            .map(name => {
                const value = grouped[name] || 0;
                const budget = budgets ? (budgets[name] || 0) : 0;
                return {
                    name,
                    value,
                    budget,
                    isOverBudget: budget > 0 && value > budget
                };
            })
            .sort((a, b) => b.value - a.value); // Sort descending
    }, [transactions, budgets]);

    if (data.length === 0) return null;

    return (
        <div className="stats-container glass-panel">
            <h3>Spend vs Budget</h3>
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                        barGap={2}
                    >
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={90}
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            interval={0}
                        />
                        <Tooltip
                            formatter={(value, name) => {
                                if (name === 'budget') return [`₹${value.toFixed(2)}`, 'Budget'];
                                return [`₹${value.toFixed(2)}`, 'Spent'];
                            }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                            itemStyle={{ color: '#f8fafc' }}
                        />

                        {/* Background bar for Budget (simulated with a stacked bar or separate bar) */}
                        <Bar dataKey="budget" barSize={8} fill="rgba(255,255,255,0.15)" radius={[0, 4, 4, 0]} name="Budget" />

                        {/* Foreground bar for Actual Spend */}
                        <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]} name="Spent">
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.isOverBudget ? '#f87171' : COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
