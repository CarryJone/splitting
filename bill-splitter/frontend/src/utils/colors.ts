export const MEMBER_COLORS = [
    'bg-red-100 text-red-600 border-red-200',
    'bg-orange-100 text-orange-600 border-orange-200',
    'bg-amber-100 text-amber-600 border-amber-200',
    'bg-yellow-100 text-yellow-600 border-yellow-200',
    'bg-lime-100 text-lime-600 border-lime-200',
    'bg-green-100 text-green-600 border-green-200',
    'bg-emerald-100 text-emerald-600 border-emerald-200',
    'bg-teal-100 text-teal-600 border-teal-200',
    'bg-cyan-100 text-cyan-600 border-cyan-200',
    'bg-sky-100 text-sky-600 border-sky-200',
    'bg-blue-100 text-blue-600 border-blue-200',
    'bg-indigo-100 text-indigo-600 border-indigo-200',
    'bg-violet-100 text-violet-600 border-violet-200',
    'bg-purple-100 text-purple-600 border-purple-200',
    'bg-fuchsia-100 text-fuchsia-600 border-fuchsia-200',
    'bg-pink-100 text-pink-600 border-pink-200',
    'bg-rose-100 text-rose-600 border-rose-200',
    'bg-slate-100 text-slate-600 border-slate-200',
    'bg-gray-100 text-gray-600 border-gray-200',
    'bg-zinc-100 text-zinc-600 border-zinc-200',
];

export const getMemberColor = (memberId: number) => {
    // Use the member ID directly for deterministic and distributed coloring
    // Since IDs are sequential (SERIAL), this guarantees no repetition for the first N members
    return MEMBER_COLORS[memberId % MEMBER_COLORS.length];
};

export const getMemberInitials = (name: string) => {
    return name ? name.slice(0, 1).toUpperCase() : '?';
};
