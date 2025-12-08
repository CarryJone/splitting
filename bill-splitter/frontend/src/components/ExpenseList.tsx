import React from 'react';
import { Pencil, Trash2, Calendar, User } from 'lucide-react';

interface Props {
    expenses: any[];
    members: any[];
    onEdit: (expense: any) => void;
    onDelete: (id: number) => void;
}

export default function ExpenseList({ expenses, members, onEdit, onDelete }: Props) {
    const getMemberName = (id: number) => members.find(m => m.id === id)?.name || 'Unknown';
    const getInitials = (name: string) => name.slice(0, 1).toUpperCase();
    const getColor = (name: string) => {
        const colors = ['bg-red-100 text-red-600', 'bg-orange-100 text-orange-600', 'bg-amber-100 text-amber-600', 'bg-green-100 text-green-600', 'bg-emerald-100 text-emerald-600', 'bg-teal-100 text-teal-600', 'bg-cyan-100 text-cyan-600', 'bg-sky-100 text-sky-600', 'bg-blue-100 text-blue-600', 'bg-indigo-100 text-indigo-600', 'bg-violet-100 text-violet-600', 'bg-purple-100 text-purple-600', 'bg-fuchsia-100 text-fuchsia-600', 'bg-pink-100 text-pink-600', 'bg-rose-100 text-rose-600'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

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
            {expenses.map((expense) => {
                const payerName = getMemberName(expense.payer_member_id);
                const splitNames = expense.splits
                    ?.map((s: any) => getMemberName(s.member_id))
                    .join(', ');

                return (
                    <div key={expense.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0 ${getColor(payerName)}`}>
                                {getInitials(payerName)}
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

                                {splitNames && (
                                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-start gap-2">
                                        <div className="bg-gray-100 rounded-md px-1.5 py-0.5 mt-0.5">
                                            <User className="w-3 h-3 text-gray-500" />
                                        </div>
                                        <div className="text-xs text-gray-500 leading-relaxed">
                                            <span className="text-gray-400 mr-1">分給:</span>
                                            {splitNames}
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
            })}
        </div>
    );
}
