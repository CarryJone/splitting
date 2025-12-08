import { calculateSettlement } from './debtSimplification';
import { Member, Expense, ExpenseSplit } from '../types';

// Mock Data
const members: Member[] = [
    { id: 1, name: 'Alice', group_id: 'g1', created_at: new Date() },
    { id: 2, name: 'Bob', group_id: 'g1', created_at: new Date() },
    { id: 3, name: 'Charlie', group_id: 'g1', created_at: new Date() }
];

// Scenario:
// Alice pays 3000.
// Split: Alice 1000, Bob 1000, Charlie 1000.
// Net: Alice +2000, Bob -1000, Charlie -1000.
// Expected: Bob -> Alice 1000, Charlie -> Alice 1000.

const expenses: Expense[] = [
    { id: 1, group_id: 'g1', payer_member_id: 1, amount: 3000, description: 'Dinner', created_at: new Date(), created_by_name: 'Alice' }
];

const splits: ExpenseSplit[] = [
    { expense_id: 1, member_id: 1, owed_amount: 1000 },
    { expense_id: 1, member_id: 2, owed_amount: 1000 },
    { expense_id: 1, member_id: 3, owed_amount: 1000 }
];

console.log('--- Test Case 1: Simple Equal Split ---');
const plan1 = calculateSettlement(members, expenses, splits);
console.log(plan1);

// Scenario 2: Chain Debt
// Alice pays 100 for Bob. (Bob owes Alice 100)
// Bob pays 100 for Charlie. (Charlie owes Bob 100)
// Net: Alice +100, Bob 0, Charlie -100.
// Expected: Charlie -> Alice 100. (Simplification!)

const expenses2: Expense[] = [
    { id: 1, group_id: 'g1', payer_member_id: 1, amount: 100, description: 'A for B', created_at: new Date(), created_by_name: 'Alice' },
    { id: 2, group_id: 'g1', payer_member_id: 2, amount: 100, description: 'B for C', created_at: new Date(), created_by_name: 'Bob' }
];

const splits2: ExpenseSplit[] = [
    { expense_id: 1, member_id: 2, owed_amount: 100 },
    { expense_id: 2, member_id: 3, owed_amount: 100 }
];

console.log('--- Test Case 2: Chain Debt Simplification ---');
const plan2 = calculateSettlement(members, expenses2, splits2);
console.log(plan2);
