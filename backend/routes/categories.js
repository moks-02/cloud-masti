const express = require('express');

const router = express.Router();

// Get all available categories
router.get('/', (req, res) => {
    const categories = [
        {
            id: 'food',
            name: 'Food & Dining',
            icon: 'fas fa-utensils',
            color: '#f59e0b'
        },
        {
            id: 'transportation',
            name: 'Transportation',
            icon: 'fas fa-car',
            color: '#06b6d4'
        },
        {
            id: 'shopping',
            name: 'Shopping',
            icon: 'fas fa-shopping-bag',
            color: '#ec4899'
        },
        {
            id: 'entertainment',
            name: 'Entertainment',
            icon: 'fas fa-gamepad',
            color: '#8b5cf6'
        },
        {
            id: 'bills',
            name: 'Bills & Utilities',
            icon: 'fas fa-file-invoice-dollar',
            color: '#ef4444'
        },
        {
            id: 'health',
            name: 'Health & Fitness',
            icon: 'fas fa-heartbeat',
            color: '#10b981'
        },
        {
            id: 'education',
            name: 'Education',
            icon: 'fas fa-graduation-cap',
            color: '#3b82f6'
        },
        {
            id: 'travel',
            name: 'Travel',
            icon: 'fas fa-plane',
            color: '#06b6d4'
        },
        {
            id: 'investment',
            name: 'Investment',
            icon: 'fas fa-chart-line',
            color: '#10b981'
        },
        {
            id: 'income',
            name: 'Income',
            icon: 'fas fa-dollar-sign',
            color: '#10b981'
        },
        {
            id: 'other',
            name: 'Other',
            icon: 'fas fa-question',
            color: '#6b7280'
        }
    ];

    res.status(200).json({
        status: 'success',
        results: categories.length,
        data: {
            categories
        }
    });
});

// Get category by ID
router.get('/:id', (req, res) => {
    const categories = {
        food: {
            id: 'food',
            name: 'Food & Dining',
            icon: 'fas fa-utensils',
            color: '#f59e0b'
        },
        transportation: {
            id: 'transportation',
            name: 'Transportation',
            icon: 'fas fa-car',
            color: '#06b6d4'
        },
        shopping: {
            id: 'shopping',
            name: 'Shopping',
            icon: 'fas fa-shopping-bag',
            color: '#ec4899'
        },
        entertainment: {
            id: 'entertainment',
            name: 'Entertainment',
            icon: 'fas fa-gamepad',
            color: '#8b5cf6'
        },
        bills: {
            id: 'bills',
            name: 'Bills & Utilities',
            icon: 'fas fa-file-invoice-dollar',
            color: '#ef4444'
        },
        health: {
            id: 'health',
            name: 'Health & Fitness',
            icon: 'fas fa-heartbeat',
            color: '#10b981'
        },
        education: {
            id: 'education',
            name: 'Education',
            icon: 'fas fa-graduation-cap',
            color: '#3b82f6'
        },
        travel: {
            id: 'travel',
            name: 'Travel',
            icon: 'fas fa-plane',
            color: '#06b6d4'
        },
        investment: {
            id: 'investment',
            name: 'Investment',
            icon: 'fas fa-chart-line',
            color: '#10b981'
        },
        income: {
            id: 'income',
            name: 'Income',
            icon: 'fas fa-dollar-sign',
            color: '#10b981'
        },
        other: {
            id: 'other',
            name: 'Other',
            icon: 'fas fa-question',
            color: '#6b7280'
        }
    };

    const category = categories[req.params.id];
    
    if (!category) {
        return res.status(404).json({
            status: 'fail',
            message: 'Category not found'
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            category
        }
    });
});

module.exports = router;