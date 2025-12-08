import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, Calendar, User, Search } from 'lucide-react';
import { getMemberColor, getMemberInitials } from '../utils/colors';

interface Props {
    expenses: any[];
    members: any[];
    onEdit: (expense: any) => void;
    onDelete: (id: number) => void;
}

export default function ExpenseList({ expenses, members, onEdit, onDelete }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    const getMemberName = (id: number) => members.find(m => m.id === id)?.name || 'Unknown';

    const filteredExpenses = useMemo(() => {
        if (!searchTerm.trim()) return expenses;
        const lowerTerm = searchTerm.toLowerCase();
        return expenses.filter(expense => {
            const payerName = getMemberName(expense.payer_member_id).toLowerCase();
            const splitNames = expense.splits?.map((s: any) => getMemberName(s.member_id).toLowerCase()).join(' ');

            // Only search people (Payer or Split members)
            return payerName.includes(lowerTerm) ||
                (splitNames && splitNames.includes(lowerTerm));
        });
    }, [expenses, searchTerm, members]);

    const totalAmount = useMemo(() => {
        return filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    }, [filteredExpenses]);

    if (expenses.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">尚無費用記錄</p>
                <p className="text-sm text-gray-400 mt-1">點擊右下角 + 按鈕新增第一筆費用</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="搜尋成員姓名..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm"
                />
            </div>

            {/* Expense List */}
            <div className="space-y-4">
                {filteredExpenses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        找不到符合的搜尋結果
                    </div>
                ) : (
                    filteredExpenses.map((expense) => {
                        const payerName = getMemberName(expense.payer_member_id);
                        const splitNames = expense.splits
                            ?.map((s: any) => getMemberName(s.member_id))
                            .join(', ');

                        return (
                            <div key={expense.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0 border ${getMemberColor(expense.payer_member_id)}`}>
                                        {getMemberInitials(payerName)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg truncate pr-2">{expense.description}</h3>
                                                <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                                                    <span className="font-medium text-gray-700">{payerName}</span> 支付
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="font-bold text-gray-900 text-xl tracking-tight">
                                                    ${expense.amount.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1 font-medium">
                                                    {new Date(expense.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        {expense.splits && expense.splits.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-gray-50 flex items-start gap-2">
                                                <div className="bg-gray-100 rounded-md px-1.5 py-0.5 mt-0.5 shrink-0">
                                                    <User className="w-3 h-3 text-gray-500" />
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 items-center">
                                                    <span className="text-xs text-gray-400 mr-1">分攤人員:</span>
                                                    {expense.splits.map((split: any) => {
                                                        const memberName = getMemberName(split.member_id);
                                                        return (
                                                            <span
                                                                key={split.member_id}
                                                                className={`text-xs px-2 py-0.5 rounded-md font-bold border ${getMemberColor(split.member_id)} bg-opacity-50 border-opacity-20`}
                                                            >
                                                                {memberName}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEdit(expense); }}
                                        className="p-2 bg-white text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl shadow-sm border border-gray-100 transition-colors"
                                        title="編輯"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(expense.id); }}
                                        className="p-2 bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl shadow-sm border border-gray-100 transition-colors"
                                        title="刪除"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Total Summary Footer */}
            {filteredExpenses.length > 0 && (
                <div className="sticky bottom-4 bg-gray-900 text-white p-4 rounded-2xl shadow-xl flex justify-between items-center animate-slide-up z-10">
                    <div className="text-sm text-gray-300 font-medium">
                        共 {filteredExpenses.length} 筆費用
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm text-gray-400">總計</span>
                        <span className="text-2xl font-bold tracking-tight">
                            ${totalAmount.toLocaleString()}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
