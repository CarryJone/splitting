import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGroup, getSettlement, deleteExpense, addMember } from '../api';
import { Users, Receipt, Calculator, Plus, Wallet, Settings } from 'lucide-react';
import clsx from 'clsx';

import MemberList from '../components/MemberList';
import ExpenseList from '../components/ExpenseList';
import SettlementPlan from '../components/SettlementPlan';
import AddExpenseModal from '../components/AddExpenseModal';
import LoadingScreen from '../components/LoadingScreen';
import IdentityModal from '../components/IdentityModal';
import ProfileEditorModal from '../components/ProfileEditorModal';

export default function GroupDashboard() {
    const { id } = useParams<{ id: string }>();
    const [group, setGroup] = useState<any>(null);
    const [settlement, setSettlement] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'expenses' | 'settlement'>('expenses');

    // Modals
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [editingExpense, setEditingExpense] = useState<any>(null);
    const [showIdentityModal, setShowIdentityModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // User Identity
    const [currentMemberId, setCurrentMemberId] = useState<number | null>(null);

    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const [groupRes, settlementRes] = await Promise.all([
                getGroup(id),
                getSettlement(id)
            ]);
            setGroup(groupRes.data);
            setSettlement(settlementRes.data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || err.message || '無法連線至伺服器');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    // Check Identity on Load
    useEffect(() => {
        if (group && id) {
            const storedId = localStorage.getItem(`bill-user-${id}`);
            if (storedId) {
                const memberId = parseInt(storedId);
                const exists = group.members.find((m: any) => m.id === memberId);
                if (exists) {
                    setCurrentMemberId(memberId);
                } else {
                    localStorage.removeItem(`bill-user-${id}`);
                    setShowIdentityModal(true);
                }
            } else {
                setShowIdentityModal(true);
            }
        }
    }, [group, id]);

    const handleIdentitySelect = (memberId: number) => {
        if (!id) return;
        localStorage.setItem(`bill-user-${id}`, memberId.toString());
        setCurrentMemberId(memberId);
        setShowIdentityModal(false);
    };

    const handleIdentityCreate = async (name: string) => {
        if (!id) return;
        try {
            const res = await addMember(id, name);
            const newMember = res.data;
            await fetchData(); // Refresh list
            handleIdentitySelect(newMember.id);
        } catch (err) {
            alert('建立成員失敗');
        }
    };

    const handleEditExpense = (expense: any) => {
        setEditingExpense(expense);
        setShowAddExpense(true);
    };

    const handleDeleteExpense = async (expenseId: number) => {
        if (!confirm('確定要刪除這筆費用嗎？')) return;
        if (!id) return;

        try {
            await deleteExpense(id, expenseId);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('刪除失敗');
        }
    };

    const currentUser = group?.members?.find((m: any) => m.id === currentMemberId);

    if (loading && !group) return <LoadingScreen />;

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center max-w-sm w-full">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">發生錯誤</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button onClick={() => window.location.reload()} className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl">重新整理</button>
                </div>
            </div>
        );
    }

    if (!group) return <div className="min-h-screen flex items-center justify-center">找不到群組</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans">
            {/* Header */}
            <header className="bg-white sticky top-0 z-20 border-b border-gray-200/50">
                <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 truncate tracking-tight">{group.name || 'Group'}</h1>
                        <div className="text-xs text-gray-500 font-medium tracking-wide">ID: {group.id.slice(0, 8)}...</div>
                    </div>
                    {/* User Profile Trigger */}
                    {currentUser ? (
                        <button
                            onClick={() => setShowProfileModal(true)}
                            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 pr-3 pl-2 py-1.5 rounded-full transition-colors"
                        >
                            <div className="w-6 h-6 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {currentUser.name?.slice(0, 1) || '?'}
                            </div>
                            <span className="text-xs font-bold text-gray-700 max-w-[80px] truncate">{currentUser.name || 'Unknown'}</span>
                        </button>
                    ) : (
                        <div className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-semibold">
                            {group.members.length} 成員
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-fade-in">

                {/* Wallet / Context Section */}
                {currentUser && (
                    <div
                        onClick={() => setShowProfileModal(true)}
                        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-5 text-white shadow-xl shadow-gray-900/10 cursor-pointer relative overflow-hidden group"
                    >
                        {/* Decorative Circles */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>

                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">我的收款帳戶</h3>
                                {currentUser.bank_code ? (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold tracking-tight">{currentUser.bank_account}</span>
                                        <span className="text-sm bg-white/20 px-2 py-0.5 rounded text-white/90">({currentUser.bank_code})</span>
                                    </div>
                                ) : (
                                    <div className="text-white/50 text-sm font-medium flex items-center gap-2">
                                        <Wallet className="w-4 h-4" />
                                        尚未設定
                                    </div>
                                )}
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <Settings className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Dashboard */}
                <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        成員列表
                    </h2>
                    <MemberList groupId={group.id} members={group.members} onUpdate={fetchData} />
                </section>

                {/* Tabs & Content */}
                <div className="space-y-4">
                    <div className="bg-gray-100/80 p-1.5 rounded-2xl flex relative">
                        <button onClick={() => setActiveTab('expenses')} className={clsx("flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 relative z-10", activeTab === 'expenses' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
                            <Receipt className="w-4 h-4" /> 費用列表
                        </button>
                        <button onClick={() => setActiveTab('settlement')} className={clsx("flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 relative z-10", activeTab === 'settlement' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
                            <Calculator className="w-4 h-4" /> 結算方案
                        </button>
                    </div>

                    <div className="min-h-[300px]">
                        {activeTab === 'expenses' ? (
                            <ExpenseList expenses={group.expenses} members={group.members} onEdit={handleEditExpense} onDelete={handleDeleteExpense} />
                        ) : (
                            <SettlementPlan data={settlement} />
                        )}
                    </div>
                </div>
            </main>

            {/* FAB */}
            <button
                onClick={() => { setEditingExpense(null); setShowAddExpense(true); }}
                className="fixed bottom-8 right-6 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl p-4 shadow-xl shadow-brand-600/30 transition-all hover:scale-105 active:scale-95 z-30"
            >
                <Plus className="w-7 h-7" />
            </button>

            {/* Modals */}
            {showAddExpense && (
                <AddExpenseModal
                    groupId={group.id}
                    members={group.members}
                    initialData={editingExpense}
                    onClose={() => { setShowAddExpense(false); setEditingExpense(null); }}
                    onSuccess={() => { setShowAddExpense(false); setEditingExpense(null); fetchData(); }}
                />
            )}

            {showIdentityModal && group && (
                <IdentityModal
                    members={group.members}
                    onSelect={handleIdentitySelect}
                    onCreate={handleIdentityCreate}
                />
            )}

            {showProfileModal && currentUser && (
                <ProfileEditorModal
                    groupId={group.id}
                    member={currentUser}
                    onClose={() => setShowProfileModal(false)}
                    onSuccess={fetchData}
                    onLogout={() => {
                        localStorage.removeItem(`bill-user-${group.id}`);
                        setCurrentMemberId(null);
                        setShowProfileModal(false);
                        setShowIdentityModal(true);
                    }}
                />
            )}
        </div>
    );
}
