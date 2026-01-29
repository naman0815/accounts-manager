import { useState, useMemo } from 'react';
import { BalanceCard } from './BalanceCard';
import { TransactionList } from './TransactionList';
import { ExpenseInput } from './ExpenseInput'; // We might want to keep this or move to a FAB

export function HomeDashboard({
    accounts,
    transactions,
    budgets,
    onAddTransaction,
    onDeleteTransaction,
    currentDate,
    onUpdateTransaction,
    selectedAccountId,
    onSelectAccount
}) {
    // Determine active account (default to first) - Handled in parent now
    // const [selectedAccountId, setSelectedAccountId] = useState(accounts.length > 0 ? accounts[0].id : null);

    // Filter transactions for this month
    const monthlyTransactions = useMemo(() => {
        return transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === currentDate.getMonth() &&
                tDate.getFullYear() === currentDate.getFullYear();
        });
    }, [transactions, currentDate]);

    // Calculate Monthly Stats
    const income = monthlyTransactions
        .filter(t => t.type === 'income' && (selectedAccountId ? t.accountId === selectedAccountId : true))
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthlyTransactions
        .filter(t => t.type !== 'income' && (selectedAccountId ? t.accountId === selectedAccountId : true))
        .reduce((sum, t) => sum + t.amount, 0);

    // Calculate Budget Progress (Total)
    const totalBudget = Object.values(budgets).reduce((a, b) => a + b, 0);
    const totalSpent = monthlyTransactions.filter(t => t.type !== 'income').reduce((sum, t) => sum + t.amount, 0);
    const budgetProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return (
        <div className="home-dashboard">
            {/* Balance Card Section */}
            <BalanceCard
                accounts={accounts}
                selectedAccountId={selectedAccountId}
                onSelectAccount={onSelectAccount}
                monthlyIncome={income}
                monthlyExpense={expense}
            />



            {/* Quick Add (Visible on Home) */}
            <ExpenseInput onAdd={onAddTransaction} />

            {/* Recent Activity Label */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Recent Transactions</h3>
                {/* <button className="btn-text">View All</button> */}
            </div>

            {/* Transactions List */}
            <TransactionList
                transactions={monthlyTransactions}
                onDelete={onDeleteTransaction}
                accounts={accounts}
                onUpdate={onUpdateTransaction}
            />

            <style>{`
                .home-dashboard {
                    padding-bottom: 100px; /* Space for Bottom Nav */
                }
                .budget-summary {
                    padding: 1rem;
                    border-radius: 16px;
                    margin-bottom: 1.5rem;
                }
                .progress-bg {
                    height: 8px;
                    background: #e2e8f0;
                    border-radius: 4px;
                    overflow: hidden;
                }
                .progress-fill {
                    height: 100%;
                    background: #3b82f6;
                    border-radius: 4px;
                    transition: width 0.5s ease;
                }
            `}</style>
        </div>
    );
}
