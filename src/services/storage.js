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
            console.log("Cloud Fetching from:", apiUrl);
            try {
                // Apps Script Web Apps redirect (302) to googleusercontent.com
                const response = await fetch(`${apiUrl}?action=getData`, {
                    method: 'GET',
                    redirect: 'follow',
                    mode: 'cors'
                });

                if (!response.ok) {
                    console.error("Cloud Error", response.status, await response.text());
                    return [];
                }

                const data = await response.json();
                console.log("Cloud Data Fetched:", data);
                return data.transactions || [];
            } catch (e) {
                console.error("Cloud fetch failed", e);
                console.error("Attempted URL:", `${apiUrl}?action=getData`);
                return [];
            }
        }

        // ... local fallback ...
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

        if (apiUrl) {
            console.log("Saving to Cloud:", transaction);
            try {
                await fetch(apiUrl, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'saveTransaction', payload: transaction }),
                    headers: { 'Content-Type': 'text/plain' },
                    redirect: 'follow',
                    mode: 'cors'
                });
                return await StorageService.fetchTransactions();
            } catch (e) {
                console.error("Cloud Save Failed", e);
            }
        }

        // Local Implementation
        let transactions = await StorageService.fetchTransactions();
        const updatedTs = [transaction, ...transactions];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTs));

        // Update Account Balance Locally
        if (transaction.accountId) {
            await StorageService.updateLocalBalance(transaction, 'add');
        }
        return updatedTs;
    },

    deleteTransaction: async (id) => {
        const apiUrl = StorageService.getApiUrl();
        if (apiUrl) {
            try {
                await fetch(apiUrl, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'deleteTransaction', id }),
                    headers: { 'Content-Type': 'text/plain' },
                    redirect: 'follow',
                    mode: 'cors'
                });
                return await StorageService.fetchTransactions();
            } catch (e) { console.error("Cloud Delete Failed", e); }
        }

        // Local Implementation
        let transactions = await StorageService.fetchTransactions();
        const transactionToDelete = transactions.find(t => t.id === id);
        const updated = transactions.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        // Revert Account Balance
        if (transactionToDelete) {
            await StorageService.updateLocalBalance(transactionToDelete, 'remove');
        }
        return updated;
    },

    // --- Accounts ---

    fetchAccounts: async () => {
        const apiUrl = StorageService.getApiUrl();
        if (apiUrl) {
            try {
                const response = await fetch(`${apiUrl}?action=getData`, { redirect: 'follow', mode: 'cors' });
                if (!response.ok) throw new Error("Status " + response.status);
                const data = await response.json();
                return data.accounts || [];
            } catch (e) {
                console.error("Account Fetch Failed", e);
                return [];
            }
        }

        try {
            const data = localStorage.getItem(ACCOUNTS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    saveAccounts: async (accounts) => {
        const apiUrl = StorageService.getApiUrl();
        if (apiUrl) {
            await fetch(apiUrl, {
                method: 'POST',
                body: JSON.stringify({ action: 'saveAccounts', payload: accounts }),
                headers: { 'Content-Type': 'text/plain' },
                redirect: 'follow',
                mode: 'cors'
            });
            return accounts;
        }

        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
        return accounts;
    },

    // --- Budgets ---

    fetchBudgets: async () => {
        const apiUrl = StorageService.getApiUrl();
        if (apiUrl) {
            try {
                const response = await fetch(`${apiUrl}?action=getData`, { redirect: 'follow', mode: 'cors' });
                const data = await response.json();
                return data.budgets || {};
            } catch (e) { return {}; }
        }

        try {
            const data = localStorage.getItem(BUDGETS_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) { return {}; }
    },

    saveBudgets: async (budgets) => {
        const apiUrl = StorageService.getApiUrl();
        if (apiUrl) {
            await fetch(apiUrl, {
                method: 'POST',
                body: JSON.stringify({ action: 'saveBudgets', payload: budgets }),
                headers: { 'Content-Type': 'text/plain' },
                redirect: 'follow',
                mode: 'cors'
            });
            return budgets;
        }

        localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
        return budgets;
    },

    // --- Helpers ---

    updateLocalBalance: async (transaction, mode) => {
        if (!transaction.accountId) return;

        let accounts = await StorageService.fetchAccounts();
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
