import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Users, 
  BarChart3,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { getExpenses } from '../api/expenses';
import { Expense as BaseExpense } from '../types';
import { useAuth } from '../context/AuthContext';
import { getMyCommittees } from '../api/committees';
import { Committee } from '../types';

// Extend Expense type to include _id for MongoDB
// (if needed for future use, but not required for dashboard display)
type Expense = BaseExpense & { _id?: string };

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.name || 'User';
  const firstLetter = userName.charAt(0).toUpperCase();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [myCommittees, setMyCommittees] = useState<Committee[]>([]);
  const [committeesLoading, setCommitteesLoading] = useState(true);
  const [committeesError, setCommitteesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const res = await getExpenses();
        let data: Expense[] = [];
        if (Array.isArray(res.data)) {
          data = res.data;
        } else if (Array.isArray(res.data.expenses)) {
          data = res.data.expenses;
        }
        setExpenses(data);
        const income = data.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
        const expense = data.filter(e => e.type !== 'income').reduce((sum, e) => sum + e.amount, 0);
        setTotalIncome(income);
        setTotalExpenses(expense);
        setRemainingBalance(income - expense);
      } catch {
        setExpenses([]);
        setTotalIncome(0);
        setTotalExpenses(0);
        setRemainingBalance(0);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  useEffect(() => {
    const fetchMyCommittees = async () => {
      setCommitteesLoading(true);
      try {
        const res = await getMyCommittees();
        setMyCommittees(res.data.committees || []);
        setCommitteesError(null);
      } catch (err: any) {
        setMyCommittees([]);
        setCommitteesError(err?.response?.data?.message || 'Failed to fetch committees');
      } finally {
        setCommitteesLoading(false);
      }
    };
    fetchMyCommittees();
  }, []);

  const stats = [
    {
      title: 'Remaining Balance',
      value: `PKR ${remainingBalance.toFixed(2)}`,
      icon: Wallet,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300'
    },
    {
      title: 'Total Income',
      value: `PKR ${totalIncome.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300'
    },
    {
      title: 'Total Expenses',
      value: `PKR ${totalExpenses.toFixed(2)}`,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300'
    }
  ];

  const quickActions = [
    {
      title: 'Add Expense',
      description: 'Track your spending',
      icon: Plus,
      color: 'bg-red-500',
      onClick: () => navigate('/expenses')
    },
    {
      title: 'Create Committee',
      description: 'Start a savings group',
      icon: Users,
      color: 'bg-blue-500',
      onClick: () => navigate('/committee/create')
    },
    {
      title: 'Join Committee',
      description: 'Join existing group',
      icon: Users,
      color: 'bg-purple-500',
      onClick: () => navigate('/committee/join')
    }
  ];


  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 shadow-lg animate-gradient-x">
        {/* Animated floating shapes */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute w-32 h-32 bg-[#D9D9D9] bg-opacity-10 rounded-full blur-2xl animate-float-slow left-[-40px] top-[-40px]" />
          <div className="absolute w-24 h-24 bg-white bg-opacity-10 rounded-full blur-2xl animate-float-medium right-[-30px] bottom-[-30px]" />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-3xl font-bold shadow-lg border-2 border-white border-opacity-30">
            {firstLetter}
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
              Welcome back, {userName}! <span className="animate-wave origin-bottom-left">👋</span>
            </h1>
            <p className="opacity-90">Here's what's happening with your finances today.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className={`flex items-center gap-4 ${stat.bgColor} ${stat.borderColor} border-2 shadow-none hover:shadow-lg transition-shadow duration-200 p-4 md:p-6`}>
            <div className={`w-14 h-14 ${stat.color} ${stat.bgColor} rounded-xl flex items-center justify-center shadow-md`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1 tracking-wide uppercase">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Quick Actions</h2>
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 justify-between items-stretch">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="group flex-1 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-white via-gray-50 to-blue-50 border border-gray-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:border-blue-400 transition-all duration-200 text-center min-h-[170px] h-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ flexBasis: '0', minWidth: '180px', maxWidth: '100%' }}
            >
              <div className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110 ${
                action.title === 'Add Expense' ? 'bg-gradient-to-tr from-red-500 to-pink-500' :
                action.title === 'Create Committee' ? 'bg-gradient-to-tr from-blue-500 to-indigo-500' :
                'bg-gradient-to-tr from-purple-500 to-emerald-500'
              }`}>
                <action.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-base md:text-lg mb-1 group-hover:text-blue-700 transition-colors duration-200">{action.title}</h3>
              <p className="text-xs md:text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-200">{action.description}</p>
            </button>
          ))}
        </div>
      </Card>

      <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-6 lg:space-y-0">
        <div className="lg:col-span-2">
          <Card className="p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" /> Active Committees
            </h3>
            {committeesLoading ? (
              <div className="text-gray-600 py-8 text-center">Loading active committees...</div>
            ) : committeesError ? (
              <div className="text-red-600 py-8 text-center">{committeesError}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {myCommittees.filter(c => c.status === 'active').length === 0 ? (
                  <div className="text-gray-600 py-8 text-center col-span-full">No active committees found.</div>
                ) : (
                  myCommittees.filter(c => c.status === 'active').map((committee) => (
                    <div key={committee._id} className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 hover:shadow-lg transition-shadow cursor-pointer flex flex-col gap-2" onClick={() => navigate(`/committee/${committee._id}`)}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-blue-900 text-base truncate">{committee.name}</p>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium capitalize">{committee.status}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span>{committee.occupiedSlots}/{committee.totalSlots} slots</span>
                        <DollarSign className="w-4 h-4 text-green-400 ml-2" />
                        <span>${committee.contributionAmount}/month</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Position {committee.slots.find(slot => slot.user && slot.user._id === user?._id)?.position ? `#${committee.slots.find(slot => slot.user && slot.user._id === user?._id)?.position}` : '-'}</span>
                        <span className="ml-auto">Start: {new Date(committee.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            <Button
              variant="outline"
              fullWidth
              className="mt-4"
              onClick={() => navigate('/committee')}
            >
              Manage Committees
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}