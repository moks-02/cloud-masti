const express = require('express');
const Transaction = require('../models/Transaction');

const router = express.Router();

// Get all transactions for authenticated user
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, type, category, startDate, endDate } = req.query;
        
        // Build query
        const query = { user: req.user._id };
        
        if (type) query.type = type;
        if (category) query.category = category;
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Execute query with pagination
        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await Transaction.countDocuments(query);

        res.status(200).json({
            status: 'success',
            results: transactions.length,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            },
            data: {
                transactions
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});

// Get single transaction
router.get('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!transaction) {
            return res.status(404).json({
                status: 'fail',
                message: 'Transaction not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                transaction
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});

// Create new transaction
router.post('/', async (req, res) => {
    try {
        const transactionData = {
            ...req.body,
            user: req.user._id
        };

        const transaction = await Transaction.create(transactionData);

        res.status(201).json({
            status: 'success',
            data: {
                transaction
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});

// Update transaction
router.patch('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!transaction) {
            return res.status(404).json({
                status: 'fail',
                message: 'Transaction not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                transaction
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});

// Delete transaction
router.delete('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!transaction) {
            return res.status(404).json({
                status: 'fail',
                message: 'Transaction not found'
            });
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});

// Get user balance and summary
router.get('/summary/balance', async (req, res) => {
    try {
        const summary = await Transaction.getUserBalance(req.user._id);
        
        res.status(200).json({
            status: 'success',
            data: summary
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});

// Bulk delete transactions
router.delete('/bulk/delete', async (req, res) => {
    try {
        const { transactionIds } = req.body;
        
        if (!transactionIds || !Array.isArray(transactionIds)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide an array of transaction IDs'
            });
        }

        const result = await Transaction.deleteMany({
            _id: { $in: transactionIds },
            user: req.user._id
        });

        res.status(200).json({
            status: 'success',
            message: `${result.deletedCount} transactions deleted`,
            data: {
                deletedCount: result.deletedCount
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