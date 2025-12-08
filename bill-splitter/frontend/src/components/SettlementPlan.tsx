import React from 'react';
import { ArrowRight, CheckCircle2, Wallet } from 'lucide-react';

interface Props {
    data: any;
}

export default function SettlementPlan({ data }: Props) {
    if (!data) return null;

    const { total_expense, settlement_plan } = data;

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
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl shadow-gray-200">
                <div className="flex items-center gap-3 mb-2 opacity-80">
                    <Wallet className="w-5 h-5" />
                    <span className="text-sm font-medium tracking-wide">總支出</span>
                </div>
                <div className="text-4xl font-bold tracking-tight">
                    ${total_expense.toLocaleString()}
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-2">建議轉帳方案</h3>
                {settlement_plan.map((debt: any, index: number) => (
                    <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
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
                ))}
            </div>
        </div>
    );
}
