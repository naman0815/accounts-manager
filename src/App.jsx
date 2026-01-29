import { useState, useEffect, useMemo } from 'react';
import { StorageService } from './services/storage';
import { ExpenseInput } from './components/ExpenseInput';
import { TransactionList } from './components/TransactionList';
import { Stats } from './components/Stats';
import { AccountSetup } from './components/AccountSetup';
import { AccountList } from './components/AccountList';
import { Settings } from './components/Settings';
import { LoadingScreen } from './components/LoadingScreen';
import { InvestmentDashboard } from './components/InvestmentDashboard';
import { UserCircle, TrendingUp, Wallet } from 'lucide-react';

function App() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('expenses'); // 'expenses' | 'investments'
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [showSetup, setShowSetup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Month State (default to current month)
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const loadData = async () => {
      const minDelay = new Promise(resolve => setTimeout(resolve, 2500)); // Match 2.5s animation

      // Parallel fetch for speed
      const [loadedAccounts, loadedTs, loadedBudgets] = await Promise.all([
        StorageService.fetchAccounts(),
        StorageService.fetchTransactions(),
        StorageService.fetchBudgets(),
        StorageService.fetchInvestments(), // Prefetch investments
        minDelay
      ]);

      if (loadedAccounts && loadedAccounts.length === 0) {
        setShowSetup(true);
      } else if (loadedAccounts) {
        setAccounts(loadedAccounts);
      }

      if (loadedTs) setTransactions(loadedTs);
      if (loadedBudgets) setBudgets(loadedBudgets);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSetupComplete = async (newAccounts) => {
    await StorageService.saveAccounts(newAccounts);
    setAccounts(newAccounts);
    setShowSetup(false);
  };

  const handleUpdateAccounts = async (updatedAccounts) => {
    setAccounts(updatedAccounts);
    await StorageService.saveAccounts(updatedAccounts);
  };

  const handleUpdateBudgets = async (updatedBudgets) => {
    setBudgets(updatedBudgets);
    await StorageService.saveBudgets(updatedBudgets);
  };

  const handleAdd = async (t) => {
    // Default to first account if available
    if (accounts.length > 0) {
      t.accountId = accounts[0].id;
    }

    // Pass to storage
    const updated = await StorageService.saveTransaction(t);
    setTransactions(updated);

    // Refresh accounts as balance changed
    const freshAccounts = await StorageService.fetchAccounts();
    setAccounts(freshAccounts);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this?')) {
      const updated = await StorageService.deleteTransaction(id);
      setTransactions(updated);
      // Refresh accounts
      const freshAccounts = await StorageService.fetchAccounts();
      setAccounts(freshAccounts);
    }
  };

  const handleExport = () => {
    StorageService.exportData();
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  // Filter transactions by month
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentDate.getMonth() &&
        tDate.getFullYear() === currentDate.getFullYear();
    });
  }, [transactions, currentDate]);

  const totalSpent = filteredTransactions
    .filter(t => t.type !== 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const monthLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  if (showSetup) {
    return <AccountSetup onComplete={handleSetupComplete} />;
  }

  return (
    <div className="app-container">
      {loading && <LoadingScreen />}

      <div className="container">
        <header className="header">
          <h1>Expense Tracker</h1>
          <div className="header-actions">
            <button onClick={handleExport} className="btn-icon" title="Export Data">
              ⬇️
            </button>
            <button onClick={() => setShowSettings(true)} className="btn-icon" title="Settings">
              <UserCircle size={20} />
            </button>
          </div>
        </header>

        {/* View Switcher */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: '#e2e8f0', padding: '0.25rem', borderRadius: '12px' }}>
          <button
            onClick={() => setView('expenses')}
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.75rem', borderRadius: '8px', border: 'none',
              background: view === 'expenses' ? '#fff' : 'transparent',
              color: view === 'expenses' ? '#0f172a' : '#64748b',
              boxShadow: view === 'expenses' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <Wallet size={18} /> Expenses
          </button>
          <button
            onClick={() => setView('investments')}
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.75rem', borderRadius: '8px', border: 'none',
              background: view === 'investments' ? '#fff' : 'transparent',
              color: view === 'investments' ? '#0f172a' : '#64748b',
              boxShadow: view === 'investments' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <TrendingUp size={18} /> Investments
          </button>
        </div>

        {view === 'investments' ? (
          <InvestmentDashboard />
        ) : (
          <>
            {/* Account Summary */}
            <AccountList accounts={accounts} />

            {/* Month Navigation */}
            <div className="month-nav glass-panel" style={{ padding: '1rem' }}>
              <button onClick={() => changeMonth(-1)} className="btn-icon">←</button>
              <span className="month-label">{monthLabel}</span>
              <button onClick={() => changeMonth(1)} className="btn-icon">→</button>
            </div>

            <div className="summary-card glass-panel">
              <span className="label">Spent in {currentDate.toLocaleString('default', { month: 'long' })}</span>
              <div className="total-amount">₹{totalSpent.toFixed(2)}</div>
            </div>

            <ExpenseInput onAdd={handleAdd} />

            <TransactionList transactions={filteredTransactions} onDelete={handleDelete} />

            {/* Spacing for Stats */}
            <div style={{ marginTop: '3rem' }}>
              <Stats transactions={filteredTransactions} budgets={budgets} />
            </div>
          </>
        )}
      </div>

      {showSettings && (
        <Settings
          accounts={accounts}
          onUpdateAccounts={handleUpdateAccounts}
          budgets={budgets}
          onUpdateBudgets={handleUpdateBudgets}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
