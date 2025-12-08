import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGroup, getSettlement, deleteExpense } from '../api';
import { Users, Receipt, Calculator, Plus } from 'lucide-react';
import clsx from 'clsx';

import MemberList from '../components/MemberList';
import ExpenseList from '../components/ExpenseList';
import SettlementPlan from '../components/SettlementPlan';
import AddExpenseModal from '../components/AddExpenseModal';
import LoadingScreen from '../components/LoadingScreen';

export default function GroupDashboard() {
    const { id } = useParams<{ id: string }>();
    const [group, setGroup] = useState<any>(null);
    const [settlement, setSettlement] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'expenses' | 'settlement'>('expenses');
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [editingExpense, setEditingExpense] = useState<any>(null);

    const fetchData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [groupRes, settlementRes] = await Promise.all([
                getGroup(id),
                getSettlement(id)
            ]);
            setGroup(groupRes.data);
            setSettlement(settlementRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

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



    if (loading) return <LoadingScreen />;
    if (!group) return <div className="min-h-screen flex items-center justify-center">找不到群組</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200/50 transition-all duration-300">
                <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 truncate tracking-tight">{group.name}</h1>
                        <div className="text-xs text-gray-500 font-medium tracking-wide">ID: {group.id.slice(0, 8)}...</div>
                    </div>
                    <div className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                        {group.members.length} 成員
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-8 animate-fade-in">
                {/* Members Section */}
                <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 transition-shadow hover:shadow-md">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        成員列表
                    </h2>
                    <MemberList groupId={group.id} members={group.members} onUpdate={fetchData} />
                </section>

                {/* Tabs */}
                <div className="bg-gray-100/80 p-1.5 rounded-2xl flex relative">
                    <button
                        onClick={() => setActiveTab('expenses')}
                        className={clsx(
                            "flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 relative z-10",
                            activeTab === 'expenses'
                                ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                        )}
                    >
                        <Receipt className="w-4 h-4" />
                        費用列表
                    </button>
                    <button
                        onClick={() => setActiveTab('settlement')}
                        className={clsx(
                            "flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 relative z-10",
                            activeTab === 'settlement'
                                ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                        )}
                    >
                        <Calculator className="w-4 h-4" />
                        結算方案
                    </button>
                </div>

                {/* Content */}
                <div className="min-h-[300px]">
                    {activeTab === 'expenses' ? (
                        <ExpenseList
                            expenses={group.expenses}
                            members={group.members}
                            onEdit={handleEditExpense}
                            onDelete={handleDeleteExpense}
                        />
                    ) : (
                        <SettlementPlan data={settlement} />
                    )}
                </div>
            </main>

            {/* Floating Action Button */}
            <button
                onClick={() => {
                    setEditingExpense(null);
                    setShowAddExpense(true);
                }}
                className="fixed bottom-8 right-6 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl p-4 shadow-xl shadow-brand-600/30 transition-all hover:scale-105 active:scale-95 hover:-translate-y-1 z-30"
            >
                <Plus className="w-7 h-7" />
            </button>

            {/* Modals */}
            {showAddExpense && (
                <AddExpenseModal
                    groupId={group.id}
                    members={group.members}
                    initialData={editingExpense}
                    onClose={() => {
                        setShowAddExpense(false);
                        setEditingExpense(null);
                    }}
                    onSuccess={() => {
                        setShowAddExpense(false);
                        setEditingExpense(null);
                        fetchData();
                    }}
                />
            )}
        </div>
    );
}
