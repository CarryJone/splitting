import React, { useState } from 'react';
import { addMember, updateMember, deleteMember } from '../api';
import { Plus, Pencil, Trash2, X, Check, Save, Loader2 } from 'lucide-react';
import { getMemberColor, getMemberInitials } from '../utils/colors';

interface Props {
    groupId: string;
    members: any[];
    onUpdate: () => void;
}

export default function MemberList({ groupId, members, onUpdate }: Props) {
    const [newName, setNewName] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [pendingMembers, setPendingMembers] = useState<string[]>([]);

    const handleAddPending = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setPendingMembers([...pendingMembers, newName.trim()]);
        setNewName('');
    };

    const removePending = (index: number) => {
        setPendingMembers(pendingMembers.filter((_, i) => i !== index));
    };

    const handleSaveAll = async () => {
        if (pendingMembers.length === 0) return;
        setLoading(true);
        try {
            // Sequential execution to ensure order and avoid race conditions
            for (const name of pendingMembers) {
                await addMember(groupId, name);
            }
            setPendingMembers([]);
            onUpdate();
        } catch (err) {
            console.error(err);
            alert('儲存成員失敗，請稍後再試');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (memberId: number) => {
        if (!editName.trim()) return;
        setLoading(true);
        try {
            await updateMember(groupId, memberId, editName);
            setEditingId(null);
            onUpdate();
        } catch (err) {
            console.error(err);
            alert('更新成員失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (memberId: number) => {
        if (!confirm('確定要刪除這位成員嗎？若該成員有相關費用紀錄將無法刪除。')) return;
        setLoading(true);
        try {
            await deleteMember(groupId, memberId);
            onUpdate();
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.error;
            if (errorMsg === 'Cannot delete member with existing expenses') {
                alert('無法刪除：該成員已有相關費用紀錄。請先刪除或修改相關費用。');
            } else {
                alert('刪除失敗，請稍後再試');
            }
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (member: any) => {
        setEditingId(member.id);
        setEditName(member.name);
    };



    return (
        <div className="space-y-4">
            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center animate-bounce-in">
                        <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-3" />
                        <p className="text-gray-600 font-medium">正在儲存成員資料...</p>
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-3">
                {/* Existing Members */}
                {members.map(member => (
                    <div key={member.id} className="group relative flex items-center gap-2 bg-gray-50 pl-1 pr-3 py-1 rounded-full border border-gray-100 hover:border-brand-200 hover:shadow-sm transition-all">
                        {editingId === member.id ? (
                            <div className="flex items-center gap-1 pl-1">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-20 text-sm bg-white border border-brand-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                    autoFocus
                                />
                                <button onClick={() => handleUpdate(member.id)} className="p-0.5 text-green-600 hover:bg-green-50 rounded-full">
                                    <Check className="w-3 h-3" />
                                </button>
                                <button onClick={() => setEditingId(null)} className="p-0.5 text-red-500 hover:bg-red-50 rounded-full">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${getMemberColor(member.id)}`}>
                                    {getMemberInitials(member.name || '?')}
                                </div>
                                <span className="text-sm font-medium text-gray-700">{member.name || 'Unknown'}</span>

                                {/* Hover Actions */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-lg p-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto z-10 scale-90 group-hover:scale-100">
                                    <button
                                        onClick={() => startEdit(member)}
                                        className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                                        title="編輯"
                                    >
                                        <Pencil className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(member.id)}
                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        title="刪除"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {/* Pending Members */}
                {pendingMembers.map((name, index) => (
                    <div key={`pending-${index}`} className="flex items-center gap-2 bg-gray-50 pl-1 pr-2 py-1 rounded-full border border-gray-200 border-dashed animate-fade-in">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-white text-gray-400 border border-gray-200">
                            {getMemberInitials(name)}
                        </div>
                        <span className="text-sm font-medium text-brand-700">{name}</span>
                        <button
                            onClick={() => removePending(index)}
                            className="ml-1 p-0.5 text-brand-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                {/* Add Input */}
                <form onSubmit={handleAddPending} className="flex items-center">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="輸入名字按 Enter..."
                            className="pl-3 pr-10 py-1.5 w-36 rounded-full border border-gray-200 bg-white text-sm focus:w-48 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none placeholder:text-gray-400"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !newName.trim()}
                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 bg-brand-100 text-brand-600 rounded-full hover:bg-brand-200 disabled:opacity-0 transition-all"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Save Button */}
            {pendingMembers.length > 0 && (
                <div className="flex justify-end animate-fade-in">
                    <button
                        onClick={handleSaveAll}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl shadow-lg shadow-brand-600/20 hover:bg-brand-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        確認新增 {pendingMembers.length} 位成員
                    </button>
                </div>
            )}
        </div>
    );
}
