import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGroup, getGroups } from '../api';
import { Users, ArrowRight, Clock, ChevronRight } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

export default function LandingPage() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState<any[]>([]);
    const [fetchingGroups, setFetchingGroups] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            setError(null);
            const res = await getGroups();
            if (Array.isArray(res.data)) {
                setGroups(res.data);
            } else {
                console.error('Unexpected API response format:', res.data);
                setGroups([]);
                // If it's not an array, it might be an error object that Axios didn't throw for some reason,
                // or the proxy returning HTML.
            }
        } catch (err) {
            console.error('Failed to fetch groups', err);
            setError('無法載入群組列表，請稍後再試');
        } finally {
            setFetchingGroups(false);
        }
    };

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

    if (fetchingGroups) {
        return <LoadingScreen message="載入群組列表..." />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center max-w-sm w-full">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">發生錯誤</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition-colors"
                    >
                        重新整理
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 p-4">
            <div className="w-full max-w-md animate-slide-up mt-10 mb-8">
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
            </div>

            {/* Recent Groups List */}
            {groups.length > 0 && (
                <div className="w-full max-w-md animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-4">最近的群組</h2>
                    <div className="space-y-3">
                        {groups.map((group) => (
                            <div
                                key={group.id}
                                onClick={() => navigate(`/group/${group.id}`)}
                                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-brand-200 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Avatar Placeholder */}
                                    <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xl mb-3 group-hover:scale-110 transition-transform">
                                        {(group.name || '?').slice(0, 1)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{group.name || 'Unnamed Group'}</h3>
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                            <Clock className="w-3 h-3" />
                                            {new Date(group.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-500 transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <p className="text-center text-gray-400 text-sm mt-8 mb-8">
                簡單 • 快速 • 免費
            </p>
        </div>
    );
}
