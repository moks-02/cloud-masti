const express = require('express');
const Transaction = require('../models/Transaction');

const router = express.Router();

// Get spending analytics by category
router.get('/categories', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const breakdown = await Transaction.getCategoryBreakdown(
            req.user._id,
            startDate,
            endDate
        );

        // Calculate total for percentage
        const total = breakdown.reduce((sum, item) => sum + item.total, 0);
        
        // Add percentage to each category
        const categoriesWithPercentage = breakdown.map(item => ({
            ...item,
            percentage: total > 0 ? ((item.total / total) * 100).toFixed(1) : 0
        }));

        res.status(200).json({
            status: 'success',
            data: {
                categories: categoriesWithPercentage,
                total
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});

// Get monthly spending trends
router.get('/monthly-trends', async (req, res) => {
    try {
        const { year = new Date().getFullYear() } = req.query;
        
        const trends = await Transaction.aggregate([
            {
                $match: {
                    user: req.user._id,
                    date: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$date' },
                        type: '$type'
                    },
                    total: { $sum: { $abs: '$amount' } },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.month',
                    income: {
                        $sum: {
                            $cond: [{ $eq: ['$_id.type', 'income'] }, '$total', 0]
                        }
                    },
                    expense: {
                        $sum: {
                            $cond: [{ $eq: ['$_id.type', 'expense'] }, '$total', 0]
                        }
                    },
                    transactions: { $sum: '$count' }
                }
            },
            {
                $addFields: {
                    balance: { $subtract: ['$income', '$expense'] }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Fill missing months with zero values
        const monthlyData = Array.from({ length: 12 }, (_, index) => {
            const month = index + 1;
            const existing = trends.find(item => item._id === month);
            return {
                month,
                monthName: new Date(year, index).toLocaleString('default', { month: 'short' }),
                income: existing?.income || 0,
                expense: existing?.expense || 0,
                balance: existing?.balance || 0,
                transactions: existing?.transactions || 0
            };
        });

        res.status(200).json({
            status: 'success',
            data: {
                year: parseInt(year),
                months: monthlyData
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});

// Get daily spending for current month
router.get('/daily-spending', async (req, res) => {
    try {
        const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query;
        
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const dailySpending = await Transaction.aggregate([
            {
                $match: {
                    user: req.user._id,
                    type: 'expense',
                    date: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: '$date' },
                    total: { $sum: { $abs: '$amount' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Fill missing days with zero values
        const daysInMonth = endDate.getDate();
        const dailyData = Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const existing = dailySpending.find(item => item._id === day);
            return {
                day,
                total: existing?.total || 0,
                count: existing?.count || 0
            };
        });

        res.status(200).json({
            status: 'success',
            data: {
                month: parseInt(month),
                year: parseInt(year),
                days: dailyData
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});

// Get recent transactions summary
router.get('/summary', async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        // Get total summary
        const summary = await Transaction.getUserBalance(req.user._id);

        // Get recent period summary
        const recentSummary = await Transaction.aggregate([
            {
                $match: {
                    user: req.user._id,
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: { $abs: '$amount' } },
                    count: { $sum: 1 }
                }
            }
        ]);

        const recentIncome = recentSummary.find(item => item._id === 'income')?.total || 0;
        const recentExpense = recentSummary.find(item => item._id === 'expense')?.total || 0;

        // Get top categories for recent period
        const topCategories = await Transaction.aggregate([
            {
                $match: {
                    user: req.user._id,
                    type: 'expense',
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: { $abs: '$amount' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } },
            { $limit: 5 }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                overall: summary,
                recent: {
                    period: `${days} days`,
                    income: recentIncome,
                    expense: recentExpense,
                    balance: recentIncome - recentExpense
                },
                topCategories
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});

module.exports = router;