export interface Group {
    id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
}

export interface Member {
    id: number;
    group_id: string;
    name: string;
    created_at: Date;
}

export interface Expense {
    id: number;
    group_id: string;
    payer_member_id: number;
    amount: number;
    description: string;
    created_at: Date;
    created_by_name: string;
}

export interface ExpenseSplit {
    expense_id: number;
    member_id: number;
    owed_amount: number;
}
