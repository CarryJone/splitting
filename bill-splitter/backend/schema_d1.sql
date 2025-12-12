-- 1. 群組表
CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY, -- Application generated UUID
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 2. 群組成員表
CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id TEXT NOT NULL,
    name TEXT NOT NULL,
    bank_code TEXT,
    bank_account TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- 3. 帳務表
CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id TEXT NOT NULL,
    payer_member_id INTEGER NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    description TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    created_by_name TEXT,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (payer_member_id) REFERENCES members(id)
);

-- 4. 分帳明細表
CREATE TABLE IF NOT EXISTS expense_splits (
    expense_id INTEGER NOT NULL,
    member_member_id INTEGER NOT NULL,
    owed_amount INTEGER NOT NULL,
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    FOREIGN KEY (member_member_id) REFERENCES members(id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_members_group_id ON members(group_id);

-- 5. 結算狀態表
CREATE TABLE IF NOT EXISTS settlement_status (
    group_id TEXT NOT NULL,
    from_member_id INTEGER NOT NULL,
    to_member_id INTEGER NOT NULL,
    is_settled BOOLEAN DEFAULT 0,
    PRIMARY KEY (group_id, from_member_id, to_member_id),
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (from_member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (to_member_id) REFERENCES members(id) ON DELETE CASCADE
);
