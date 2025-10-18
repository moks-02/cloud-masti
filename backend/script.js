// Expense Tracker App JavaScript

class ExpenseTracker {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateSummary();
        this.displayTransactions();
        this.updateCategoryBreakdown();
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
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Card hover animations
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mouseenter', this.animateCard);
            card.addEventListener('mouseleave', this.resetCard);
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

    addTransaction() {
        const description = document.getElementById('description').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const type = document.getElementById('type').value;

        if (!description || !amount || !category || !type) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        const transaction = {
            id: Date.now(),
            description,
            amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
            category,
            type,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };

        this.transactions.unshift(transaction);
        this.saveTransactions();
        this.updateSummary();
        this.displayTransactions();
        this.updateCategoryBreakdown();
        this.resetForm();
        this.showNotification(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`, 'success');
    }

    deleteTransaction(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveTransactions();
        this.updateSummary();
        this.displayTransactions();
        this.updateCategoryBreakdown();
        this.showNotification('Transaction deleted successfully!', 'success');
    }

    updateSummary() {
        const income = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

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
                    <button class="delete-btn" onclick="tracker.deleteTransaction(${transaction.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateCategoryBreakdown() {
        const categoryBreakdown = document.getElementById('categoryBreakdown');
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

    saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }

    animateCard(e) {
        e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
    }

    resetCard(e) {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
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

// Add floating animation to cards
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.style.animation = 'fadeInUp 0.6s ease forwards';
    });
});

// Initialize the expense tracker
const tracker = new ExpenseTracker();

// Add some sample data for demonstration (remove this in production)
if (tracker.transactions.length === 0) {
    const sampleTransactions = [
        {
            id: Date.now() - 1000,
            description: 'Salary',
            amount: 3000,
            category: 'income',
            type: 'income',
            date: new Date().toISOString(),
            timestamp: Date.now() - 1000
        },
        {
            id: Date.now() - 2000,
            description: 'Grocery Shopping',
            amount: -85.50,
            category: 'food',
            type: 'expense',
            date: new Date(Date.now() - 86400000).toISOString(),
            timestamp: Date.now() - 2000
        },
        {
            id: Date.now() - 3000,
            description: 'Gas Station',
            amount: -45.20,
            category: 'transportation',
            type: 'expense',
            date: new Date(Date.now() - 172800000).toISOString(),
            timestamp: Date.now() - 3000
        }
    ];

    tracker.transactions = sampleTransactions;
    tracker.saveTransactions();
    tracker.updateSummary();
    tracker.displayTransactions();
    tracker.updateCategoryBreakdown();
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N to add new transaction
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        tracker.switchSection('dashboard');
        document.getElementById('description').focus();
    }

    // Escape to clear form
    if (e.key === 'Escape') {
        tracker.resetForm();
    }
});

// Add visual feedback for form inputs
document.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('focus', function () {
        this.parentElement.style.transform = 'scale(1.02)';
        this.parentElement.style.transition = 'transform 0.2s ease';
    });

    input.addEventListener('blur', function () {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// Add ripple effect to buttons
document.querySelectorAll('.btn-primary, .filter-btn, .nav-link').forEach(button => {
    button.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);