const express = require('express');
const Expense = require('../models/Expense');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { validate, expenseSchema } = require('../middleware/validation');

const router = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, type, startDate, endDate } = req.query;
    
    // Build query
    const query = { user: req.user.id };
    
    if (category) query.category = category;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Expense.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: expenses.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      expenses
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

router.post('/', validate(expenseSchema), async (req, res) => {
  try {
    const expenseData = {
      ...req.body,
      user: req.user.id
    };

    const expense = await Expense.create(expenseData);

    // Update user totals
    const user = await User.findById(req.user.id);
    if (expense.type === 'expense') {
      user.totalExpenses += expense.amount;
    } else {
      user.totalIncome += expense.amount;
    }
    await user.save();

    res.status(201).json({
      status: 'success',
      message: 'Expense created successfully',
      expense
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!expense) {
      return res.status(404).json({
        status: 'error',
        message: 'Expense not found'
      });
    }

    res.status(200).json({
      status: 'success',
      expense
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

router.put('/:id', validate(expenseSchema), async (req, res) => {
  try {
    const oldExpense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!oldExpense) {
      return res.status(404).json({
        status: 'error',
        message: 'Expense not found'
      });
    }

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Update user totals
    const user = await User.findById(req.user.id);
    
    // Remove old amount
    if (oldExpense.type === 'expense') {
      user.totalExpenses -= oldExpense.amount;
    } else {
      user.totalIncome -= oldExpense.amount;
    }
    
    // Add new amount
    if (expense.type === 'expense') {
      user.totalExpenses += expense.amount;
    } else {
      user.totalIncome += expense.amount;
    }
    
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Expense updated successfully',
      expense
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!expense) {
      return res.status(404).json({
        status: 'error',
        message: 'Expense not found'
      });
    }

    await Expense.findByIdAndDelete(req.params.id);

    // Update user totals
    const user = await User.findById(req.user.id);
    if (expense.type === 'expense') {
      user.totalExpenses -= expense.amount;
    } else {
      user.totalIncome -= expense.amount;
    }
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/stats/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = { user: req.user._id };
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const stats = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Expense.aggregate([
      { $match: { ...matchStage, type: 'expense' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.status(200).json({
      status: 'success',
      stats: {
        summary: stats,
        categories: categoryStats
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;