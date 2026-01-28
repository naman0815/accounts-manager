const STORAGE_KEY = 'am_transactions';
const ACCOUNTS_KEY = 'am_accounts';
const BUDGETS_KEY = 'am_budgets';
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
        if (apiUrl) {
            console.log("Cloud Syncing Transactions...");
            try {
                // Apps Script Web Apps redirect (302) to googleusercontent.com
                const response = await fetch(`${apiUrl}?action=getData`, {
                    method: 'GET',
                    redirect: 'follow',
                    mode: 'cors'
                });

                if (!response.ok) {
                    console.warn("Cloud offline, using local cache.");
                    return StorageService.fetchTransactionsLocal();
                }

                const data = await response.json();

                // SINGLE SOURCE OF TRUTH: Overwrite local with Cloud
                if (data.transactions) {
                    console.log("Cloud Transactions Received:", data.transactions.length);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.transactions));

                    // Also sync other entities if present
                    if (data.accounts) localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(data.accounts));
                    if (data.budgets) localStorage.setItem(BUDGETS_KEY, JSON.stringify(data.budgets));

                    return data.transactions;
                }
            } catch (e) {
                console.error("Cloud Sync Failed", e);
            }
        }
        return StorageService.fetchTransactionsLocal();
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

        // Determine type locally first (business logic)
        if (!transaction.type) {
            transaction.type = (transaction.category === 'Income & Credits') ? 'income' : 'expense';
        }

        // Optimistic Local Update
        let transactions = StorageService.fetchTransactionsLocal();
        const updatedTs = [transaction, ...transactions];

        // Always save local first (Optimistic UI + Cache)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTs));
        if (transaction.accountId) {
            await StorageService.updateLocalBalance(transaction, 'add');
        }

        if (apiUrl) {
            console.log("Saving to Cloud:", transaction);
            try {
                // Background Sync (Fire and Forget if no-cors)
                fetch(apiUrl, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'saveTransaction', payload: transaction }),
                    headers: { 'Content-Type': 'text/plain' },
                    redirect: 'follow',
                    mode: 'no-cors' // Default to resilient mode directly
                }).catch(e => console.error("Cloud BG Save Failed", e));
            } catch (e) {
                console.error("Cloud Save Failed", e);
            }
        }

        return updatedTs;
    },

    deleteTransaction: async (id) => {
        const apiUrl = StorageService.getApiUrl();

        // Optimistic Delete
        let transactions = StorageService.fetchTransactionsLocal();
        const transactionToDelete = transactions.find(t => t.id === id);
        const updated = transactions.filter(t => t.id !== id);

        // Local Persistence
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        // Revert Account Balance
        if (transactionToDelete) {
            await StorageService.updateLocalBalance(transactionToDelete, 'remove');
        }

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
        if (apiUrl) {
            try {
                const response = await fetch(`${apiUrl}?action=getData`, { redirect: 'follow', mode: 'cors' });
                if (response.ok) {
                    const data = await response.json();
                    if (data.accounts) {
                        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(data.accounts));
                        return data.accounts;
                    }
                }
            } catch (e) {
                console.warn("Cloud Account Fetch Failed", e);
            }
        }
        return StorageService.fetchAccountsLocal();
    },

    fetchAccountsLocal: () => {
        try {
            const data = localStorage.getItem(ACCOUNTS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    saveAccounts: async (accounts) => {
        const apiUrl = StorageService.getApiUrl();

        // Always save local first
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

        if (apiUrl) {
            fetch(apiUrl, {
                method: 'POST',
                body: JSON.stringify({ action: 'saveAccounts', payload: accounts }),
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
                if (response.ok) {
                    const data = await response.json();
                    if (data.budgets) {
                        localStorage.setItem(BUDGETS_KEY, JSON.stringify(data.budgets));
                        return data.budgets;
                    }
                }
            } catch (e) { console.warn("Cloud Budget Fetch Failed", e); }
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

        const data = {
            transactions: transactions ? JSON.parse(transactions) : [],
            accounts: accounts ? JSON.parse(accounts) : [],
            budgets: budgets ? JSON.parse(budgets) : {}
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

                return parsed;
            }
            throw new Error('Invalid data format');
        } catch (e) {
            console.error('Import failed', e);
            return null;
        }
    }
};
