import React, { useState, useEffect } from 'react';
import { updateMember } from '../api';
import { X, CreditCard, User, Building2 } from 'lucide-react';

interface Props {
    groupId: string;
    member: any;
    onClose: () => void;
    onSuccess: () => void;
    onLogout: () => void;
}

export default function ProfileEditorModal({ groupId, member, onClose, onSuccess, onLogout }: Props) {
    const [name, setName] = useState(member.name);
    const [bankCode, setBankCode] = useState(member.bank_code || '');
    const [bankAccount, setBankAccount] = useState(member.bank_account || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateMember(groupId, member.id, name, bankCode, bankAccount);
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            alert('更新失敗，請稍後再試');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 animate-scale-up shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                        <CreditCard className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">我的收款資訊</h2>
                    <p className="text-gray-500 text-sm mt-1">設定帳號讓朋友轉帳給你</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">顯示名稱</label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all font-bold text-gray-900"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">銀行代碼</label>
                            <input
                                type="text"
                                value={bankCode}
                                onChange={e => setBankCode(e.target.value)}
                                placeholder="822"
                                maxLength={5}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all font-medium text-center"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">銀行帳號</label>
                            <div className="relative">
                                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={bankAccount}
                                    onChange={e => setBankAccount(e.target.value)}
                                    placeholder="123456789012"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all font-medium tracking-wide"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 space-y-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-600/20 active:translate-y-0.5 transition-all disabled:opacity-50"
                        >
                            {loading ? '儲存中...' : '儲存設定'}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                if (confirm('確定要切換身份嗎？這不會刪除此成員，只會清除您瀏覽器的記憶。')) {
                                    onLogout();
                                }
                            }}
                            className="w-full text-gray-400 hover:text-gray-600 font-medium py-2 text-sm transition-colors"
                        >
                            不是 {member.name}？切換身份
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
