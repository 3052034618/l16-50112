import { useState } from 'react';
import { AlertTriangle, Search, Check, X } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { useAppStore } from '../../store/useAppStore';
import { formatDateTime, formatMoney } from '../../utils';
import type { DisputeStatus } from '../../types';

export default function AdminDisputes() {
  const { disputes, orders, users, resolveDispute } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | 'all'>('all');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
  const [result, setResult] = useState('');
  const [refund, setRefund] = useState(false);

  const filteredDisputes = disputes
    .filter((d) => {
      if (statusFilter === 'all') return true;
      return d.status === statusFilter;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleResolve = () => {
    if (!selectedDispute || !result) return;
    resolveDispute(selectedDispute, result, refund);
    setShowResolveModal(false);
    setSelectedDispute(null);
    setResult('');
    setRefund(false);
  };

  const openResolveModal = (disputeId: string) => {
    setSelectedDispute(disputeId);
    setShowResolveModal(true);
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: '待处理',
      resolved: '已解决',
      rejected: '已驳回',
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      rejected: 'bg-gray-100 text-gray-600',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  };

  const tabs = [
    { key: 'pending', label: '待处理', count: disputes.filter((d) => d.status === 'pending').length },
    { key: 'resolved', label: '已解决', count: disputes.filter((d) => d.status === 'resolved').length },
    { key: 'rejected', label: '已驳回', count: disputes.filter((d) => d.status === 'rejected').length },
    { key: 'all', label: '全部', count: disputes.length },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">争议处理</h1>
        <p className="text-gray-500 mt-1">处理用户提交的争议订单</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key as DisputeStatus | 'all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    statusFilter === tab.key
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                      statusFilter === tab.key
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  争议编号
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  订单
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  申诉人
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  争议金额
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  提交时间
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDisputes.length > 0 ? (
                filteredDisputes.map((dispute) => {
                  const order = orders.find((o) => o.id === dispute.orderId);
                  const complainant = users.find((u) => u.id === dispute.complainantId);
                  return (
                    <tr key={dispute.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-900">{dispute.id}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order?.title}</p>
                          <p className="text-xs text-gray-500">{order?.id}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <img
                            src={complainant?.avatar}
                            alt=""
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="text-sm text-gray-900">{complainant?.username}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                        {formatMoney(order?.reward || 0)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            dispute.status
                          )}`}
                        >
                          {getStatusLabel(dispute.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(dispute.createdAt)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {dispute.status === 'pending' && (
                          <button
                            onClick={() => openResolveModal(dispute.id)}
                            className="px-3 py-1.5 bg-primary-100 hover:bg-primary-200 text-primary-700 text-sm font-medium rounded-lg transition-colors"
                          >
                            处理
                          </button>
                        )}
                        {dispute.status === 'resolved' && dispute.result && (
                          <span className="text-sm text-gray-500" title={dispute.result}>
                            {dispute.result.slice(0, 10)}...
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-gray-500">
                    <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    暂无争议订单
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title="处理争议"
        size="lg"
      >
        <div className="mb-4">
          <p className="font-medium text-gray-900 mb-2">争议原因</p>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-gray-600">
              {disputes.find((d) => d.id === selectedDispute)?.reason}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            处理结果
          </label>
          <textarea
            value={result}
            onChange={(e) => setResult(e.target.value)}
            placeholder="请输入处理结果..."
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-colors resize-none"
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={refund}
              onChange={(e) => setRefund(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-gray-700">是否退款给用户</span>
          </label>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            fullWidth
            onClick={() => setShowResolveModal(false)}
          >
            取消
          </Button>
          <Button fullWidth onClick={handleResolve} disabled={!result}>
            确认处理
          </Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
