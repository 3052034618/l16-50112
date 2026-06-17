import { useState } from 'react';
import { Search, Filter, ArrowUpDown, Package, ShoppingBag, Zap } from 'lucide-react';
import OrderCard from '../components/OrderCard';
import { useAppStore } from '../store/useAppStore';
import type { OrderType } from '../types';

export default function Home() {
  const { orders } = useAppStore();
  const [activeTab, setActiveTab] = useState<'all' | OrderType>('all');
  const [sortBy, setSortBy] = useState<'time' | 'price' | 'distance'>('time');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders
    .filter((order) => order.status === 'pending')
    .filter((order) => {
      if (activeTab === 'all') return true;
      return order.type === activeTab;
    })
    .filter((order) => {
      if (!searchQuery) return true;
      return (
        order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.reward - a.reward;
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'time':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const expressCount = orders.filter(
    (o) => o.status === 'pending' && o.type === 'express'
  ).length;
  const errandCount = orders.filter(
    (o) => o.status === 'pending' && o.type === 'errand'
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/30 pb-20 md:pb-8">
      <div className="bg-gradient-to-br from-primary-500 via-primary-400 to-secondary-500 text-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              校园跑腿，轻松搞定
            </h1>
            <p className="text-white/80 text-lg mb-6">
              代取快递、跑腿代买，附近跑手为你服务
            </p>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索任务、地点..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-full bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg">
            <StatCard icon={<Zap className="w-5 h-5" />} label="全部任务" value={pendingCount} />
            <StatCard icon={<Package className="w-5 h-5" />} label="代取快递" value={expressCount} />
            <StatCard icon={<ShoppingBag className="w-5 h-5" />} label="跑腿代买" value={errandCount} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 bg-white p-1 rounded-full shadow-sm">
            <TabButton
              active={activeTab === 'all'}
              onClick={() => setActiveTab('all')}
            >
              全部
            </TabButton>
            <TabButton
              active={activeTab === 'express'}
              onClick={() => setActiveTab('express')}
            >
              <Package className="w-4 h-4 mr-1" />
              代取快递
            </TabButton>
            <TabButton
              active={activeTab === 'errand'}
              onClick={() => setActiveTab('errand')}
            >
              <ShoppingBag className="w-4 h-4 mr-1" />
              跑腿代买
            </TabButton>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow text-gray-600">
              <Filter className="w-4 h-4" />
              筛选
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow text-gray-600 focus:outline-none cursor-pointer"
            >
              <option value="time">最新发布</option>
              <option value="price">报酬最高</option>
              <option value="distance">距离最近</option>
            </select>
          </div>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order, index) => (
              <div
                key={order.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <OrderCard order={order} showPublisher />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">暂无相关任务</h3>
            <p className="text-gray-500">换个筛选条件试试吧</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-sm text-white/80">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2 rounded-full font-medium transition-all ${
        active
          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
}
