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
import { HomeDashboard } from './components/HomeDashboard';
import { BottomNav } from './components/BottomNav';
import { UserCircle, Bell, Settings as SettingsIcon } from 'lucide-react';

function App() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'analytics' | 'investments' | 'profile'
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [showSetup, setShowSetup] = useState(false);

  // Date State
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const loadData = async () => {
      const minDelay = new Promise(resolve => setTimeout(resolve, 2500));

      const [loadedAccounts, loadedTs, loadedBudgets] = await Promise.all([
        StorageService.fetchAccounts(),
        StorageService.fetchTransactions(),
        StorageService.fetchBudgets(),
        StorageService.fetchInvestments(),
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
    if (accounts.length > 0) t.accountId = accounts[0].id;
    const updated = await StorageService.saveTransaction(t);
    setTransactions(updated);
    const freshAccounts = await StorageService.fetchAccounts();
    setAccounts(freshAccounts);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this?')) {
      const updated = await StorageService.deleteTransaction(id);
      setTransactions(updated);
      const freshAccounts = await StorageService.fetchAccounts();
      setAccounts(freshAccounts);
    }
  };

  const handleExport = () => {
    StorageService.exportData();
  };

  if (showSetup) {
    return <AccountSetup onComplete={handleSetupComplete} />;
  }

  // Header Component (Internal)
  const Header = () => (
    <header className="app-header" style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '1rem 0', marginBottom: '1rem'
    }}>
      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
        <div style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UserCircle size={24} color="#64748b" />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Welcome Back</div>
          <div style={{ fontWeight: 600 }}>User</div>
        </div>
      </div>
      <div>
        <button className="btn-icon" style={{ position: 'relative' }}>
          <Bell size={20} />
          <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></span>
        </button>
      </div>
    </header>
  );

  return (
    <div className="app-container">
      {loading && <LoadingScreen />}

      <div className="container" style={{ paddingBottom: '80px' }}>

        {/* Render Views based on Tab */}
        {activeTab === 'home' && (
          <>
            <Header />
            <HomeDashboard
              accounts={accounts}
              transactions={transactions}
              budgets={budgets} // Will need to pass budgets
              onAddTransaction={handleAdd}
              onDeleteTransaction={handleDelete}
              currentDate={currentDate}
            />
          </>
        )}

        {activeTab === 'analytics' && (
          <div style={{ paddingTop: '1rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Analytics</h2>
            <Stats
              transactions={transactions.filter(t => {
                const d = new Date(t.date);
                return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
              })}
              budgets={budgets}
            />
          </div>
        )}

        {activeTab === 'investments' && (
          <div style={{ paddingTop: '1rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Investments</h2>
            <InvestmentDashboard />
          </div>
        )}

        {activeTab === 'profile' && (
          <div style={{ paddingTop: '1rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Profile & Settings</h2>
            <Settings
              accounts={accounts}
              onUpdateAccounts={handleUpdateAccounts}
              budgets={budgets}
              onUpdateBudgets={handleUpdateBudgets}
              onClose={() => { }} // No close button needed in tab view
              isTabView={true} // Add a prop to Settings to adjust layout if needed
            />
          </div>
        )}

      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
