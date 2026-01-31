# Accounts Manager

A modern, offline-first personal finance application inspired by the 'Fold' design philosophy. Built for speed, privacy, and seamless cross-device synchronization using your own Google Sheet as a backend.

## ✨ Key Features

- **Smart Expense Parsing**: Paste raw transaction text (e.g., "Paid 500 for Food") and let the natural language parser handle the categorization and amount extraction.
- **Glassmorphism UI**: A beautiful, premium interface with smooth animations, dark mode aesthetics, and intuitive navigation.
- **Google Sheets Sync**: Your data is yours. Syncs seamlessly with a private Google Sheet for backup and advanced analysis.
- **Investment Portfolio**: Track Mutual Funds (with AMFI integration), Stocks, Gold, and PF accounts with live value updates.
- **Goals Tracking**: Set saving targets, track progress, and visualize your financial dreams.
- **Smart Budgeting**: Set monthly category limits and track credit card usage vs limits.
- **Pinch-to-Privacy**: Strict scroll controls and mobile-optimized gestures for a native app feel on the web.

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite
- **Styling**: Vanilla CSS (Custom Design System, Glassmorphism)
- **Icons**: Lucide React
- **Data Persistence**: LocalStorage (Offline) + Google Apps Script (Cloud)
- **Charts**: Recharts

## 🚀 Getting Started

This application is designed to run directly in the browser without a backend server (Serverless).

### Deployment

**Option 1: GitHub Pages (Recommended)**

1.  Fork this repository.
2.  Enable **GitHub Pages** in your repo settings (Settings > Pages).
3.  Set the source branch to `main`.
4.  Your app will be live at `https://your-username.github.io/accounts-manager/`.

**Option 2: Local Development**

If you want to modify the code:

1.  Clone the repository:
    ```bash
    git clone https://github.com/naman0815/accounts-manager.git
    cd accounts-manager
    ```

2.  Install dependencies & Run:
    ```bash
    npm install
    npm run dev
    ```

## ☁️ Setting Up Cloud Sync (Google Sheets)

This app uses a Google Sheet as its database. No third-party servers involved.

1.  **Create a Google Sheet**:
    - Go to `sheets.new` and create a blank sheet.
    - Name it "Accounts Manager DB".

2.  **Open Apps Script**:
    - Click `Extensions` > `Apps Script`.

3.  **Paste the Backend Code**:
    - Delete any code in `Code.gs`.
    - Paste the snippet below:

    ```javascript
    function doPost(e) {
      const lock = LockService.getScriptLock();
      lock.tryLock(10000);
      
      try {
        const data = JSON.parse(e.postData.contents);
        const action = data.action;
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        
        if (action === 'saveTransaction') {
             // Logic to append transaction to 'Transactions' sheet
             // (See full implementation in docs or source)
        } 
        // ... handle saveAccounts, saveGoals, etc.
        
        return ContentService.createTextOutput("Success");
      } catch (e) {
        return ContentService.createTextOutput("Error: " + e.toString());
      } finally {
        lock.releaseLock();
      }
    }

    function doGet(e) {
       // Logic to fetch all data
    }
    ```
    > **Note**: For the full, up-to-date Google Apps Script code, please check `backend/Code.gs` (create this file if you wish to version control your backend logic) or refer to the integration instructions provided during development.

4.  **Deploy as Web App**:
    - Click `Deploy` > `New Deployment`.
    - **Select type**: `Web app`.
    - **Description**: "v1".
    - **Execute as**: `Me` (your email).
    - **Who has access**: `Anyone`. (Important for the app to access it without complex OAuth).
    - Click `Deploy`.

5.  **Connect the App**:
    - Copy the **Web App URL** (ends in `/exec`).
    - Open Accounts Manager > **Settings** > **Cloud Sync**.
    - Paste the URL and click **Test**.

## 📱 Mobile Usage

- The app is designed as a PWA.
- On iOS (Safari): Tap `Share` > `Add to Home Screen`.
- On Android (Chrome): Tap `Menu` > `Add to Home Screen`.

## 🤝 Contributing

I made this shit using AI so idek what any of this means; but feel free to contribute.

## 📄 License

[MIT](https://choosealicense.com/licenses/mit/)
