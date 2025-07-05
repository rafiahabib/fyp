import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Tag, TrendingUp, TrendingDown, Edit, Trash } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import { getExpenses, addExpense, addIncome, deleteExpense, updateExpense } from '../api/expenses';
import { Expense as BaseExpense } from '../types';

// Extend Expense type to include _id for MongoDB
type Expense = BaseExpense & { _id?: string };

export default function ExpenseTracking() {
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [incomeForm, setIncomeForm] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await getExpenses();
      if (Array.isArray(res.data)) {
        setExpenses(res.data);
      } else if (Array.isArray(res.data.expenses)) {
        setExpenses(res.data.expenses);
      } else {
        setExpenses([]);
      }
    } catch (err) {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const thisMonthExpenses = expenses.filter(e => e.type !== 'income' && new Date(e.date).getMonth() === thisMonth && new Date(e.date).getFullYear() === thisYear);
  const thisMonthIncomes = expenses.filter(e => e.type === 'income' && new Date(e.date).getMonth() === thisMonth && new Date(e.date).getFullYear() === thisYear);
  const totalIncome = thisMonthIncomes.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netSavings = totalIncome - totalExpenses;

  const uniqueCategories = [...new Set(thisMonthExpenses.map(e => e.category))];
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#A3A1FB', '#A29BFE', '#FFD166', '#06D6A0', '#118AB2'];
  const pieData = uniqueCategories.map((cat, index) => ({
    name: cat,
    value: thisMonthExpenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0),
    color: colors[index % colors.length]
  })).filter(d => d.value > 0);

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return { month: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear() };
  });
  const lineData = months.map(({ month, year }) => {
    const monthIdx = new Date(`${month} 1, ${year}`).getMonth();
    return {
      month,
      expenses: expenses.filter(e => e.type !== 'income' && new Date(e.date).getMonth() === monthIdx && new Date(e.date).getFullYear() === year).reduce((sum, e) => sum + e.amount, 0),
      income: expenses.filter(e => e.type === 'income' && new Date(e.date).getMonth() === monthIdx && new Date(e.date).getFullYear() === year).reduce((sum, e) => sum + e.amount, 0)
    };
  });

  const handleExpenseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editingExpense && editingExpense._id) {
        await updateExpense(editingExpense._id, { ...expenseForm, amount: Number(expenseForm.amount), type: 'expense' });
      } else {
        await addExpense({ ...expenseForm, amount: Number(expenseForm.amount), type: 'expense' });
      }
      await fetchExpenses();
      setExpenseForm({ title: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] });
      setExpenseModalOpen(false);
      setEditingExpense(null);
    } catch (err) {}
  };

  const handleIncomeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await addIncome({ ...incomeForm, amount: Number(incomeForm.amount), type: 'income' });
      await fetchExpenses();
      setIncomeForm({ title: '', amount: '', date: new Date().toISOString().split('T')[0] });
      setIncomeModalOpen(false);
    } catch (err) {}
  };

  const handleEdit = (expense: Expense) => {
    setExpenseForm({ title: expense.title, amount: String(expense.amount), category: expense.category, date: expense.date });
    setEditingExpense(expense);
    setExpenseModalOpen(true);
  };

  const handleDelete = async (idOrExpense: string | Expense) => {
    try {
      const id = typeof idOrExpense === 'string' ? idOrExpense : idOrExpense._id;
      if (id) {
        await deleteExpense(id);
        await fetchExpenses();
      }
    } catch (err) {}
  };

  return (
    <div className=" bg-[#042E3A]">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        <>
          {/* Header with Add Buttons */}
          <div className="space-y-6">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Expense Tracking</h1>
            <div className="flex space-x-2">
              <Button
                variant="primary"
                size="sm"
                icon={TrendingDown}
                onClick={() => {
                  setExpenseModalOpen(true);
                  setEditingExpense(null);
                  setExpenseForm({
                    title: '',
                    amount: '',
                    category: '',
                    date: new Date().toISOString().split('T')[0],
                  });
                }}
              >
                Add Expense
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={TrendingUp}
                onClick={() => setIncomeModalOpen(true)}
              >
                Add Income
              </Button>
            </div>
          </div>
  
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">This Month Income</p>
                  <p className="text-2xl font-bold text-green-700">PKR {totalIncome.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </Card>
  
            <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 mb-1">This Month Expenses</p>
                  <p className="text-2xl font-bold text-red-700">PKR {totalExpenses.toFixed(2)}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </Card>
  
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Net Savings</p>
                  <p className="text-2xl font-bold text-blue-700">PKR {netSavings.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </Card>
          </div>
  
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Expense Categories</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `PKR ${value}`} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
  
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Income vs Expenses</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `PKR ${value}`} />
                  <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} />
                  <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
  
          {/* All Expenses Table */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">All Expenses</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Description</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Category</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Amount</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses
                    .filter((e) => e.type !== 'income')
                    .map((expense) => (
                      <tr
                        key={expense.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-2 font-medium text-gray-900">{expense.title}</td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {expense.category}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-600">{new Date(expense.date).toLocaleDateString('en-GB')}</td>
                        <td className="py-3 px-2  font-semibold text-red-600">
                          PKR {expense.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-center flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="text-blue-500 hover:text-blue-700"
                            aria-label="Edit expense"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense)}
                            className="text-red-500 hover:text-red-700"
                            aria-label="Delete expense"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
          </div>
  
          {/* Add/Edit Expense Modal */}
          {expenseModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                <button
                  onClick={() => {
                    setExpenseModalOpen(false);
                    setEditingExpense(null);
                  }}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  aria-label="Close expense modal"
                >
                  &times;
                </button>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                </h2>
                <form onSubmit={handleExpenseSubmit} className="space-y-4">
                  <Input
                    label="Expense Title"
                    placeholder="e.g., Grocery Shopping"
                    value={expenseForm.title}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, title: e.target.value })
                    }
                    required
                  />
  
                  <Input
                    label="Amount"
                    type="number"
                    placeholder="0.00"
                    value={expenseForm.amount}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, amount: e.target.value })
                    }
                    icon={DollarSign}
                    required
                  />
  
                  <Input
                    label="Category"
                    placeholder="e.g., Food, Bills, Shopping"
                    value={expenseForm.category}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, category: e.target.value })
                    }
                    icon={Tag}
                    required
                  />
  
                  <Input
                    label="Date"
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, date: e.target.value })
                    }
                    icon={Calendar}
                    required
                  />
  
                  <div className="flex space-x-3 pt-4">
                    <Button type="submit" fullWidth>
                      {editingExpense ? 'Update Expense' : 'Add Expense'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      fullWidth
                      onClick={() => {
                        setExpenseModalOpen(false);
                        setEditingExpense(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
  
          {/* Add Income Modal */}
          {incomeModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                <button
                  onClick={() => setIncomeModalOpen(false)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  aria-label="Close income modal"
                >
                  &times;
                </button>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Income</h2>
                <form onSubmit={handleIncomeSubmit} className="space-y-4">
                  <Input
                    label="Income Source"
                    placeholder="e.g., Salary, Freelance"
                    value={incomeForm.title}
                    onChange={(e) =>
                      setIncomeForm({ ...incomeForm, title: e.target.value })
                    }
                    required
                  />
  
                  <Input
                    label="Amount"
                    type="number"
                    placeholder="0.00"
                    value={incomeForm.amount}
                    onChange={(e) =>
                      setIncomeForm({ ...incomeForm, amount: e.target.value })
                    }
                    icon={DollarSign}
                    required
                  />
  
                  <Input
                    label="Date"
                    type="date"
                    value={incomeForm.date}
                    onChange={(e) =>
                      setIncomeForm({ ...incomeForm, date: e.target.value })
                    }
                    icon={Calendar}
                    required
                  />
  
                  <div className="flex space-x-3 pt-4">
                    <Button type="submit" fullWidth variant="success">
                      Add Income
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      fullWidth
                      onClick={() => setIncomeModalOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}