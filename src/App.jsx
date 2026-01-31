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
import { MonthSelector } from './components/MonthSelector';

function App() {
  // ... (previous code)

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
            <InvestmentDashboard />
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
