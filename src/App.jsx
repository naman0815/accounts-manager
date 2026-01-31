import { useState, useEffect, useMemo } from 'react';
import { StorageService } from './services/storage';
import { ExpenseInput } from './components/ExpenseInput';
import { TransactionList } from './components/TransactionList';
import { Stats } from './components/Stats';
import { AccountSetup } from './components/AccountSetup';
import { AccountList } from './components/AccountList';
import { Settings } from './components/Settings';
import { LoadingScreen } from './components/LoadingScreen';
import { GoalsDashboard } from './components/GoalsDashboard';
import { InvestmentDashboard } from './components/InvestmentDashboard';
import { HomeDashboard } from './components/HomeDashboard';
import { BottomNav } from './components/BottomNav';
import { MonthSelector } from './components/MonthSelector';
import { UserCircle, Bell, Settings as SettingsIcon } from 'lucide-react';

function App() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'analytics' | 'investments' | 'profile'
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [investments, setInvestments] = useState([]); // Lifted state
  const [goals, setGoals] = useState([]); // Goals State
  const [showSetup, setShowSetup] = useState(false);

  // User Name State
  const [userName, setUserName] = useState('User');

  // Persist selected account for balances view
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  // Date State
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const loadData = async () => {
      const minDelay = new Promise(resolve => setTimeout(resolve, 2500));

      const [loadedAccounts, loadedTs, loadedBudgets, loadedInv, loadedGoals] = await Promise.all([
        StorageService.fetchAccounts(),
        StorageService.fetchTransactions(),
        StorageService.fetchBudgets(),
        StorageService.fetchInvestments(),
        StorageService.fetchGoals(),
        minDelay
      ]);

      if (loadedAccounts && loadedAccounts.length === 0) {
        setShowSetup(true);
      } else if (loadedAccounts) {
        setAccounts(loadedAccounts);
        if (!selectedAccountId && loadedAccounts.length > 0) {
          setSelectedAccountId(loadedAccounts[0].id);
        }
      }

      if (loadedTs) setTransactions(loadedTs);
      if (loadedBudgets) setBudgets(loadedBudgets);
      if (loadedInv) setInvestments(loadedInv);
      if (loadedGoals) setGoals(loadedGoals);

      // Load Username
      const savedName = localStorage.getItem('am_user_name');
      if (savedName) setUserName(savedName);

      // Load Saved Account Selection
      const savedAccountId = localStorage.getItem('am_selected_account_id');
      if (savedAccountId && loadedAccounts.some(a => a.id === savedAccountId)) {
        setSelectedAccountId(savedAccountId);
      } else if (!savedAccountId && loadedAccounts.length > 0) {
        setSelectedAccountId(loadedAccounts[0].id);
      }

      setLoading(false);
    };
    loadData();

    // Listen for name changes from Settings component
    const handleStorageChange = () => {
      const savedName = localStorage.getItem('am_user_name');
      if (savedName) setUserName(savedName);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);

  }, []);

  // Save selected account whenever it changes
  useEffect(() => {
    if (selectedAccountId) {
      localStorage.setItem('am_selected_account_id', selectedAccountId);
    }
  }, [selectedAccountId]);

  // Scroll Locking Logic
  // Scroll Locking Logic
  useEffect(() => {
    // Logic: which tabs SHOULD scroll?
    // Home: Scrolls (content list)
    // Analytics: NO SCROLL (fixed chart)
    // Investments: Scrolls if items > 0. NO SCROLL if empty.
    // Settings: 
    //    - Profile: No Scroll
    //    - Budgets: Scrolls
    //    - Accounts: No Scroll
    //    - Cloud: No Scroll

    let shouldScroll = false;

    if (activeTab === 'home') {
      shouldScroll = true;
    } else if (activeTab === 'investments') {
      shouldScroll = investments.length > 0;
    } else if (activeTab === 'goals') {
      shouldScroll = true; // Goals should scroll
    } else if (activeTab === 'settings') {
      // We handle settings internal scroll in Settings.jsx, 
      // BUT the main body should NOT scroll. The Settings component handles its own overflow.
      shouldScroll = false;
    } else if (activeTab === 'analytics') {
      shouldScroll = false;
    }

    if (!shouldScroll) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden'; // Lock html too
      document.body.style.position = 'fixed'; // Nuclear option for iOS
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
  }, [activeTab, investments]);

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

  const handleUpdateInvestments = async (updatedInvestments) => {
    setInvestments(updatedInvestments);
    // Storage save is usually handled in Dashboard currently, but we can sync here to be safe or just update state
    // Actually InvestmentDashboard handles the save. We just need to update state.
    // But for consistency:
    const saved = await StorageService.fetchInvestments();
    setInvestments(saved);
  };

  const handleUpdateGoals = async (updatedGoals) => {
    setGoals(updatedGoals);
    await StorageService.saveGoals(updatedGoals);
  };

  const handleUpdate = async (t) => {
    const updated = await StorageService.saveTransaction(t);
    setTransactions(updated);
    const freshAccounts = await StorageService.fetchAccounts();
    setAccounts(freshAccounts);
  };

  const handleAdd = async (t) => {
    // Default Account Logic
    if (!t.accountId) {
      const def = localStorage.getItem('am_default_account');
      // Verify account still exists
      if (def && accounts.find(a => a.id === def)) {
        t.accountId = def;
      } else if (accounts.length > 0) {
        t.accountId = accounts[0].id;
      }
    }

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

  // Header Component
  const Header = () => (
    <header className="app-header" style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '1rem 0', marginBottom: '0.5rem'
    }}>
      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
        {/* Removed Profile Icon as requested */}
        <div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Welcome Back,</div>
          <div style={{ fontWeight: 600, fontSize: '1.2rem' }}>{userName}</div>
        </div>
      </div>
      <div>
        {/* Notification Icon Removed */}
      </div>
    </header>
  );

  return (
    <div className="app-container">
      {loading && <LoadingScreen />}

      <div className="container" style={{ paddingBottom: '100px' }}>

        {/* Render Views based on Tab */}
        {activeTab === 'home' && (
          <>
            <Header />
            <MonthSelector currentDate={currentDate} onMonthChange={setCurrentDate} />
            <HomeDashboard
              accounts={accounts}
              transactions={transactions}
              budgets={budgets} // Will need to pass budgets
              onAddTransaction={handleAdd}
              onUpdateTransaction={handleUpdate}
              onDeleteTransaction={handleDelete}
              currentDate={currentDate}
              selectedAccountId={selectedAccountId}
              onSelectAccount={setSelectedAccountId}
            />
          </>
        )}

        {activeTab === 'analytics' && (
          <div style={{ paddingTop: '1rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Analytics</h2>
            <MonthSelector currentDate={currentDate} onMonthChange={setCurrentDate} />
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
            <InvestmentDashboard
              investments={investments}
              onUpdate={handleUpdateInvestments}
            />
          </div>
        )}

        {activeTab === 'goals' && (
          <div style={{ paddingTop: '1rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Goals</h2>
            <GoalsDashboard
              goals={goals}
              onUpdate={handleUpdateGoals}
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ paddingTop: '1rem' }}>
            <Settings
              accounts={accounts}
              onUpdateAccounts={handleUpdateAccounts}
              budgets={budgets}
              onUpdateBudgets={handleUpdateBudgets}
              onClose={() => { }}
              isTabView={true}
            />
          </div>
        )}

      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
