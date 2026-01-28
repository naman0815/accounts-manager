import { useState, useEffect, useMemo } from 'react';
import { StorageService } from './services/storage';
import { ExpenseInput } from './components/ExpenseInput';
import { TransactionList } from './components/TransactionList';
import { Stats } from './components/Stats';
import { AccountSetup } from './components/AccountSetup';
import { AccountList } from './components/AccountList';
import { Settings } from './components/Settings';
import { UserCircle } from 'lucide-react';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [showSetup, setShowSetup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Month State (default to current month)
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const loadData = async () => {
      const loadedAccounts = await StorageService.fetchAccounts();
      if (loadedAccounts.length === 0) {
        setShowSetup(true);
      } else {
        setAccounts(loadedAccounts);
      }

      const loadedTs = await StorageService.fetchTransactions();
      setTransactions(loadedTs);

      const loadedBudgets = await StorageService.fetchBudgets();
      setBudgets(loadedBudgets);
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
