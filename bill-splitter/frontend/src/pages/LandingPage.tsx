import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGroup } from '../api';
import { Users, ArrowRight } from 'lucide-react';

export default function LandingPage() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        setLoading(true);
        try {
            const res = await createGroup(name);
            navigate(`/group/${res.data.id}`);
        } catch (err) {
            console.error(err);
            alert('Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 p-4">
            <div className="w-full max-w-md animate-slide-up">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-brand-100/50 p-8 text-center border border-white/50">
                    <div className="mx-auto bg-gradient-to-tr from-brand-500 to-brand-400 w-20 h-20 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-brand-500/30 transform rotate-3 hover:rotate-6 transition-transform duration-300">
                        <Users className="w-10 h-10 text-white" />
                    </div>

                    <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">分帳小幫手</h1>
                    <p className="text-gray-500 mb-10 text-lg leading-relaxed">
                        最簡單的朋友分帳工具<br />
                        <span className="text-brand-600 font-medium">無需登入，即開即用</span>
                    </p>

                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="輸入群組名稱 (例如：日本旅遊)"
                                className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all font-medium placeholder:text-gray-400 text-gray-900"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {loading ? '建立中...' : '建立群組'}
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-400 text-sm mt-8">
                    簡單 • 快速 • 免費
                </p>
            </div>
        </div>
    );
}
