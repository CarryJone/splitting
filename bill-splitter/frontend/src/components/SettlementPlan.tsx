import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Wallet, Copy, Check } from 'lucide-react';

interface Props {
    data: any;
}

export default function SettlementPlan({ data }: Props) {
    if (!data) return null;

    const { total_expense, settlement_plan } = data;
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    // Calculate net balance for each person
    const netBalances = useMemo(() => {
        const balances: { [key: string]: number } = {};

        settlement_plan.forEach((debt: any) => {
            balances[debt.from] = (balances[debt.from] || 0) - debt.amount;
            balances[debt.to] = (balances[debt.to] || 0) + debt.amount;
        });

        // Convert to array and sort by amount (receivers first)
        return Object.entries(balances)
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount);
    }, [settlement_plan]);

    const maxBalance = Math.max(...netBalances.map(b => Math.abs(b.amount)), 1);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    if (settlement_plan.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-gray-900 font-bold text-lg">目前沒有需要結算的債務</p>
                <p className="text-gray-500 mt-1">大家都付清了！</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Total Expense Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl shadow-gray-200">
                <div className="flex items-center gap-3 mb-2 opacity-80">
                    <Wallet className="w-5 h-5" />
                    <span className="text-sm font-medium tracking-wide">總支出</span>
                </div>
                <div className="text-4xl font-bold tracking-tight">
                    ${total_expense.toLocaleString()}
                </div>
            </div>

            {/* Net Balance Chart */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">收支概況</h3>
                <div className="space-y-4">
                    {netBalances.map((item) => (
                        <div key={item.name} className="flex items-center gap-4">
                            <div className="w-16 text-sm font-bold text-gray-700 truncate text-right shrink-0">
                                {item.name}
                            </div>

                            <div className="flex-1 flex items-center h-8 relative">
                                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200"></div>
                                <div className="w-full flex">
                                    <div className="flex-1 flex justify-end items-center gap-2">
                                        {item.amount < 0 && Math.abs(item.amount) / maxBalance * 100 < 15 && (
                                            <span className="text-red-500 font-bold text-xs">
                                                ${Math.abs(item.amount).toLocaleString()}
                                            </span>
                                        )}
                                        {item.amount < 0 && (
                                            <div
                                                className="h-6 bg-red-500 rounded-l-md flex items-center justify-end pr-2 text-xs text-white font-bold transition-all duration-500"
                                                style={{ width: `${(Math.abs(item.amount) / maxBalance) * 100}%` }}
                                            >
                                                {Math.abs(item.amount) / maxBalance * 100 >= 15 && (
                                                    <span>${Math.abs(item.amount).toLocaleString()}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex justify-start items-center gap-2">
                                        {item.amount > 0 && (
                                            <div
                                                className="h-6 bg-green-500 rounded-r-md flex items-center pl-2 text-xs text-white font-bold transition-all duration-500"
                                                style={{ width: `${(item.amount / maxBalance) * 100}%` }}
                                            >
                                                {item.amount / maxBalance * 100 >= 15 && (
                                                    <span>${item.amount.toLocaleString()}</span>
                                                )}
                                            </div>
                                        )}
                                        {item.amount > 0 && item.amount / maxBalance * 100 < 15 && (
                                            <span className="text-green-500 font-bold text-xs">
                                                ${item.amount.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-between text-xs text-gray-400 px-16 mt-2">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            應付
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            應收
                        </div>
                    </div>
                </div>
            </div>

            {/* Transfer Plan */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-2">建議轉帳方案</h3>
                {settlement_plan.map((debt: any, index: number) => (
                    <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 transition-all animate-fade-in relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="font-bold text-gray-900 text-lg min-w-[3rem] text-center">{debt.from}</div>
                                <div className="flex-1 flex flex-col items-center px-2">
                                    <div className="text-xs text-gray-400 mb-1 font-medium">支付給</div>
                                    <div className="w-full h-0.5 bg-gray-100 relative">
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                                <div className="font-bold text-gray-900 text-lg min-w-[3rem] text-center">{debt.to}</div>
                            </div>
                            <div className="ml-6 font-bold text-brand-600 text-xl tracking-tight">
                                ${debt.amount.toLocaleString()}
                            </div>
                        </div>

                        {/* Bank Info Section */}
                        {debt.bank_account && (
                            <div className="pt-3 border-t border-gray-50 flex items-center justify-between bg-gray-50/50 -mx-5 -mb-5 px-5 py-3 mt-1">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Wallet className="w-4 h-4 text-brand-500" />
                                    <span>收款帳號:</span>
                                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-gray-200">
                                        {debt.bank_code && <>代碼：{debt.bank_code} &nbsp; </>}帳號：{debt.bank_account}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleCopy(`${debt.bank_account}`.trim(), index)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copiedIndex === index
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-white border border-gray-200 text-gray-500 hover:text-brand-600 hover:border-brand-200'
                                        }`}
                                >
                                    {copiedIndex === index ? (
                                        <>
                                            <Check className="w-3.5 h-3.5" />
                                            已複製
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5" />
                                            複製
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
