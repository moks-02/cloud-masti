const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Transaction must belong to a user']
    },
    description: {
        type: String,
        required: [true, 'Transaction description is required'],
        trim: true,
        maxlength: [100, 'Description cannot be more than 100 characters']
    },
    amount: {
        type: Number,
        required: [true, 'Transaction amount is required'],
        validate: {
            validator: function(value) {
                return value !== 0;
            },
            message: 'Amount cannot be zero'
        }
    },
    type: {
        type: String,
        required: [true, 'Transaction type is required'],
        enum: {
            values: ['income', 'expense'],
            message: 'Type must be either income or expense'
        }
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: [
                'food',
                'transportation',
                'shopping',
                'entertainment',
                'bills',
                'health',
                'income',
                'education',
                'travel',
                'investment',
                'other'
            ],
            message: 'Invalid category'
        }
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot be more than 500 characters'],
        trim: true
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurringFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        default: null
    },
    attachments: [{
        filename: String,
        path: String,
        size: Number
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for better query performance
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1 });
transactionSchema.index({ user: 1, type: 1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(Math.abs(this.amount));
});

// Virtual for display amount (with + or - sign)
transactionSchema.virtual('displayAmount').get(function() {
    const sign = this.type === 'income' ? '+' : '-';
    return `${sign}${this.formattedAmount}`;
});

// Pre-save middleware to ensure amount sign matches type
transactionSchema.pre('save', function(next) {
    if (this.type === 'expense' && this.amount > 0) {
        this.amount = -Math.abs(this.amount);
    } else if (this.type === 'income' && this.amount < 0) {
        this.amount = Math.abs(this.amount);
    }
    next();
});

// Static method to get user's balance
transactionSchema.statics.getUserBalance = async function(userId) {
    const result = await this.aggregate([
        { $match: { user: mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalIncome: {
                    $sum: {
                        $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
                    }
                },
                totalExpense: {
                    $sum: {
                        $cond: [{ $eq: ['$type', 'expense'] }, { $abs: '$amount' }, 0]
                    }
                }
            }
        }
    ]);

    if (result.length === 0) {
        return { balance: 0, totalIncome: 0, totalExpense: 0 };
    }

    const { totalIncome, totalExpense } = result[0];
    return {
        balance: totalIncome - totalExpense,
        totalIncome,
        totalExpense
    };
};

// Static method to get category breakdown
transactionSchema.statics.getCategoryBreakdown = async function(userId, startDate, endDate) {
    const matchStage = {
        user: mongoose.Types.ObjectId(userId),
        type: 'expense'
    };

    if (startDate && endDate) {
        matchStage.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    return await this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$category',
                total: { $sum: { $abs: '$amount' } },
                count: { $sum: 1 },
                percentage: { $sum: { $abs: '$amount' } }
            }
        },
        { $sort: { total: -1 } }
    ]);
};

module.exports = mongoose.model('Transaction', transactionSchema);