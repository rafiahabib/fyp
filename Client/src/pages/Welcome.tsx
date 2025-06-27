import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, Wallet, ArrowRight } from 'lucide-react';
import Button from '../components/UI/Button';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Wallet className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 sm:text-5xl">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Expenza</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Your all-in-one solution for expense tracking and digital committee management. 
            Take control of your finances and achieve your savings goals.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="group cursor-pointer" onClick={() => navigate('/login')}>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl mb-6 mx-auto">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
                  Expense Tracking
                </h2>
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                  Monitor your spending, categorize expenses, and visualize your financial patterns with interactive charts and insights.
                </p>
                <div className="flex items-center justify-center text-green-600 font-semibold group-hover:text-green-700">
                  Start Tracking <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            <div className="group cursor-pointer" onClick={() => navigate('/login')}>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mb-6 mx-auto">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
                  Digital Committee
                </h2>
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                  Join or create savings committees with friends and family. Manage contributions and track collective financial goals.
                </p>
                <div className="flex items-center justify-center text-blue-600 font-semibold group-hover:text-blue-700">
                  Join Committee <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Why Choose Expenza?
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Smart Analytics</h4>
              <p className="text-gray-600 text-sm">
                Get insights into your spending patterns with AI-powered analytics and recommendations.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Secure Committees</h4>
              <p className="text-gray-600 text-sm">
                Create and manage digital committees with secure verification and transparent tracking.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Goal Achievement</h4>
              <p className="text-gray-600 text-sm">
                Set financial goals and track your progress with visual dashboards and reminders.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <Button
            onClick={() => navigate('/login')}
            size="lg"
            className="px-8 py-4 text-lg  bg-gradient-to-r from-blue-600 to-purple-600"
          >
            Get Started Today
          </Button>
        </div>
      </div>
    </div>
  );
}