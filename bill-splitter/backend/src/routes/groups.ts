import { Hono } from 'hono';
import { query } from '../db';
import { Group, Member, Expense, ExpenseSplit } from '../types';
import { calculateSettlement } from '../services/debtSimplification';
import { Bindings } from '../index';

const groups = new Hono<{ Bindings: Bindings }>();

// Helper to generate UUIDs
const generateUUID = () => crypto.randomUUID();

// Create a new group
groups.post('/', async (c) => {
    const { name } = await c.req.json();

    if (!name) {
        return c.json({ error: 'Group name is required' }, 400);
    }

    try {
        const id = generateUUID();
        const result = await query(
            c.env.DB,
            'INSERT INTO groups (id, name) VALUES ($1, $2) RETURNING *',
            [id, name]
        );
        const group: Group = result.rows[0];
        return c.json(group, 201);
    } catch (err) {
        console.error(err);
        return c.json({ error: 'Failed to create group' }, 500);
    }
});

// Get group details
groups.get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
        const groupResult = await query(c.env.DB, 'SELECT * FROM groups WHERE id = $1', [id]);

        if (groupResult.rows.length === 0) {
            return c.json({ error: 'Group not found' }, 404);
        }

        const membersResult = await query(c.env.DB, 'SELECT * FROM members WHERE group_id = $1', [id]);
        const expensesResult = await query(c.env.DB, 'SELECT * FROM expenses WHERE group_id = $1 ORDER BY created_at DESC', [id]);

        const splitsResult = await query(
            c.env.DB,
            'SELECT es.* FROM expense_splits es JOIN expenses e ON es.expense_id = e.id WHERE e.group_id = $1',
            [id]
        );

        const expensesWithSplits = expensesResult.rows.map(expense => ({
            ...expense,
            splits: splitsResult.rows
                .filter(split => split.expense_id === expense.id)
                .map(split => ({
                    ...split,
                    member_id: split.member_member_id
                }))
        }));

        return c.json({
            ...groupResult.rows[0],
            members: membersResult.rows,
            expenses: expensesWithSplits
        });
    } catch (err) {
        console.error(err);
        return c.json({ error: 'Failed to fetch group', details: String(err) }, 500);
    }
});

// Add a member to a group
groups.post('/:id/members', async (c) => {
    const groupId = c.req.param('id');
    const body = await c.req.json();
    const { name } = body;

    if (!name) {
        return c.json({ error: 'Member name is required' }, 400);
    }

    try {
        const groupCheck = await query(c.env.DB, 'SELECT id FROM groups WHERE id = $1', [groupId]);
        if (groupCheck.rows.length === 0) {
            return c.json({ error: 'Group not found' }, 404);
        }

        const result = await query(
            c.env.DB,
            'INSERT INTO members (group_id, name, bank_code, bank_account) VALUES ($1, $2, $3, $4) RETURNING *',
            [groupId, name, body.bank_code || null, body.bank_account || null]
        );
        const member: Member = result.rows[0];
        return c.json(member, 201);
    } catch (err) {
        console.error('[API] Failed to add member:', err);
        return c.json({ error: 'Failed to add member', details: String(err) }, 500);
    }
});

// Update a member
groups.put('/:id/members/:memberId', async (c) => {
    const groupId = c.req.param('id');
    const memberId = c.req.param('memberId');
    const { name, bank_code, bank_account } = await c.req.json();

    if (!name) {
        return c.json({ error: 'Member name is required' }, 400);
    }

    try {
        const result = await query(
            c.env.DB,
            'UPDATE members SET name = $1, bank_code = $2, bank_account = $3 WHERE id = $4 AND group_id = $5 RETURNING *',
            [name, bank_code || null, bank_account || null, memberId, groupId]
        );

        if (result.rows.length === 0) {
            return c.json({ error: 'Member not found' }, 404);
        }

        return c.json(result.rows[0], 200);
    } catch (err) {
        console.error(err);
        return c.json({ error: 'Failed to update member' }, 500);
    }
});

