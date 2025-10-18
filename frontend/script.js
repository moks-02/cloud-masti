// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// API Helper class
class API {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { Authorization: `Bearer ${this.token}` })
            },
            ...options
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication methods
    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: { email, password }
        });

        if (data.token) {
            this.token = data.token;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
        }

        return data;
    }

    async register(name, email, password) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: { name, email, password }
        });

        if (data.token) {
            this.token = data.token;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
        }

        return data;
    }

    logout() {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    // Transaction methods
    async getTransactions(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/transactions?${queryString}`);
    }

    async createTransaction(transaction) {
        return await this.request('/transactions', {
            method: 'POST',
            body: transaction
        });
    }

    async updateTransaction(id, transaction) {
        return await this.request(`/transactions/${id}`, {
            method: 'PATCH',
            body: transaction
        });
    }

    async deleteTransaction(id) {
        return await this.request(`/transactions/${id}`, {
            method: 'DELETE'
        });
    }

    async getBalance() {
        return await this.request('/transactions/summary/balance');
    }

    // Analytics methods
    async getCategoryAnalytics(startDate, endDate) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        return await this.request(`/analytics/categories?${params}`);
    }

    async getMonthlyTrends(year) {
        return await this.request(`/analytics/monthly-trends?year=${year}`);
    }
}

// Enhanced Expense Tracker with Backend Integration
class ExpenseTracker {
    constructor() {
        this.api = new API();
        this.transactions = [];
        this.currentFilter = 'all';
        this.isOnline = navigator.onLine;

        // Check if user is logged in
        this.user = JSON.parse(localStorage.getItem('user'));
        this.isAuthenticated = !!this.api.token;

        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupNetworkListener();

        if (this.isAuthenticated) {
            await this.loadData();
        } else {
            this.showAuthModal();
        }
    }

    setupNetworkListener() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNotification('Back online! Syncing data...', 'success');
            if (this.isAuthenticated) {
                this.loadData();
            }
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNotification('You are offline. Changes will be synced when connection is restored.', 'error');
        });
    }

    async loadData() {
        try {
            // Load transactions
            const transactionsData = await this.api.getTransactions();
            this.transactions = transactionsData.data.transactions;

            // Update UI
            this.updateSummary();
            this.displayTransactions();
            this.updateCategoryBreakdown();

        } catch (error) {
            console.error('Failed to load data:', error);
            // Fall back to local storage if API fails
            this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
            this.updateSummary();
            this.displayTransactions();
            this.updateCategoryBreakdown();
            this.showNotification('Using offline data. Some features may be limited.', 'error');
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(e.target.dataset.section);
            });
        });

        // Form submission
        const form = document.getElementById('transactionForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addTransaction();
            });
        }

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Add logout functionality
        this.addLogoutButton();
    }

    addLogoutButton() {
        if (!this.isAuthenticated) return;

        const navMenu = document.querySelector('.nav-menu');
        const logoutBtn = document.createElement('a');
        logoutBtn.href = '#';
        logoutBtn.className = 'nav-link';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
        navMenu.appendChild(logoutBtn);
    }

    logout() {
        this.api.logout();
        this.isAuthenticated = false;
        this.user = null;
        location.reload();
    }

    showAuthModal() {
        // Create a simple auth modal
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-content">
                <h2>Welcome to FinanceTracker</h2>
                <div class="auth-tabs">
                    <button class="auth-tab active" data-tab="login">Login</button>
                    <button class="auth-tab" data-tab="register">Register</button>
                </div>
                
                <form id="loginForm" class="auth-form">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="loginEmail" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="loginPassword" required>
                    </div>
                    <button type="submit" class="btn-primary">Login</button>
                </form>
                
                <form id="registerForm" class="auth-form" style="display: none;">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" id="registerName" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="registerEmail" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="registerPassword" required>
                    </div>
                    <button type="submit" class="btn-primary">Register</button>
                </form>
                
                <p class="offline-notice">
                    <i class="fas fa-wifi"></i>
                    You can also use the app offline with limited features
                    <button class="btn-secondary" id="continueOffline">Continue Offline</button>
                </p>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupAuthModal(modal);
    }

    setupAuthModal(modal) {
        // Tab switching
        modal.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                modal.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                modal.querySelectorAll('.auth-form').forEach(f => f.style.display = 'none');

                tab.classList.add('active');
                modal.querySelector(`#${tab.dataset.tab}Form`).style.display = 'block';
            });
        });

        // Login form
        modal.querySelector('#loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = modal.querySelector('#loginEmail').value;
            const password = modal.querySelector('#loginPassword').value;

            try {
                await this.api.login(email, password);
                this.isAuthenticated = true;
                this.user = JSON.parse(localStorage.getItem('user'));
                modal.remove();
                location.reload();
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        });

        // Register form
        modal.querySelector('#registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = modal.querySelector('#registerName').value;
            const email = modal.querySelector('#registerEmail').value;
            const password = modal.querySelector('#registerPassword').value;

            try {
                await this.api.register(name, email, password);
                this.isAuthenticated = true;
                this.user = JSON.parse(localStorage.getItem('user'));
                modal.remove();
                location.reload();
            } catch (error) {
                this.showNotification(error.message, 'error');
            }
        });

        // Continue offline
        modal.querySelector('#continueOffline').addEventListener('click', () => {
            modal.remove();
            this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
            this.updateSummary();
            this.displayTransactions();
            this.updateCategoryBreakdown();
            this.showNotification('Using offline mode. Sign up to sync your data across devices!', 'success');
        });
    }

    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');
    }

    async addTransaction() {
        const description = document.getElementById('description').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const type = document.getElementById('type').value;

        if (!description || !amount || !category || !type) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        const transaction = {
            description,
            amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
            category,
            type,
            date: new Date().toISOString()
        };

        try {
            if (this.isAuthenticated && this.isOnline) {
                // Save to backend
                const response = await this.api.createTransaction(transaction);
                transaction.id = response.data.transaction._id;
                transaction._id = response.data.transaction._id;
            } else {
                // Save locally
                transaction.id = Date.now();
                transaction._id = Date.now();
            }

            this.transactions.unshift(transaction);
            this.saveToLocalStorage();

            this.updateSummary();
            this.displayTransactions();
            this.updateCategoryBreakdown();
            this.resetForm();
            this.showNotification(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`, 'success');

        } catch (error) {
            this.showNotification('Failed to save transaction: ' + error.message, 'error');
        }
    }

    async deleteTransaction(id) {
        try {
            if (this.isAuthenticated && this.isOnline) {
                await this.api.deleteTransaction(id);
            }

            this.transactions = this.transactions.filter(t => (t.id || t._id) !== id);
            this.saveToLocalStorage();

            this.updateSummary();
            this.displayTransactions();
            this.updateCategoryBreakdown();
            this.showNotification('Transaction deleted successfully!', 'success');

        } catch (error) {
            this.showNotification('Failed to delete transaction: ' + error.message, 'error');
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }

    async updateSummary() {
        try {
            if (this.isAuthenticated && this.isOnline) {
                const balanceData = await this.api.getBalance();
                const { balance, totalIncome, totalExpense } = balanceData.data;

                document.querySelector('.balance-amount').textContent = this.formatCurrency(balance);
                document.querySelector('.income-amount').textContent = this.formatCurrency(totalIncome);
                document.querySelector('.expense-amount').textContent = this.formatCurrency(totalExpense);

                // Add color coding for balance
                const balanceElement = document.querySelector('.balance-amount');
                balanceElement.style.color = balance >= 0 ? '#10b981' : '#ef4444';
                return;
            }
        } catch (error) {
            console.error('Failed to get balance from API, using local calculation');
        }

        // Fallback to local calculation
        const income = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const expenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const balance = income - expenses;

        document.querySelector('.balance-amount').textContent = this.formatCurrency(balance);
        document.querySelector('.income-amount').textContent = this.formatCurrency(income);
        document.querySelector('.expense-amount').textContent = this.formatCurrency(expenses);

        // Add color coding for balance
        const balanceElement = document.querySelector('.balance-amount');
        balanceElement.style.color = balance >= 0 ? '#10b981' : '#ef4444';
    }

    displayTransactions() {
        const transactionList = document.getElementById('transactionList');
        let filteredTransactions = this.transactions;

        if (this.currentFilter !== 'all') {
            filteredTransactions = this.transactions.filter(t => t.type === this.currentFilter);
        }

        if (filteredTransactions.length === 0) {
            transactionList.innerHTML = `
                <div class="no-transactions">
                    <i class="fas fa-receipt" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                    <p style="color: #64748b; text-align: center;">No transactions found</p>
                </div>
            `;
            return;
        }

        transactionList.innerHTML = filteredTransactions.map(transaction => `
            <div class="transaction-item" style="animation: slideInLeft 0.4s ease;">
                <div class="transaction-info">
                    <div class="transaction-icon" style="background: ${this.getCategoryColor(transaction.category)};">
                        <i class="${this.getCategoryIcon(transaction.category)}"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${transaction.description}</h4>
                        <p>${this.getCategoryName(transaction.category)} • ${this.formatDate(transaction.date)}</p>
                    </div>
                </div>
                <div style="display: flex; align-items: center;">
                    <span class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : ''}${this.formatCurrency(Math.abs(transaction.amount))}
                    </span>
                    <button class="delete-btn" onclick="tracker.deleteTransaction('${transaction.id || transaction._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    async updateCategoryBreakdown() {
        const categoryBreakdown = document.getElementById('categoryBreakdown');

        try {
            if (this.isAuthenticated && this.isOnline) {
                const analyticsData = await this.api.getCategoryAnalytics();
                const categories = analyticsData.data.categories;

                if (categories.length === 0) {
                    categoryBreakdown.innerHTML = '<p style="text-align: center; color: #64748b;">No expense data available</p>';
                    return;
                }

                categoryBreakdown.innerHTML = categories.map(category => `
                    <div class="category-item">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 30px; height: 30px; border-radius: 8px; background: ${this.getCategoryColor(category._id)}; display: flex; align-items: center; justify-content: center;">
                                <i class="${this.getCategoryIcon(category._id)}" style="color: white; font-size: 0.9rem;"></i>
                            </div>
                            <span>${this.getCategoryName(category._id)}</span>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 600;">${this.formatCurrency(category.total)}</div>
                            <div style="font-size: 0.8rem; color: #64748b;">${category.percentage}%</div>
                        </div>
                    </div>
                `).join('');
                return;
            }
        } catch (error) {
            console.error('Failed to get analytics from API, using local calculation');
        }

        // Fallback to local calculation
        const expenses = this.transactions.filter(t => t.type === 'expense');

        if (expenses.length === 0) {
            categoryBreakdown.innerHTML = '<p style="text-align: center; color: #64748b;">No expense data available</p>';
            return;
        }

        const categoryTotals = {};
        expenses.forEach(expense => {
            const category = expense.category;
            categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(expense.amount);
        });

        const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

        categoryBreakdown.innerHTML = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)
            .map(([category, amount]) => {
                const percentage = ((amount / totalExpenses) * 100).toFixed(1);
                return `
                    <div class="category-item">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 30px; height: 30px; border-radius: 8px; background: ${this.getCategoryColor(category)}; display: flex; align-items: center; justify-content: center;">
                                <i class="${this.getCategoryIcon(category)}" style="color: white; font-size: 0.9rem;"></i>
                            </div>
                            <span>${this.getCategoryName(category)}</span>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 600;">${this.formatCurrency(amount)}</div>
                            <div style="font-size: 0.8rem; color: #64748b;">${percentage}%</div>
                        </div>
                    </div>
                `;
            }).join('');
    }

    setFilter(filter) {
        this.currentFilter = filter;

        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        this.displayTransactions();
    }

    getCategoryIcon(category) {
        const icons = {
            food: 'fas fa-utensils',
            transportation: 'fas fa-car',
            shopping: 'fas fa-shopping-bag',
            entertainment: 'fas fa-gamepad',
            bills: 'fas fa-file-invoice-dollar',
            health: 'fas fa-heartbeat',
            income: 'fas fa-dollar-sign',
            education: 'fas fa-graduation-cap',
            travel: 'fas fa-plane',
            investment: 'fas fa-chart-line',
            other: 'fas fa-question'
        };
        return icons[category] || icons.other;
    }

    getCategoryName(category) {
        const names = {
            food: 'Food & Dining',
            transportation: 'Transportation',
            shopping: 'Shopping',
            entertainment: 'Entertainment',
            bills: 'Bills & Utilities',
            health: 'Health & Fitness',
            income: 'Income',
            education: 'Education',
            travel: 'Travel',
            investment: 'Investment',
            other: 'Other'
        };
        return names[category] || 'Other';
    }

    getCategoryColor(category) {
        const colors = {
            food: '#f59e0b',
            transportation: '#06b6d4',
            shopping: '#ec4899',
            entertainment: '#8b5cf6',
            bills: '#ef4444',
            health: '#10b981',
            income: '#10b981',
            education: '#3b82f6',
            travel: '#06b6d4',
            investment: '#10b981',
            other: '#6b7280'
        };
        return colors[category] || colors.other;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    showNotification(message, type) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    resetForm() {
        document.getElementById('transactionForm').reset();

        // Add a subtle animation to the form reset
        const form = document.getElementById('transactionForm');
        form.style.opacity = '0.7';
        setTimeout(() => {
            form.style.opacity = '1';
        }, 200);
    }
}

// Enhanced scroll effects for navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.borderBottom = '1px solid #cbd5e1';
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.borderBottom = '1px solid #e2e8f0';
        navbar.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
    }
});

// Initialize the expense tracker
let tracker;
document.addEventListener('DOMContentLoaded', () => {
    tracker = new ExpenseTracker();
});