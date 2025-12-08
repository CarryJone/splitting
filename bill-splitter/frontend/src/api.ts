/// <reference types="vite/client" />
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

export const createGroup = (name: string) => api.post('/groups', { name });
export const getGroup = (id: string) => api.get(`/groups/${id}`);
export const addMember = (groupId: string, name: string) => api.post(`/groups/${groupId}/members`, { name });
export const updateMember = (groupId: string, memberId: number, name: string) => api.put(`/groups/${groupId}/members/${memberId}`, { name });
export const deleteMember = (groupId: string, memberId: number) => api.delete(`/groups/${groupId}/members/${memberId}`);
export const addExpense = (groupId: string, data: any) => api.post(`/groups/${groupId}/expenses`, data);
export const updateExpense = (groupId: string, expenseId: number, data: any) => api.put(`/groups/${groupId}/expenses/${expenseId}`, data);
export const deleteExpense = (groupId: string, expenseId: number) => api.delete(`/groups/${groupId}/expenses/${expenseId}`);

export const getSettlement = (groupId: string) => api.get(`/groups/${groupId}/settlement`);

export default api;
