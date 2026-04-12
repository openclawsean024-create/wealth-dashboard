interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: string;
}

interface BankCardProps {
  bank: {
    name: string;
    accountType: string;
    balance: number;
    currency: string;
    syncTime: string;
    transactions: Transaction[];
  };
  formatCurrency: (value: number) => string;
}

export default function BankCard({ bank, formatCurrency }: BankCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">銀行帳戶</p>
            <p className="mt-1 text-lg font-semibold text-white">{bank.name}</p>
            <p className="text-sm text-slate-300">{bank.accountType}</p>
          </div>
          <span className="text-3xl">🏦</span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">帳戶餘額</p>
          <p className="mt-2 text-3xl font-bold text-white">{formatCurrency(bank.balance)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-[0.2em]">Link</p>
            <p className="mt-1 font-medium text-emerald-300">已連結</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 text-xs uppercase tracking-[0.2em]">Sync</p>
            <p className="mt-1 font-medium text-white">{bank.syncTime}</p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-3">最近交易</p>
          <div className="space-y-3">
            {bank.transactions.slice(0, 3).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-slate-100">{tx.description}</p>
                  <p className="text-slate-500 text-xs">{tx.date}</p>
                </div>
                <span className={`font-medium ${tx.amount >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {tx.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
