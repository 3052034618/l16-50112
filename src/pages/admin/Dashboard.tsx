import {
  Users,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useAppStore } from '../../store/useAppStore';
import { formatMoney } from '../../utils';

export default function AdminDashboard() {
  const { users, orders, runnerProfiles, transactions, disputes } = useAppStore();

  const totalUsers = users.filter((u) => u.role !== 'admin').length;
  const totalRunners = runnerProfiles.filter((p) => p.status === 'approved').length;
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const pendingRunners = runnerProfiles.filter((p) => p.status === 'pending').length;
  const pendingDisputes = disputes.filter((d) => d.status === 'pending').length;

  const totalTransactionAmount = transactions
    .filter((t) => t.status === 'success' && t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const statCards = [
    {
      label: '总用户数',
      value: totalUsers,
      icon: <Users className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      label: '认证跑手',
      value: totalRunners,
      icon: <Star className="w-6 h-6" />,
      color: 'from-secondary-500 to-secondary-600',
      bgColor: 'bg-secondary-50',
      iconColor: 'text-secondary-500',
    },
    {
      label: '总订单数',
      value: totalOrders,
      icon: <Package className="w-6 h-6" />,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary-500',
    },
    {
      label: '交易总额',
      value: formatMoney(totalTransactionAmount),
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-500',
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">数据概览</h1>
        <p className="text-gray-500 mt-1">欢迎回来，管理员</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                <div className={card.iconColor}>{card.icon}</div>
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+12%</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">待处理事项</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">待审核跑手</p>
                  <p className="text-sm text-gray-500">需要您的审核</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-warning">{pendingRunners}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-danger rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">待处理争议</p>
                  <p className="text-sm text-gray-500">需要您的处理</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-danger">{pendingDisputes}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">待接订单</p>
                  <p className="text-sm text-gray-500">等待跑手接单</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-500">{pendingOrders}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">订单状态分布</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatusCard
              label="待接单"
              value={pendingOrders}
              color="bg-yellow-500"
              bgColor="bg-yellow-50"
            />
            <StatusCard
              label="进行中"
              value={orders.filter((o) => ['accepted', 'picked', 'delivering'].includes(o.status)).length}
              color="bg-blue-500"
              bgColor="bg-blue-50"
            />
            <StatusCard
              label="已完成"
              value={completedOrders}
              color="bg-green-500"
              bgColor="bg-green-50"
            />
            <StatusCard
              label="已取消"
              value={orders.filter((o) => o.status === 'cancelled').length}
              color="bg-gray-400"
              bgColor="bg-gray-50"
            />
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">完成率</h4>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                style={{
                  width: totalOrders > 0 ? `${(completedOrders / totalOrders) * 100}%` : '0%',
                }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              完成率 {totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">最新订单</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  订单号
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  发布者
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  报酬
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  发布时间
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order) => {
                const publisher = users.find((u) => u.id === order.publisherId);
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm text-gray-900">{order.id}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {order.type === 'express' ? '代取快递' : '跑腿代买'}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <img
                          src={publisher?.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-sm text-gray-900">{publisher?.username}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-primary-600">
                        {formatMoney(order.reward)}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString('zh-CN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatusCard({
  label,
  value,
  color,
  bgColor,
}: {
  label: string;
  value: number;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-xl p-4`}>
      <div className={`w-3 h-3 ${color} rounded-full mb-2`} />
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}

function getStatusText(status: string): string {
  const map: Record<string, string> = {
    pending: '待接单',
    accepted: '已接单',
    picked: '已取货',
    delivering: '配送中',
    completed: '已完成',
    cancelled: '已取消',
    disputed: '争议中',
  };
  return map[status] || status;
}

function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    picked: 'bg-cyan-100 text-cyan-800',
    delivering: 'bg-primary-100 text-primary-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-600',
    disputed: 'bg-red-100 text-red-800',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
}
