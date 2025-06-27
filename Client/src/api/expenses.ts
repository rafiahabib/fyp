// api/expense.ts
import api from './axios';

export const getExpenses = () => api.get(`/api/expenses`);

export const addExpense = (expenseData: any) => api.post(`/api/expenses`, expenseData);

export const addIncome = (incomeData: any) => api.post(`/api/expenses`, { ...incomeData, type: 'income' });

export const deleteExpense = (id: string) => api.delete(`/api/expenses/${id}`);

export const updateExpense = (id: string, expenseData: any) => api.put(`/api/expenses/${id}`, expenseData);