// Delete a member
groups.delete('/:id/members/:memberId', async (c) => {
    const groupId = c.req.param('id');
    const memberId = c.req.param('memberId');

    try {
        const expenseCheck = await query(
            c.env.DB,
            'SELECT 1 FROM expenses WHERE payer_member_id = $1 LIMIT 1',
            [memberId]
        );
        const splitCheck = await query(
            c.env.DB,
            'SELECT 1 FROM expense_splits WHERE member_member_id = $1 LIMIT 1',
            [memberId]
        );

        if (expenseCheck.rows.length > 0 || splitCheck.rows.length > 0) {
            return c.json({ error: 'Cannot delete member with existing expenses' }, 400);
        }

        const result = await query(
            c.env.DB,
            'DELETE FROM members WHERE id = $1 AND group_id = $2 RETURNING id',
            [memberId, groupId]
        );

        if (result.rows.length === 0) {
            return c.json({ error: 'Member not found' }, 404);
        }

        return c.json({ message: 'Member deleted' }, 200);
    } catch (err) {
        console.error(err);
        return c.json({ error: 'Failed to delete member' }, 500);
    }
});

// Add an expense
groups.post('/:id/expenses', async (c) => {
    const groupId = c.req.param('id');
    const { payer_member_id, amount, description, created_by_name, splits } = await c.req.json();

    if (!payer_member_id || !amount || !splits || !Array.isArray(splits)) {
        return c.json({ error: 'Invalid expense data' }, 400);
    }

    try {
        const expenseResult = await query(
            c.env.DB,
            'INSERT INTO expenses (group_id, payer_member_id, amount, description, created_by_name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [groupId, payer_member_id, amount, description, created_by_name]
        );
        const expense: Expense = expenseResult.rows[0];

        for (const split of splits) {
            await query(
                c.env.DB,
                'INSERT INTO expense_splits (expense_id, member_member_id, owed_amount) VALUES ($1, $2, $3)',
                [expense.id, split.member_id, split.owed_amount]
            );
        }

        return c.json(expense, 201);
    } catch (err) {
        console.error(err);
        return c.json({ error: 'Failed to add expense' }, 500);
    }
});

// Update an expense
groups.put('/:id/expenses/:expenseId', async (c) => {
    const groupId = c.req.param('id');
    const expenseId = c.req.param('expenseId');
    const { payer_member_id, amount, description, created_by_name, splits } = await c.req.json();

    if (!payer_member_id || !amount || !splits || !Array.isArray(splits)) {
        return c.json({ error: 'Invalid expense data' }, 400);
    }

    try {
        const check = await query(c.env.DB, 'SELECT id FROM expenses WHERE id = $1 AND group_id = $2', [expenseId, groupId]);
        if (check.rows.length === 0) {
            return c.json({ error: 'Expense not found' }, 404);
        }

        const expenseResult = await query(
            c.env.DB,
            'UPDATE expenses SET payer_member_id = $1, amount = $2, description = $3, created_by_name = $4 WHERE id = $5 RETURNING *',
            [payer_member_id, amount, description, created_by_name, expenseId]
        );
        const expense: Expense = expenseResult.rows[0];

        await query(c.env.DB, 'DELETE FROM expense_splits WHERE expense_id = $1', [expenseId]);

        for (const split of splits) {
            await query(
                c.env.DB,
                'INSERT INTO expense_splits (expense_id, member_member_id, owed_amount) VALUES ($1, $2, $3)',
                [expenseId, split.member_id, split.owed_amount]
            );
        }

        return c.json(expense, 200);
    } catch (err) {
        console.error(err);
        return c.json({ error: 'Failed to update expense' }, 500);
    }
});

// Delete an expense
groups.delete('/:id/expenses/:expenseId', async (c) => {
    const groupId = c.req.param('id');
    const expenseId = c.req.param('expenseId');

    try {
        const result = await query(
            c.env.DB,
            'DELETE FROM expenses WHERE id = $1 AND group_id = $2 RETURNING id',
            [expenseId, groupId]
        );

        if (result.rows.length === 0) {
            return c.json({ error: 'Expense not found' }, 404);
        }

        return c.json({ message: 'Expense deleted' }, 200);
    } catch (err) {
        console.error(err);
        return c.json({ error: 'Failed to delete expense' }, 500);
    }
});

