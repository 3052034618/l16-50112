import { useState } from 'react';
import { UserCheck, X, Check, Clock, Search } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { useAppStore } from '../../store/useAppStore';
import { formatDateTime } from '../../utils';
import type { RunnerStatus } from '../../types';

export default function AdminRunners() {
  const { runnerProfiles, users, approveRunner, rejectRunner } = useAppStore();
  const [activeTab, setActiveTab] = useState<RunnerStatus | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filteredProfiles = runnerProfiles
    .filter((p) => {
      if (activeTab === 'all') return true;
      return p.status === activeTab;
    })
    .filter((p) => {
      if (!searchQuery) return true;
      const user = users.find((u) => u.id === p.userId);
      return (
        p.realName.includes(searchQuery) ||
        p.studentId.includes(searchQuery) ||
        user?.username.includes(searchQuery)
      );
    });

  const handleApprove = (profileId: string) => {
    approveRunner(profileId);
  };

  const handleReject = () => {
    if (!selectedProfile) return;
    rejectRunner(selectedProfile, rejectReason);
    setShowRejectModal(false);
    setSelectedProfile(null);
    setRejectReason('');
  };

  const openRejectModal = (profileId: string) => {
    setSelectedProfile(profileId);
    setShowRejectModal(true);
  };

  const tabs = [
    { key: 'pending', label: '待审核', count: runnerProfiles.filter((p) => p.status === 'pending').length },
    { key: 'approved', label: '已通过', count: runnerProfiles.filter((p) => p.status === 'approved').length },
    { key: 'rejected', label: '已驳回', count: runnerProfiles.filter((p) => p.status === 'rejected').length },
    { key: 'all', label: '全部', count: runnerProfiles.length },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">跑手审核</h1>
        <p className="text-gray-500 mt-1">审核跑手资格申请</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as RunnerStatus | 'all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                      activeTab === tab.key
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索姓名/学号..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-primary-500 focus:bg-white focus:outline-none transition-colors w-60"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户信息
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  真实姓名
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  学号
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  申请时间
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProfiles.length > 0 ? (
                filteredProfiles.map((profile) => {
                  const user = users.find((u) => u.id === profile.userId);
                  return (
                    <tr key={profile.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={user?.avatar}
                            alt=""
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{user?.username}</p>
                            <p className="text-sm text-gray-500">{user?.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                        {profile.realName}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                        {profile.studentId}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(profile.applyTime)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <StatusBadge status={profile.status} />
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {profile.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(profile.id)}
                              className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                              title="通过"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openRejectModal(profile.id)}
                              className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                              title="驳回"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        {profile.status === 'rejected' && profile.auditRemark && (
                          <span className="text-sm text-gray-500" title={profile.auditRemark}>
                            驳回原因: {profile.auditRemark}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-gray-500">
                    <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="驳回申请"
      >
        <p className="text-gray-600 mb-4">请填写驳回原因</p>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="请输入驳回原因..."
          rows={3}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-colors resize-none"
        />
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            fullWidth
            onClick={() => setShowRejectModal(false)}
          >
            取消
          </Button>
          <Button variant="danger" fullWidth onClick={handleReject}>
            确认驳回
          </Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const labels: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
  };

  const icons: Record<string, React.ReactNode> = {
    pending: <Clock className="w-3.5 h-3.5" />,
    approved: <Check className="w-3.5 h-3.5" />,
    rejected: <X className="w-3.5 h-3.5" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${styles[status]}`}
    >
      {icons[status]}
      {labels[status]}
    </span>
  );
}
