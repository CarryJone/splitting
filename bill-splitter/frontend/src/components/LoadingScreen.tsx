import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center max-w-sm w-full text-center">
                <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
                    <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">正在連線至資料庫</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                    系統正在喚醒安全資料庫，這可能需要幾秒鐘的時間，請耐心等候...
                </p>
                <div className="mt-6 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full animate-progress origin-left"></div>
                </div>
            </div>
        </div>
    );
}
