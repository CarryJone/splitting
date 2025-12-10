// Curated list of distinct colors for better accessibility and differentiation
export const MEMBER_COLORS = [
    'bg-red-100 text-red-700 border-red-200',      // Red
    'bg-orange-100 text-orange-700 border-orange-200', // Orange
    'bg-yellow-100 text-yellow-700 border-yellow-200', // Yellow (Darker text)
    'bg-green-100 text-green-700 border-green-200',   // Green
    'bg-cyan-100 text-cyan-700 border-cyan-200',     // Cyan (Distinct from Blue)
    'bg-blue-100 text-blue-700 border-blue-200',     // Blue
    'bg-purple-100 text-purple-700 border-purple-200', // Purple
    'bg-pink-100 text-pink-700 border-pink-200',     // Pink
    'bg-stone-100 text-stone-600 border-stone-200',    // Stone (Distinct Gray)
    'bg-indigo-100 text-indigo-700 border-indigo-200', // Indigo
];

export const getMemberColor = (memberId: number) => {
    // Use the member ID directly for deterministic and distributed coloring
    // Since IDs are sequential (SERIAL), this guarantees no repetition for the first N members
    return MEMBER_COLORS[memberId % MEMBER_COLORS.length];
};

export const getMemberInitials = (name: string) => {
    return name ? name.slice(0, 1).toUpperCase() : '?';
};