// Get settlement plan
groups.get('/:id/settlement', async (c) => {
    const groupId = c.req.param('id');

    try {
        const membersRes = await query(c.env.DB, 'SELECT * FROM members WHERE group_id = $1', [groupId]);
        const expensesRes = await query(c.env.DB, 'SELECT * FROM expenses WHERE group_id = $1', [groupId]);
        const splitsRes = await query(
            c.env.DB,
            'SELECT es.* FROM expense_splits es JOIN expenses e ON es.expense_id = e.id WHERE e.group_id = $1',
            [groupId]
        );
        const statusRes = await query(c.env.DB, 'SELECT * FROM settlement_status WHERE group_id = $1', [groupId]);

        const members = membersRes.rows;
        const expenses = expensesRes.rows;
        const splits: ExpenseSplit[] = splitsRes.rows.map(row => ({
            expense_id: row.expense_id,
            member_id: row.member_member_id,
            owed_amount: row.owed_amount
        }));

        const plan = calculateSettlement(members, expenses, splits);

        const memberMap = new Map(members.map((m: Member) => [m.id, m.name]));
        const receiverMap = new Map(members.map((m: Member) => [m.id, m]));

        // Map status for quick lookup: "from-to" -> is_settled
        const statusMap = new Map();
        statusRes.rows.forEach(row => {
            statusMap.set(`${row.from_member_id}-${row.to_member_id}`, row.is_settled);
        });

        const readablePlan = plan.map(p => {
            const receiver = receiverMap.get(p.to);
            const isSettled = statusMap.get(`${p.from}-${p.to}`) === 1; // SQLite boolean is 1/0
            return {
                from: memberMap.get(p.from) || 'Unknown',
                to: memberMap.get(p.to) || 'Unknown',
                from_id: p.from,
                to_id: p.to,
                amount: p.amount,
                bank_code: receiver?.bank_code,
                bank_account: receiver?.bank_account,
                is_settled: isSettled
            };
        });

        const totalExpense = expenses.reduce((sum: number, e: Expense) => sum + e.amount, 0);

        return c.json({
            total_expense: totalExpense,
            settlement_plan: readablePlan
        });

    } catch (err) {
        console.error(err);
        return c.json({ error: 'Failed to calculate settlement', details: String(err) }, 500);
    }
});

// Toggle settlement status
groups.post('/:id/settlement/toggle', async (c) => {
    const groupId = c.req.param('id');
    const { from_member_id, to_member_id } = await c.req.json();

    if (!from_member_id || !to_member_id) {
        return c.json({ error: 'Missing member IDs' }, 400);
    }

    try {
        // SQLite upsert to toggle
        // We first check if it exists
        const check = await query(
            c.env.DB,
            'SELECT is_settled FROM settlement_status WHERE group_id = $1 AND from_member_id = $2 AND to_member_id = $3',
            [groupId, from_member_id, to_member_id]
        );

        let newStatus = true;
        if (check.rows.length > 0) {
            newStatus = !check.rows[0].is_settled;
            await query(
                c.env.DB,
                'UPDATE settlement_status SET is_settled = $1 WHERE group_id = $2 AND from_member_id = $3 AND to_member_id = $4',
                [newStatus, groupId, from_member_id, to_member_id]
            );
        } else {
            await query(
                c.env.DB,
                'INSERT INTO settlement_status (group_id, from_member_id, to_member_id, is_settled) VALUES ($1, $2, $3, $4)',
                [groupId, from_member_id, to_member_id, true]
            );
        }

        return c.json({ is_settled: newStatus });
    } catch (err) {
        console.error('Toggle error:', err);
        return c.json({ error: 'Failed to toggle settlement', details: String(err) }, 500);
    }
});

// Get all groups
groups.get('/', async (c) => {
    try {
        const result = await query(c.env.DB, 'SELECT * FROM groups ORDER BY created_at DESC', []);
        return c.json(result.rows);
    } catch (err) {
        console.error('[API] Error fetching groups:', err);
        return c.json({ error: 'Failed to fetch groups', details: String(err) }, 500);
    }
});

export default groups;
