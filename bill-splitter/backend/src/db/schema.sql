-- 1. 群組表 (以 UUID 作為對外的唯一連結識別)
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 群組成員表 (沒有帳號密碼，只有顯示名稱)
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 帳務表 (流水帳)
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    payer_member_id INTEGER REFERENCES members(id), -- 誰先墊錢
    amount INTEGER NOT NULL CHECK (amount > 0),   -- 台幣整數
    description VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_name VARCHAR(50) -- 紀錄是誰填寫這筆資料的
);

-- 4. 分帳明細表 (紀錄誰該付多少)
CREATE TABLE expense_splits (
    expense_id INTEGER REFERENCES expenses(id) ON DELETE CASCADE,
    member_member_id INTEGER REFERENCES members(id), -- 誰該分擔
    owed_amount INTEGER NOT NULL -- 該員分擔的金額
);

-- 索引優化
CREATE INDEX idx_expenses_group_id ON expenses(group_id);
CREATE INDEX idx_members_group_id ON members(group_id);
