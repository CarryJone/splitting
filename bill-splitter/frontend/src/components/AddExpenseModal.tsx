import React, { useState, useEffect } from 'react';
import { addExpense, updateExpense } from '../api';
import { X, Check } from 'lucide-react';

interface Props {
    groupId: string;
    members: any[];
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any; // For editing
}

export default function AddExpenseModal({ groupId, members, onClose, onSuccess, initialData }: Props) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [payerId, setPayerId] = useState<string>('');
    const [operatorName, setOperatorName] = useState('');
    const [splitMembers, setSplitMembers] = useState<Set<number>>(new Set(members.map(m => m.id)));
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setDescription(initialData.description);
            setAmount(initialData.amount.toString());
            setPayerId(initialData.payer_member_id.toString());
            setOperatorName(initialData.created_by_name || '');
            if (initialData.splits) {
                setSplitMembers(new Set(initialData.splits.map((s: any) => s.member_id)));
            }
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payerId || !amount || splitMembers.size === 0) return;

        setLoading(true);
        try {
            const totalAmount = parseInt(amount);
            const splitCount = splitMembers.size;
            const baseShare = Math.floor(totalAmount / splitCount);
            const remainder = totalAmount % splitCount;

            const splits = Array.from(splitMembers).map((memberId, index) => ({
                member_id: memberId,
                owed_amount: baseShare + (index < remainder ? 1 : 0)
            }));

            const payload = {
                payer_member_id: parseInt(payerId),
                amount: totalAmount,
                description,
                created_by_name: operatorName || 'Guest',
                splits
            };

            if (initialData) {
                await updateExpense(groupId, initialData.id, payload);
            } else {
                await addExpense(groupId, payload);
            }
            onSuccess();
        } catch (err) {
            console.error(err);
            alert(initialData ? '更新費用失敗' : '新增費用失敗');
        } finally {
            setLoading(false);
        }
    };

    const toggleSplitMember = (id: number) => {
        const newSet = new Set(splitMembers);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSplitMembers(newSet);
    };

    const toggleSelectAll = () => {
        if (splitMembers.size === members.length) {
            setSplitMembers(new Set());
        } else {
            setSplitMembers(new Set(members.map(m => m.id)));
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 transition-all duration-300">
            <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 pb-2 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{initialData ? '編輯費用' : '新增費用'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">項目說明</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="例如：晚餐、計程車費"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">金額 (TWD)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    className="w-full pl-8 pr-4 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all font-bold text-xl text-gray-900 placeholder:text-gray-300"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">誰付錢？</label>
                            <div className="relative">
                                <select
                                    required
                                    className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all font-medium text-gray-900 appearance-none cursor-pointer"
                                    value={payerId}
                                    onChange={e => setPayerId(e.target.value)}
                                >
                                    <option value="" disabled>選擇成員</option>
                                    {members.map(m => (
                                        <option key={m.id} value={m.id}>{m.name || 'Unknown'}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3 px-1">
                                <label className="block text-sm font-bold text-gray-700">分給誰？</label>
                                <button
                                    type="button"
                                    onClick={toggleSelectAll}
                                    className="text-xs text-brand-600 hover:text-brand-800 font-bold bg-brand-50 px-3 py-1 rounded-full transition-colors"
                                >
                                    {splitMembers.size === members.length ? '取消全選' : '全選'}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {members.map(m => {
                                    const isSelected = splitMembers.has(m.id);
                                    return (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => toggleSplitMember(m.id)}
                                            className={`relative flex items-center justify-center px-3 py-3 rounded-xl border-2 transition-all duration-200 ${isSelected
                                                ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm'
                                                : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200'
                                                }`}
                                        >
                                            <span className="font-bold text-sm truncate w-full text-center">{m.name || 'Unknown'}</span>
                                            {isSelected && (
                                                <div className="absolute -top-1.5 -right-1.5 bg-brand-500 text-white rounded-full p-0.5 shadow-sm">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            {splitMembers.size === 0 && <p className="text-red-500 text-xs mt-2 font-medium ml-1 animate-pulse">請至少選擇一人</p>}
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <label className="block text-xs font-bold text-gray-400 mb-2 ml-1 uppercase tracking-wider">您的暱稱 (選填)</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-brand-300 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm"
                                value={operatorName}
                                onChange={e => setOperatorName(e.target.value)}
                                placeholder="是誰在記帳？"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        onClick={() => {
                            if (!payerId || !amount || splitMembers.size === 0) {
                                alert('請填寫完整資訊：金額、付款人、分攤對象');
                            }
                        }}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-2xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-brand-600/20 hover:shadow-brand-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all text-lg"
                    >
                        {loading ? '儲存中...' : (initialData ? '更新費用' : '儲存費用')}
                    </button>
                </form>
            </div>
        </div>
    );
}
