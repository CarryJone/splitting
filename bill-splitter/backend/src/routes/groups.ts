import { Hono } from 'hono';
import { query, getPool } from '../db';
import { Group, Member, Expense, ExpenseSplit } from '../types';
import { calculateSettlement } from '../services/debtSimplification';

const groups = new Hono();

// Create a new group
groups.post('/', async (c) => {
    const { name } = await c.req.json();

    if (!name) {
        return c.json({ error: 'Group name is required' }, 400);
    }

    try {
        const result = await query(
            'INSERT INTO groups (name) VALUES ($1) RETURNING *',
            [name]
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
        const groupResult = await query('SELECT * FROM groups WHERE id = $1', [id]);

        if (groupResult.rows.length === 0) {
            return c.json({ error: 'Group not found' }, 404);
        }

        const membersResult = await query('SELECT * FROM members WHERE group_id = $1', [id]);
        const expensesResult = await query('SELECT * FROM expenses WHERE group_id = $1 ORDER BY created_at DESC', [id]);

        // Fetch all splits for these expenses
        const splitsResult = await query(
            'SELECT es.* FROM expense_splits es JOIN expenses e ON es.expense_id = e.id WHERE e.group_id = $1',
            [id]
        );

        const expensesWithSplits = expensesResult.rows.map(expense => ({
            ...expense,
            splits: splitsResult.rows
                .filter(split => split.expense_id === expense.id)
                .map(split => ({
                    ...split,
                    member_id: split.member_member_id // Map DB column to frontend expected prop
                }))
        }));

        return c.json({
            ...groupResult.rows[0],
            members: membersResult.rows,
            expenses: expensesWithSplits
        });
    } catch (err) {
        console.error(err);
        return c.json({ error: 'Failed to fetch group' }, 500);
    }
});

// Add a member to a group
groups.post('/:id/members', async (c) => {
    const groupId = c.req.param('id');
    console.log(`[API] POST /api/groups/${groupId}/members called`);

    let body;
    try {
        body = await c.req.json();
    } catch (e) {
        console.error('[API] Failed to parse JSON body', e);
        return c.json({ error: 'Invalid JSON' }, 400);
    }

    const { name } = body;
    console.log(`[API] Adding member: ${name} to group: ${groupId}`);

    if (!name) {
        return c.json({ error: 'Member name is required' }, 400);
    }

    try {
        // Verify group exists
        console.log('[API] Verifying group existence...');
        const groupCheck = await query('SELECT id FROM groups WHERE id = $1', [groupId]);
        if (groupCheck.rows.length === 0) {
            console.log('[API] Group not found');
            return c.json({ error: 'Group not found' }, 404);
        }

        console.log('[API] Inserting member...');
        const result = await query(
            'INSERT INTO members (group_id, name) VALUES ($1, $2) RETURNING *',
            [groupId, name]
        );
        const member: Member = result.rows[0];
        console.log(`[API] Member created: ${member.id}`);
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
    const { name } = await c.req.json();

    if (!name) {
        return c.json({ error: 'Member name is required' }, 400);
    }

    try {
        const result = await query(
            'UPDATE members SET name = $1 WHERE id = $2 AND group_id = $3 RETURNING *',
            [name, memberId, groupId]
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
        // Check if member is part of any expenses (payer or split)
        const expenseCheck = await query(
            'SELECT 1 FROM expenses WHERE payer_member_id = $1 LIMIT 1',
            [memberId]
        );
        const splitCheck = await query(
            'SELECT 1 FROM expense_splits WHERE member_member_id = $1 LIMIT 1',
            [memberId]
        );

        if (expenseCheck.rows.length > 0 || splitCheck.rows.length > 0) {
            return c.json({ error: 'Cannot delete member with existing expenses' }, 400);
        }

        const result = await query(
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

    // Basic validation
    if (!payer_member_id || !amount || !splits || !Array.isArray(splits)) {
        return c.json({ error: 'Invalid expense data' }, 400);
    }

    // const client = await import('../db').then(m => m.query); // Removed dynamic import for compatibility
    // For simplicity using simple queries, but ideally should be a transaction.
    // Since we don't have a transaction helper exposed in db/index.ts yet, let's just do it sequentially or update db/index.ts.
    // Re-importing query from top level is better.

    try {
        // 1. Create Expense
        const expenseResult = await query(
            'INSERT INTO expenses (group_id, payer_member_id, amount, description, created_by_name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [groupId, payer_member_id, amount, description, created_by_name]
        );
        const expense: Expense = expenseResult.rows[0];

        // 2. Create Splits
        for (const split of splits) {
            await query(
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

    const client = await getPool().connect();

    try {
        await client.query('BEGIN');

        // Verify expense exists and belongs to group
        const check = await client.query('SELECT id FROM expenses WHERE id = $1 AND group_id = $2', [expenseId, groupId]);
        if (check.rows.length === 0) {
            await client.query('ROLLBACK');
            return c.json({ error: 'Expense not found' }, 404);
        }

        // Update Expense
        const expenseResult = await client.query(
            'UPDATE expenses SET payer_member_id = $1, amount = $2, description = $3, created_by_name = $4 WHERE id = $5 RETURNING *',
            [payer_member_id, amount, description, created_by_name, expenseId]
        );
        const expense: Expense = expenseResult.rows[0];

        // Delete old splits
        await client.query('DELETE FROM expense_splits WHERE expense_id = $1', [expenseId]);

        // Insert new splits
        for (const split of splits) {
            await client.query(
                'INSERT INTO expense_splits (expense_id, member_member_id, owed_amount) VALUES ($1, $2, $3)',
                [expenseId, split.member_id, split.owed_amount]
            );
        }

        await client.query('COMMIT');
        return c.json(expense, 200);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        return c.json({ error: 'Failed to update expense' }, 500);
    } finally {
        client.release();
    }
});

// Delete an expense
groups.delete('/:id/expenses/:expenseId', async (c) => {
    const groupId = c.req.param('id');
    const expenseId = c.req.param('expenseId');

    try {
        const result = await query(
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
        // Fetch all data needed for calculation
        const membersRes = await query('SELECT * FROM members WHERE group_id = $1', [groupId]);
        const expensesRes = await query('SELECT * FROM expenses WHERE group_id = $1', [groupId]);

        // We need all splits for these expenses
        // A JOIN would be better, but let's do a subquery or just fetch all splits for the group's expenses
        // Optimized: SELECT es.* FROM expense_splits es JOIN expenses e ON es.expense_id = e.id WHERE e.group_id = $1
        const splitsRes = await query(
            'SELECT es.* FROM expense_splits es JOIN expenses e ON es.expense_id = e.id WHERE e.group_id = $1',
            [groupId]
        );

        const members = membersRes.rows;
        const expenses = expensesRes.rows;
        const splits: ExpenseSplit[] = splitsRes.rows.map(row => ({
            expense_id: row.expense_id,
            member_id: row.member_member_id,
            owed_amount: row.owed_amount
        }));

        const plan = calculateSettlement(members, expenses, splits);

        // Map IDs to Names for frontend display
        const memberMap = new Map(members.map((m: Member) => [m.id, m.name]));

        const readablePlan = plan.map(p => ({
            from: memberMap.get(p.from) || 'Unknown',
            to: memberMap.get(p.to) || 'Unknown',
            amount: p.amount
        }));

        const totalExpense = expenses.reduce((sum: number, e: Expense) => sum + e.amount, 0);

        return c.json({
            total_expense: totalExpense,
            settlement_plan: readablePlan
        });

    } catch (err) {
        console.error(err);
        return c.json({ error: 'Failed to calculate settlement' }, 500);
    }
});

// Get all groups (for Home page)
groups.get('/', async (c) => {
    console.log('[API] GET /groups request received');
    try {
        console.log('[API] Executing DB query for groups...');
        const result = await query('SELECT * FROM groups ORDER BY created_at DESC');
        console.log(`[API] Found ${result.rows.length} groups`);
        return c.json(result.rows);
    } catch (err) {
        console.error('[API] Error fetching groups:', err);
        return c.json({ error: 'Failed to fetch groups', details: String(err) }, 500);
    }
});

export default groups;
