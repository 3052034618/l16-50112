import { useState, useMemo } from 'react';
import {
  Package,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  Zap,
  Shield,
  UserCheck,
  Award,
  Sparkles,
  Crown,
  Target,
  Rocket,
} from 'lucide-react';
import OrderCard from '../components/OrderCard';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { useAppStore } from '../store/useAppStore';
import { formatMoney } from '../utils';
import type { Order } from '../types';

export default function RunnerCenter() {
  const { currentUser, orders, users, getRunnerProfile, getReviewsForUser, applyRunner, runnerProfiles } = useAppStore();
  const [activeTab, setActiveTab] = useState<'available' | 'ongoing' | 'history'>('available');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    realName: '',
    studentId: '',
    idCard: '',
  });

  const runnerProfile = currentUser ? getRunnerProfile(currentUser.id) : null;
  const isRunner = currentUser?.role === 'runner' && runnerProfile?.status === 'approved';
  const isPending = runnerProfile?.status === 'pending';
  const isNewRunner = runnerProfile?.completedOrders && runnerProfile.completedOrders < 5;

  const recommendedOrders = useMemo(() => {
    const pendingOrders = orders.filter((o) => o.status === 'pending');
    if (!runnerProfile || !isRunner) {
      return pendingOrders.map(order => ({ order, score: 0, reasons: [] as string[] }));
    }

    const rating = runnerProfile.rating || 0;
    const isNew = runnerProfile.completedOrders < 5;

    return pendingOrders
      .map((order) => {
        let score = 0;
        const reasons: string[] = [];

        const distance = order.distance || 1;
        const distanceScore = Math.max(0, (3 - distance) / 3) * 40;
        score += distanceScore;
        if (distance < 0.8) {
          reasons.push('距离近');
        }

        const rewardScore = Math.min(40, (order.reward / 15) * 40);
        score += rewardScore;
        if (order.reward >= 8) {
          reasons.push('高报酬');
        }

        if (rating >= 4.5) {
          score += 20;
          if (order.reward >= 10) {
            reasons.push('优质跑手专属');
          }
        } else if (rating >= 4.0) {
          score += 10;
        }

        if (isNew && order.reward >= 5 && order.reward <= 8) {
          score += 15;
          reasons.push('新人友好');
        }

        if (order.type === 'express') {
          score += 5;
        }

        return {
          order,
          score: Math.round(score),
          reasons,
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [orders, runnerProfile, isRunner]);

  const availableOrders = orders.filter((o) => o.status === 'pending');
  const ongoingOrders = orders.filter(
    (o) => o.runnerId === currentUser?.id && ['accepted', 'picked', 'delivering'].includes(o.status)
  );
  const historyOrders = orders.filter(
    (o) => o.runnerId === currentUser?.id && ['completed', 'cancelled'].includes(o.status)
  );

  const completedCount = orders.filter(
    (o) => o.runnerId === currentUser?.id && o.status === 'completed'
  ).length;

  const totalIncome = orders
    .filter((o) => o.runnerId === currentUser?.id && o.status === 'completed')
    .reduce((sum, o) => sum + o.reward, 0);

  const reviews = currentUser ? getReviewsForUser(currentUser.id) : [];

  const handleApply = () => {
    if (!currentUser) return;
    if (!applyForm.realName || !applyForm.studentId || !applyForm.idCard) {
      alert('请填写完整信息');
      return;
    }
    applyRunner({
      userId: currentUser.id,
      ...applyForm,
    });
    setShowApplyModal(false);
    alert('申请已提交，请等待管理员审核');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">请先登录</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="bg-gradient-to-br from-secondary-500 to-primary-500 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={currentUser.avatar}
              alt={currentUser.username}
              className="w-16 h-16 rounded-full border-4 border-white/30"
            />
            <div>
              <h1 className="text-xl font-bold">{currentUser.username}</h1>
              <div className="flex items-center gap-2 mt-1">
                {isRunner ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full text-sm">
                    <Award className="w-4 h-4" />
                    认证跑手
                  </span>
                ) : isPending ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-warning/30 text-warning rounded-full text-sm">
                    <Clock className="w-4 h-4" />
                    审核中
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full text-sm">
                    <UserCheck className="w-4 h-4" />
                    普通用户
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={<Package className="w-5 h-5" />} label="完成订单" value={completedCount} />
            <StatCard icon={<TrendingUp className="w-5 h-5" />} label="累计收入" value={`¥${totalIncome}`} />
            <StatCard
              icon={<Star className="w-5 h-5" />}
              label="信誉评分"
              value={runnerProfile?.rating.toFixed(1) || '0.0'}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {!isRunner && !isPending && (
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-5 mb-6 border border-primary-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">成为跑手，赚取零花钱</h3>
                <p className="text-sm text-gray-600 mb-3">
                  利用课余时间接单，轻松赚取生活费。实名认证后即可开始接单。
                </p>
                <Button size="sm" onClick={() => setShowApplyModal(true)}>
                  立即申请
                </Button>
              </div>
            </div>
          </div>
        )}

        {isPending && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-warning rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">审核进行中</h3>
                <p className="text-sm text-gray-600">
                  您的跑手申请正在审核中，管理员会在24小时内处理。请耐心等待。
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-1 bg-white p-1 rounded-full shadow-sm mb-6 inline-flex">
          <TabButton
            active={activeTab === 'available'}
            onClick={() => setActiveTab('available')}
          >
            可接订单
          </TabButton>
          <TabButton
            active={activeTab === 'ongoing'}
            onClick={() => setActiveTab('ongoing')}
          >
            进行中
          </TabButton>
          <TabButton
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
          >
            历史订单
          </TabButton>
        </div>

        {activeTab === 'available' && (
          <div className="space-y-4">
            {isRunner ? (
              recommendedOrders.length > 0 ? (
                <>
                  {isNewRunner && (
                    <div className="bg-gradient-to-r from-secondary-50 to-primary-50 rounded-xl p-4 border border-secondary-200 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Rocket className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">新人跑手专属</p>
                          <p className="text-sm text-gray-600">
                            为你推荐了适合新手的简单订单，完成5单后可解锁更多高报酬订单
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {runnerProfile && runnerProfile.rating >= 4.5 && recommendedOrders.length > 0 && (
                    <div className="bg-gradient-to-r from-warning/20 to-primary-50 rounded-xl p-4 border border-warning/30 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-warning to-warning/70 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Crown className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">优质跑手特权</p>
                          <p className="text-sm text-gray-600">
                            你的信誉评分 {runnerProfile.rating.toFixed(1)} 分，优先展示高报酬订单
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {recommendedOrders.map((item, index) => (
                    <div
                      key={item.order.id}
                      className="relative animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {item.reasons.length > 0 && (
                        <div className="absolute -top-2 left-4 z-10 flex gap-1.5">
                          {item.reasons.slice(0, 2).map((reason, i) => (
                            <span
                              key={reason}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full shadow-sm ${
                                i === 0
                                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                                  : 'bg-white text-gray-600 border border-gray-200'
                              }`}
                            >
                              {i === 0 && <Sparkles className="w-3 h-3" />}
                              {reason}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="pt-2">
                        <OrderCard order={item.order} showPublisher />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <EmptyState icon={<Package className="w-12 h-12" />} text="暂无可接订单" />
              )
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  成为跑手后即可接单
                </h3>
                <p className="text-gray-500 mb-4">申请成为跑手，开始赚取零花钱</p>
                <Button onClick={() => setShowApplyModal(true)}>申请成为跑手</Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ongoing' && (
          <div className="space-y-4">
            {ongoingOrders.length > 0 ? (
              ongoingOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <EmptyState icon={<Clock className="w-12 h-12" />} text="暂无进行中订单" />
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <div className="bg-white rounded-2xl shadow-card p-5 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">数据统计</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-50 rounded-xl p-4">
                  <p className="text-sm text-primary-600 mb-1">总完成订单</p>
                  <p className="text-2xl font-bold text-primary-700">{completedCount}</p>
                </div>
                <div className="bg-secondary-50 rounded-xl p-4">
                  <p className="text-sm text-secondary-600 mb-1">累计收入</p>
                  <p className="text-2xl font-bold text-secondary-700">
                    {formatMoney(totalIncome)}
                  </p>
                </div>
              </div>
            </div>

            {historyOrders.length > 0 ? (
              <div className="space-y-4">
                {historyOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <EmptyState icon={<CheckCircle className="w-12 h-12" />} text="暂无历史订单" />
            )}
          </div>
        )}

        {isRunner && reviews.length > 0 && (
          <div className="mt-8">
            <h3 className="font-semibold text-gray-900 mb-4">收到的评价</h3>
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl p-4 shadow-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={users.find((u) => u.id === review.fromUserId)?.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="font-medium text-gray-900">
                        {users.find((u) => u.id === review.fromUserId)?.username}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-warning fill-warning"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{review.comment}</p>
                  {review.tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {review.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title="申请成为跑手"
        size="lg"
      >
        <p className="text-gray-600 mb-6">
          填写真实信息，管理员审核通过后即可开始接单。
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              真实姓名
            </label>
            <input
              type="text"
              value={applyForm.realName}
              onChange={(e) =>
                setApplyForm({ ...applyForm, realName: e.target.value })
              }
              placeholder="请输入真实姓名"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              学号
            </label>
            <input
              type="text"
              value={applyForm.studentId}
              onChange={(e) =>
                setApplyForm({ ...applyForm, studentId: e.target.value })
              }
              placeholder="请输入学号"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              身份证号
            </label>
            <input
              type="text"
              value={applyForm.idCard}
              onChange={(e) =>
                setApplyForm({ ...applyForm, idCard: e.target.value })
              }
              placeholder="请输入身份证号"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6">
          <p className="text-sm text-yellow-700">
            <span className="font-medium">温馨提示：</span>
            请确保填写的信息真实有效，虚假信息将被驳回。
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" fullWidth onClick={() => setShowApplyModal(false)}>
            取消
          </Button>
          <Button fullWidth onClick={handleApply}>
            提交申请
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-xs text-white/80">{label}</span>
      </div>
      <div className="text-xl font-bold">{value}</div>
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
      className={`px-5 py-2 rounded-full font-medium transition-all ${
        active
          ? 'bg-gradient-to-r from-secondary-500 to-primary-500 text-white shadow-md'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl">
      <div className="text-gray-300 mx-auto mb-4 flex justify-center">{icon}</div>
      <p className="text-gray-500">{text}</p>
    </div>
  );
}
