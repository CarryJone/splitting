import { Expense, ExpenseSplit, Member } from '../types';

interface Balance {
    memberId: number;
    amount: number; // Positive = Creditor (owed money), Negative = Debtor (owes money)
}

interface Transfer {
    from: number; // Member ID
    to: number;   // Member ID
    amount: number;
}

export function calculateSettlement(
    members: Member[],
    expenses: Expense[],
    splits: ExpenseSplit[]
): Transfer[] {
    // 1. Calculate Net Balance
    const balances: Record<number, number> = {};

    // Initialize 0 for all members
    members.forEach(m => balances[m.id] = 0);

    // Process expenses (payer gets +)
    expenses.forEach(e => {
        balances[e.payer_member_id] = (balances[e.payer_member_id] || 0) + e.amount;
    });

    // Process splits (ower gets -)
    splits.forEach(s => {
        balances[s.member_id] = (balances[s.member_id] || 0) - s.owed_amount;
    });

    // 2. Separate into Debtors and Creditors
    let debtors: Balance[] = [];
    let creditors: Balance[] = [];

    Object.entries(balances).forEach(([idStr, amount]) => {
        const id = parseInt(idStr);
        if (amount < -1) debtors.push({ memberId: id, amount }); // Use -1 to handle small float errors if any (though we use int)
        else if (amount > 1) creditors.push({ memberId: id, amount });
    });

    // 3. Greedy Matching
    // Sort by magnitude (descending) to minimize transactions
    debtors.sort((a, b) => a.amount - b.amount); // Ascending (most negative first) -> effectively largest debt
    creditors.sort((a, b) => b.amount - a.amount); // Descending (largest credit first)

    const transfers: Transfer[] = [];

    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        // The amount to settle is the minimum of what debtor owes and creditor is owed
        const amount = Math.min(Math.abs(debtor.amount), creditor.amount);

        if (amount > 0) {
            transfers.push({
                from: debtor.memberId,
                to: creditor.memberId,
                amount: Math.round(amount)
            });
        }

        // Update balances
        debtor.amount += amount;
        creditor.amount -= amount;

        // If settled, move to next
        if (Math.abs(debtor.amount) < 1) i++;
        if (creditor.amount < 1) j++;
    }

    return transfers;
}
