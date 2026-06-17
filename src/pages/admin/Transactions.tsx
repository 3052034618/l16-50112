import { useState } from 'react';
import { Receipt, Search, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useAppStore } from '../../store/useAppStore';
import { formatDateTime, formatMoney } from '../../utils';
import type { TransactionType } from '../../types';

export default function AdminTransactions() {
  const { transactions, users, orders } = useAppStore();
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions
    .filter((t) => {
      if (typeFilter === 'all') return true;
      return t.type === typeFilter;
    })
    .filter((t) => {
      if (!searchQuery) return true;
      const user = users.find((u) => u.id === t.userId);
      return (
        t.id.includes(searchQuery) ||
        user?.username.includes(searchQuery) ||
        t.description.includes(searchQuery)
      );
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalIncome = transactions
    .filter((t) => t.type === 'payment' && t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRecharge = transactions
    .filter((t) => t.type === 'recharge' && t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  const typeLabels: Record<string, string> = {
    recharge: '充值',
    withdraw: '提现',
    payment: '支付',
    income: '收入',
    refund: '退款',
  };

  const getTypeIcon = (type: string) => {
    if (['recharge', 'income', 'refund'].includes(type)) {
      return <ArrowDownLeft className="w-4 h-4" />;
    }
    return <ArrowUpRight className="w-4 h-4" />;
  };

  const getTypeColor = (type: string) => {
    if (['recharge', 'income', 'refund'].includes(type)) {
      return 'text-success bg-green-50';
    }
    return 'text-danger bg-red-50';
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">交易流水</h1>
        <p className="text-gray-500 mt-1">查看所有交易记录</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <ArrowDownLeft className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">总充值金额</p>
              <p className="text-2xl font-bold text-gray-900">{formatMoney(totalRecharge)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <Receipt className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">总交易笔数</p>
              <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">总支付金额</p>
              <p className="text-2xl font-bold text-gray-900">{formatMoney(totalIncome)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-1">
              {(['all', 'recharge', 'payment', 'income', 'refund'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    typeFilter === type
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {type === 'all' ? '全部' : typeLabels[type]}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索订单号/用户..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary-500 focus:bg-white focus:outline-none transition-colors w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  交易单号
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  说明
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  时间
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((txn) => {
                  const user = users.find((u) => u.id === txn.userId);
                  const isIncome = ['recharge', 'income', 'refund'].includes(txn.type);
                  return (
                    <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-900">{txn.id}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <img
                            src={user?.avatar}
                            alt=""
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="text-sm text-gray-900">{user?.username}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${getTypeColor(
                            txn.type
                          )}`}
                        >
                          {getTypeIcon(txn.type)}
                          {typeLabels[txn.type]}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-semibold ${
                            isIncome ? 'text-success' : 'text-danger'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatMoney(txn.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            txn.status === 'success'
                              ? 'bg-green-100 text-green-800'
                              : txn.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {txn.status === 'success'
                            ? '成功'
                            : txn.status === 'failed'
                            ? '失败'
                            : '处理中'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {txn.description}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(txn.createdAt)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-gray-500">
                    <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    暂无交易记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
