const STORAGE_KEY = 'am_transactions';
const ACCOUNTS_KEY = 'am_accounts';
const BUDGETS_KEY = 'am_budgets';
const INVESTMENTS_KEY = 'am_investments';
const API_URL_KEY = 'am_api_url';

export const StorageService = {
    getApiUrl: () => localStorage.getItem(API_URL_KEY),

    setApiUrl: (url) => {
        if (url) {
            localStorage.setItem(API_URL_KEY, url);
        } else {
            localStorage.removeItem(API_URL_KEY);
        }
    },

    // --- Transactions ---

    fetchTransactions: async () => {
        const apiUrl = StorageService.getApiUrl();
        const localData = StorageService.fetchTransactionsLocal();

        if (apiUrl) {
            console.log("Cloud Syncing Transactions...");
            try {
                const response = await fetch(`${apiUrl}?action=getData`, {
                    method: 'GET',
                    redirect: 'follow',
                    mode: 'cors'
                });

                if (!response.ok) {
                    return localData;
                }

                const data = await response.json();

                if (data.transactions) {
                    if (data.transactions.length === 0 && localData.length > 0) {
                        return localData;
                    }
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.transactions));

                    if (data.accounts) {
                        const localAccs = StorageService.fetchAccountsLocal();
                        if (data.accounts.length === 0 && localAccs.length > 0) {
                            // heal check
                        } else {
                            localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(data.accounts));
                        }
                    }
                    if (data.budgets) {
                        localStorage.setItem(BUDGETS_KEY, JSON.stringify(data.budgets));
                    }
                    if (data.investments) {
                        localStorage.setItem(INVESTMENTS_KEY, JSON.stringify(data.investments));
                    }

                    return data.transactions;
                }
            } catch (e) {
                console.error("Cloud Sync Failed", e);
            }
        }
        return localData;
    },

    fetchTransactionsLocal: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    saveTransaction: async (transaction) => {
        const apiUrl = StorageService.getApiUrl();

        if (!transaction.type) {
            transaction.type = (transaction.category === 'Income & Credits') ? 'income' : 'expense';
        }

        let transactions = StorageService.fetchTransactionsLocal();
        const updatedTs = [transaction, ...transactions];

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTs));
        if (transaction.accountId) {
            await StorageService.updateLocalBalance(transaction, 'add');
        }

        if (apiUrl) {
            fetch(apiUrl, {
                method: 'POST',
                body: JSON.stringify({ action: 'saveTransaction', payload: transaction }),
                headers: { 'Content-Type': 'text/plain' },
                redirect: 'follow',
                mode: 'no-cors'
            }).catch(e => console.error("Cloud BG Save Failed", e));
        }

        return updatedTs;
    },

    deleteTransaction: async (id) => {
        const apiUrl = StorageService.getApiUrl();
        let transactions = StorageService.fetchTransactionsLocal();
        const updated = transactions.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        const toDelete = transactions.find(t => t.id === id);
        if (toDelete) await StorageService.updateLocalBalance(toDelete, 'remove');

        if (apiUrl) {
            fetch(apiUrl, {
                method: 'POST',
                body: JSON.stringify({ action: 'deleteTransaction', id }),
                headers: { 'Content-Type': 'text/plain' },
                redirect: 'follow',
                mode: 'no-cors'
            }).catch(e => console.error("Cloud BG Delete Failed", e));
        }

        return updated;
    },

    // --- Accounts ---

    fetchAccounts: async () => {
        const apiUrl = StorageService.getApiUrl();
        const localAccounts = StorageService.fetchAccountsLocal();

        if (apiUrl) {
            try {
                const response = await fetch(`${apiUrl}?action=getData`, { redirect: 'follow', mode: 'cors' });
                if (response.ok) {
                    const data = await response.json();
                    if (data.accounts) {
                        if (data.accounts.length === 0 && localAccounts.length > 0) {
                            await StorageService.saveAccounts(localAccounts); // Heal
                            return localAccounts;
                        }
                        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(data.accounts));
                        return data.accounts;
                    }
                }
            } catch (e) { console.warn("Cloud Account Fetch Failed", e); }
        }
        return localAccounts;
    },

    fetchAccountsLocal: () => {
        try {
            const data = localStorage.getItem(ACCOUNTS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    saveAccounts: async (accounts) => {
        const apiUrl = StorageService.getApiUrl();
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

        if (apiUrl) {
            const payload = Array.isArray(accounts) ? accounts : [];
            fetch(apiUrl, {
                method: 'POST',
                body: JSON.stringify({ action: 'saveAccounts', payload: payload }),
                headers: { 'Content-Type': 'text/plain' },
                redirect: 'follow',
                mode: 'no-cors'
            }).catch(e => console.error("Cloud BG Save Accounts Failed", e));
        }
        return accounts;
    },

    // --- Budgets ---

    fetchBudgets: async () => {
        const apiUrl = StorageService.getApiUrl();
        if (apiUrl) {
            try {
                const response = await fetch(`${apiUrl}?action=getData`, { redirect: 'follow', mode: 'cors' });
                const data = await response.json();
                if (data.budgets) {
                    if (Object.keys(data.budgets).length === 0 && Object.keys(StorageService.fetchBudgetsLocal()).length > 0) {
                        return StorageService.fetchBudgetsLocal();
                    }
                    localStorage.setItem(BUDGETS_KEY, JSON.stringify(data.budgets));
                    return data.budgets;
                }
            } catch (e) { return StorageService.fetchBudgetsLocal(); }
        }
        return StorageService.fetchBudgetsLocal();
    },

    fetchBudgetsLocal: () => {
        try {
            const data = localStorage.getItem(BUDGETS_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) { return {}; }
    },

    saveBudgets: async (budgets) => {
        const apiUrl = StorageService.getApiUrl();
        localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));

        if (apiUrl) {
            fetch(apiUrl, {
                method: 'POST',
                body: JSON.stringify({ action: 'saveBudgets', payload: budgets }),
                headers: { 'Content-Type': 'text/plain' },
                redirect: 'follow',
                mode: 'no-cors'
            }).catch(e => console.error(e));
        }
        return budgets;
    },

    // --- Investments ---

    fetchInvestments: async () => {
        const apiUrl = StorageService.getApiUrl();
        if (apiUrl) {
            try {
                // We re-use 'getData' to get everything including investments
                const response = await fetch(`${apiUrl}?action=getData`, { redirect: 'follow', mode: 'cors' });
                if (response.ok) {
                    const data = await response.json();
                    if (data.investments) {
                        localStorage.setItem(INVESTMENTS_KEY, JSON.stringify(data.investments));
                        return data.investments;
                    }
                }
            } catch (e) { console.warn("Cloud Investment Fetch Failed", e); }
        }
        return StorageService.fetchInvestmentsLocal();
    },

    fetchInvestmentsLocal: () => {
        try {
            const data = localStorage.getItem(INVESTMENTS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    // --- Helpers ---

    updateLocalBalance: async (transaction, mode) => {
        if (!transaction.accountId) return;

        let accounts = StorageService.fetchAccountsLocal();
        const accountIndex = accounts.findIndex(a => a.id === transaction.accountId);
        if (accountIndex >= 0) {
            const account = accounts[accountIndex];
            if (mode === 'add') {
                if (transaction.type === 'income') account.balance += transaction.amount;
                else account.balance -= transaction.amount;
            } else {
                if (transaction.type === 'income') account.balance -= transaction.amount;
                else account.balance += transaction.amount;
            }
            accounts[accountIndex] = account;
            await StorageService.saveAccounts(accounts);
        }
    },

    // --- Import/Export ---

    exportData: () => {
        const transactions = localStorage.getItem(STORAGE_KEY);
        const accounts = localStorage.getItem(ACCOUNTS_KEY);
        const budgets = localStorage.getItem(BUDGETS_KEY);
        const investments = localStorage.getItem(INVESTMENTS_KEY);

        const data = {
            transactions: transactions ? JSON.parse(transactions) : [],
            accounts: accounts ? JSON.parse(accounts) : [],
            budgets: budgets ? JSON.parse(budgets) : {},
            investments: investments ? JSON.parse(investments) : []
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `accounts_manager_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    importData: async (jsonData) => {
        try {
            const parsed = JSON.parse(jsonData);

            if (parsed.transactions && parsed.accounts) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.transactions));
                localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(parsed.accounts));

                if (parsed.budgets) {
                    localStorage.setItem(BUDGETS_KEY, JSON.stringify(parsed.budgets));
                }
                if (parsed.investments) {
                    localStorage.setItem(INVESTMENTS_KEY, JSON.stringify(parsed.investments));
                }

                return parsed;
            }
            throw new Error('Invalid data format');
        } catch (e) {
            console.error('Import failed', e);
            return null;
        }
    }
};
