import React, { useState } from 'react';
import { User, Plus, Check } from 'lucide-react';

interface Props {
    members: any[];
    onSelect: (memberId: number) => void;
    onCreate: (name: string) => void;
}

export default function IdentityModal({ members, onSelect, onCreate }: Props) {
    const [isCreating, setIsCreating] = useState(members.length === 0);
    const [newName, setNewName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setLoading(true);
        onCreate(newName);
        // Note: onCreate responsibility to close modal or update state
        setLoading(false);
        setNewName('');
    };

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-8 animate-scale-up shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isCreating ? '歡迎加入！請問怎麼稱呼？' : '請問您是哪一位？'}
                    </h2>
                    <p className="text-gray-500 mt-2 text-sm">
                        {isCreating ? '建立您的第一個分帳身份' : '選擇您的身份以檢視相關資訊'}
                    </p>
                </div>

                {!isCreating && (
                    <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-1 custom-scrollbar">
                        {members.map(m => (
                            <button
                                key={m.id}
                                onClick={() => onSelect(m.id)}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-brand-500 hover:shadow-md transition-all group"
                            >
                                <span className="font-bold text-gray-700 group-hover:text-brand-600 font-lg">{m.name || 'Unknown'}</span>
                                <span className="text-gray-300 group-hover:text-brand-500">
                                    <Check className="w-5 h-5" />
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {isCreating ? (
                    <form onSubmit={handleCreate}>
                        <input
                            type="text"
                            autoFocus
                            className="w-full px-5 py-4 text-center text-lg font-bold rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all mb-4"
                            placeholder="輸入您的暱稱"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                        <div className="flex gap-3">
                            {members.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    返回選擇
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={!newName.trim() || loading}
                                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-600/20 transition-all disabled:opacity-50"
                            >
                                {loading ? '建立中...' : '確認加入'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="pt-4 border-t border-gray-100 text-center">
                        <button
                            onClick={() => setIsCreating(true)}
                            className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-800 font-bold px-4 py-2 rounded-lg hover:bg-brand-50 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            我是新成員
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
