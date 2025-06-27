const express = require('express');
const { protect } = require('../middleware/auth');
const Expense = require('../models/Expense');
const Committee = require('../models/Committee');
const User = require('../models/User');

const router = express.Router();

router.use(protect);

router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Message is required'
      });
    }

    // Get user data for personalized responses
    const user = await User.findById(req.user.id);
    const recentExpenses = await Expense.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(5);
    const userCommittees = await Committee.find({
      $or: [
        { creator: req.user.id },
        { 'slots.user': req.user.id }
      ]
    }).limit(3);

    // Simple AI response logic based on keywords
    const response = generateAIResponse(message.toLowerCase(), {
      user,
      recentExpenses,
      userCommittees
    });

    res.status(200).json({
      status: 'success',
      response,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

router.get('/insights', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get last 30 days expenses
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentExpenses = await Expense.find({
      user: req.user.id,
      date: { $gte: thirtyDaysAgo },
      type: 'expense'
    });

    const insights = generateInsights(user, recentExpenses);

    res.status(200).json({
      status: 'success',
      insights
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

function generateAIResponse(message, userData) {
  const { user, recentExpenses, userCommittees } = userData;
  
  // Expense-related queries
  if (message.includes('expense') || message.includes('spending')) {
    if (recentExpenses.length === 0) {
      return "I notice you haven't logged any expenses recently. Would you like me to help you track your spending?";
    }
    
    const totalSpent = recentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const avgExpense = totalSpent / recentExpenses.length;
    
    return `Based on your recent expenses, you've spent $${totalSpent.toFixed(2)} with an average of $${avgExpense.toFixed(2)} per transaction. Your top category is ${getMostFrequentCategory(recentExpenses)}. Would you like tips to reduce spending?`;
  }
  
  // Budget-related queries
  if (message.includes('budget') || message.includes('save')) {
    const remainingBalance = user.remainingBalance || 0;
    if (remainingBalance > 0) {
      return `Great! You have $${remainingBalance.toFixed(2)} remaining this month. Consider setting aside 20% for savings. Would you like me to help you create a savings goal?`;
    } else {
      return "It looks like you're over budget this month. Let's work on reducing expenses in your highest spending categories. Would you like specific suggestions?";
    }
  }
  
  // Committee-related queries
  if (message.includes('committee') || message.includes('group')) {
    if (userCommittees.length === 0) {
      return "You're not part of any committees yet. Joining a committee is a great way to save money with friends and family. Would you like me to help you find one?";
    }
    
    const activeCommittees = userCommittees.filter(c => c.status === 'active').length;
    return `You're part of ${userCommittees.length} committee(s), with ${activeCommittees} currently active. Committees are helping you save systematically. Keep up the good work!`;
  }
  
  // Goal-related queries
  if (message.includes('goal') || message.includes('target')) {
    return "Setting financial goals is crucial for success! I recommend the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Would you like help creating a specific savings goal?";
  }
  
  // General financial advice
  if (message.includes('help') || message.includes('advice')) {
    return "I'm here to help you manage your finances better! I can assist with expense tracking, budget planning, committee management, and financial goal setting. What specific area would you like to focus on?";
  }
  
  // Default responses
  const defaultResponses = [
    "I can help you track your expenses better. Try categorizing your spending to see where your money goes!",
    "Consider setting a monthly budget to reach your financial goals. Would you like help with that?",
    "Have you thought about joining a committee to save more effectively with others?",
    "Your financial health looks good! Keep tracking your expenses to maintain this momentum.",
    "I noticed some patterns in your spending. Would you like personalized tips to optimize your budget?"
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

function getMostFrequentCategory(expenses) {
  const categoryCount = {};
  expenses.forEach(exp => {
    categoryCount[exp.category] = (categoryCount[exp.category] || 0) + 1;
  });
  
  return Object.keys(categoryCount).reduce((a, b) => 
    categoryCount[a] > categoryCount[b] ? a : b
  ) || 'Food';
}

function generateInsights(user, expenses) {
  const insights = [];
  
  if (expenses.length === 0) {
    insights.push({
      type: 'reminder',
      message: "You haven't logged any expenses in the last 30 days. Regular tracking helps maintain financial awareness!",
      priority: 'high'
    });
    return insights;
  }
  
  // Spending pattern analysis
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const avgDaily = totalSpent / 30;
  
  if (avgDaily > 50) {
    insights.push({
      type: 'warning',
      message: `Your daily average spending is $${avgDaily.toFixed(2)}. Consider reviewing your expenses to identify savings opportunities.`,
      priority: 'medium'
    });
  }
  
  // Category analysis
  const categoryTotals = {};
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });
  
  const topCategory = Object.keys(categoryTotals).reduce((a, b) => 
    categoryTotals[a] > categoryTotals[b] ? a : b
  );
  
  insights.push({
    type: 'info',
    message: `Your highest spending category is ${topCategory} with $${categoryTotals[topCategory].toFixed(2)} spent this month.`,
    priority: 'low'
  });
  
  // Savings suggestion
  if (user.totalIncome > user.totalExpenses) {
    const savingsRate = ((user.totalIncome - user.totalExpenses) / user.totalIncome) * 100;
    insights.push({
      type: 'success',
      message: `Great job! You're saving ${savingsRate.toFixed(1)}% of your income. Consider increasing this to 20% if possible.`,
      priority: 'low'
    });
  }
  
  return insights;
}

module.exports = router;