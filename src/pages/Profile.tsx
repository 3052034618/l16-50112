import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Wallet,
  Package,
  Star,
  Settings,
  ChevronRight,
  Plus,
  Minus,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  ShoppingBag,
} from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { useAppStore } from '../store/useAppStore';
import { formatMoney, formatDateTime, getOrderStatusText } from '../utils';
import type { OrderStatus } from '../types';

const getStatusColor = (status: OrderStatus) => {
  const colors: Record<OrderStatus, string> = {
    pending: 'bg-gray-100 text-gray-600',
    accepted: 'bg-blue-100 text-blue-600',
    picked: 'bg-purple-100 text-purple-600',
    delivering: 'bg-secondary-100 text-secondary-600',
    completed: 'bg-green-100 text-green-600',
    cancelled: 'bg-red-100 text-red-600',
    disputed: 'bg-yellow-100 text-yellow-600',
  };
  return colors[status];
};

const getStatusText = (status: OrderStatus) => {
  return getOrderStatusText(status);
};

const getOrderProgress = (status: OrderStatus) => {
  const steps = [
    { label: '已发布', key: 'pending' },
    { label: '已接单', key: 'accepted' },
    { label: '已取货', key: 'picked' },
    { label: '配送中', key: 'delivering' },
    { label: '已完成', key: 'completed' },
  ];

  const statusOrder: OrderStatus[] = ['pending', 'accepted', 'picked', 'delivering', 'completed'];
  const currentIndex = statusOrder.indexOf(status);

  return steps.map((step, i) => ({
    ...step,
    completed: currentIndex > i,
    active: currentIndex === i,
  }));
};

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, getOrdersByPublisher, getTransactionsForUser, addTransaction } = useAppStore();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');

  const myOrders = currentUser ? getOrdersByPublisher(currentUser.id) : [];
  const transactions = currentUser ? getTransactionsForUser(currentUser.id) : [];

  const handleRecharge = () => {
    if (!currentUser || !rechargeAmount) return;
    const amount = Number(rechargeAmount);
    if (amount <= 0) {
      alert('请输入正确的金额');
      return;
    }

    addTransaction({
      userId: currentUser.id,
      type: 'recharge',
      amount,
      status: 'success',
      description: '微信充值',
    });

    setRechargeAmount('');
    setShowWalletModal(false);
    alert('充值成功！');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">请先登录</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: <Package className="w-5 h-5" />, label: '我的发布', path: '/profile/orders', color: 'text-primary-500 bg-primary-50' },
    { icon: <Star className="w-5 h-5" />, label: '评价管理', path: '/profile/reviews', color: 'text-warning bg-yellow-50' },
    { icon: <Settings className="w-5 h-5" />, label: '设置', path: '/profile/settings', color: 'text-gray-500 bg-gray-100' },
  ];

  const quickAmounts = [10, 20, 50, 100];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="bg-gradient-to-br from-primary-500 via-primary-400 to-secondary-500 text-white pb-20">
        <div className="container mx-auto px-4 pt-8">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={currentUser.avatar}
              alt={currentUser.username}
              className="w-20 h-20 rounded-full border-4 border-white/30 shadow-lg"
            />
            <div>
              <h1 className="text-2xl font-bold">{currentUser.username}</h1>
              <p className="text-white/80">学号: {currentUser.studentId}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {currentUser.role === 'admin' ? '管理员' : currentUser.role === 'runner' ? '认证跑手' : '普通用户'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-14">
        <div
          className="bg-white rounded-2xl shadow-card p-5 mb-6 cursor-pointer hover:shadow-card-hover transition-shadow"
          onClick={() => setShowWalletModal(true)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">我的钱包</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatMoney(currentUser.balance)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 px-4 py-2 bg-primary-50 text-primary-600 rounded-full font-medium text-sm hover:bg-primary-100 transition-colors">
                <Plus className="w-4 h-4" />
                充值
              </button>
              <button className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-full font-medium text-sm hover:bg-gray-200 transition-colors">
                <Minus className="w-4 h-4" />
                提现
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">我的发布</h3>
            <Link
              to="/profile/orders"
              className="text-sm text-primary-500 hover:text-primary-600"
            >
              查看全部
            </Link>
          </div>
          <div className="grid grid-cols-4 divide-x divide-gray-100">
            <OrderStat label="全部" value={myOrders.length} />
            <OrderStat
              label="待接单"
              value={myOrders.filter((o) => o.status === 'pending').length}
            />
            <OrderStat
              label="进行中"
              value={
                myOrders.filter((o) =>
                  ['accepted', 'picked', 'delivering'].includes(o.status)
                ).length
              }
            />
            <OrderStat
              label="已完成"
              value={myOrders.filter((o) => o.status === 'completed').length}
            />
          </div>

          {myOrders.length > 0 && (
            <div className="border-t border-gray-100">
              {myOrders.slice(0, 3).map((order) => {
                const isExpress = order.type === 'express';
                const progressSteps = getOrderProgress(order.status);
                return (
                  <Link
                    key={order.id}
                    to={`/order/${order.id}`}
                    className="block p-4 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isExpress
                              ? 'bg-primary-100 text-primary-600'
                              : 'bg-secondary-100 text-secondary-600'
                          }`}
                        >
                          {isExpress ? (
                            <Package className="w-4 h-4" />
                          ) : (
                            <ShoppingBag className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm line-clamp-1">
                            {order.title}
                          </p>
                          {isExpress && (order.expressNo || order.expressSite) && (
                            <div className="flex items-center gap-2 mt-1">
                              {order.expressSite && (
                                <span className="inline-flex items-center px-1.5 py-0.5 bg-primary-50 text-primary-600 rounded text-xs font-medium">
                                  {order.expressSite}
                                </span>
                              )}
                              {order.expressNo && (
                                <span className="text-xs text-gray-500 font-mono">
                                  单号：{order.expressNo}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary-500">
                          {formatMoney(order.reward)}
                        </p>
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {progressSteps.map((step, i) => (
                        <div key={i} className="flex-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              step.active
                                ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                                : step.completed
                                ? 'bg-success'
                                : 'bg-gray-200'
                            } ${step.active ? 'animate-pulse' : ''}`}
                          />
                          <p
                            className={`text-xs mt-1 ${
                              step.completed || step.active
                                ? 'text-gray-600'
                                : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-6">
          {menuItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                index < menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                {item.icon}
              </div>
              <span className="flex-1 font-medium text-gray-900">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          ))}
        </div>

        {transactions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">最近交易</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {transactions.slice(0, 5).map((txn) => (
                <div key={txn.id} className="flex items-center gap-3 p-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      txn.type === 'recharge' || txn.type === 'income'
                        ? 'bg-green-50'
                        : 'bg-red-50'
                    }`}
                  >
                    {txn.type === 'recharge' || txn.type === 'income' ? (
                      <ArrowDownLeft className="w-5 h-5 text-success" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-danger" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{txn.description}</p>
                    <p className="text-sm text-gray-500">{formatDateTime(txn.createdAt)}</p>
                  </div>
                  <p
                    className={`font-semibold ${
                      txn.type === 'recharge' || txn.type === 'income' || txn.type === 'refund'
                        ? 'text-success'
                        : 'text-danger'
                    }`}
                  >
                    {txn.type === 'recharge' || txn.type === 'income' || txn.type === 'refund'
                      ? '+'
                      : '-'}
                    {formatMoney(txn.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        title="我的钱包"
        size="lg"
      >
        <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl p-6 text-white mb-6">
          <p className="text-white/80 mb-1">账户余额</p>
          <p className="text-3xl font-bold">{formatMoney(currentUser.balance)}</p>
        </div>

        <div className="mb-6">
          <p className="font-medium text-gray-900 mb-3">充值金额</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">
              ¥
            </span>
            <input
              type="number"
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
              placeholder="请输入金额"
              className="w-full pl-10 pr-4 py-3 text-xl font-bold text-right bg-gray-50 border border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-colors"
            />
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => setRechargeAmount(String(amount))}
                className={`py-2 rounded-lg font-medium transition-colors ${
                  Number(rechargeAmount) === amount
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                ¥{amount}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="font-medium text-gray-900 mb-3">支付方式</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border-2 border-green-500">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">微</span>
              </div>
              <span className="font-medium text-gray-900">微信支付</span>
              <div className="ml-auto">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border-2 border-transparent hover:border-gray-200 transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">支</span>
              </div>
              <span className="font-medium text-gray-600">支付宝</span>
            </div>
          </div>
        </div>

        <Button fullWidth size="lg" onClick={handleRecharge}>
          确认充值
        </Button>
      </Modal>
    </div>
  );
}

function OrderStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="py-4 text-center">
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
