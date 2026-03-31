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
    transactions: {
      id: string;
      description: string;
      amount: number;
      date: string;
      type: string;
    }[];
  };
  formatCurrency: (value: number, currency?: string) => string;
}

export default function BankCard({ bank, formatCurrency }: BankCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-xs uppercase tracking-wide">銀行帳戶</p>
            <p className="text-white font-semibold mt-1">{bank.name}</p>
            <p className="text-blue-200 text-xs mt-0.5">{bank.accountType}</p>
          </div>
          <span className="text-3xl">🏦</span>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide">帳戶餘額</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {formatCurrency(bank.balance, bank.currency)}
          </p>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">
            📋 最近交易
          </p>
          <div className="space-y-2">
            {bank.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-gray-700">{tx.description}</p>
                  <p className="text-gray-400 text-xs">{tx.date}</p>
                </div>
                <span className={tx.type === 'income' ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                  {tx.type === 'income' ? '+' : ''}
                  {formatCurrency(tx.amount, bank.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
