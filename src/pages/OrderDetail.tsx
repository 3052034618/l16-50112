import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Star,
  ChevronLeft,
  AlertTriangle,
} from 'lucide-react';
import Timeline from '../components/Timeline';
import Button from '../components/Button';
import Rating from '../components/Rating';
import Modal from '../components/Modal';
import NavigationCard from '../components/NavigationCard';
import { useAppStore } from '../store/useAppStore';
import { formatMoney, formatDateTime, getOrderStatusText, getOrderTypeText } from '../utils';
import type { OrderStatus } from '../types';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrderById, users, currentUser, acceptOrder, pickOrder, deliverOrder, completeOrder, getRunnerProfile, getReviewsForUser, addReview, createDispute } = useAppStore();
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [disputeReason, setDisputeReason] = useState('');

  const order = getOrderById(id || '');
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">订单不存在</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-primary-500 hover:text-primary-600"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const publisher = users.find((u) => u.id === order.publisherId);
  const runner = order.runnerId ? users.find((u) => u.id === order.runnerId) : null;
  const runnerProfile = order.runnerId ? getRunnerProfile(order.runnerId) : null;
  const runnerReviews = order.runnerId ? getReviewsForUser(order.runnerId) : [];

  const isPublisher = currentUser?.id === order.publisherId;
  const isRunner = currentUser?.id === order.runnerId;

  const reviewTags = ['速度快', '服务好', '态度佳', '负责任', '包装好', '沟通顺畅'];

  const handleAcceptOrder = () => {
    if (!currentUser) {
      alert('请先登录');
      return;
    }
    if (currentUser.role !== 'runner') {
      alert('请先申请成为跑手');
      return;
    }
    acceptOrder(order.id, currentUser.id);
  };

  const handlePickOrder = () => {
    pickOrder(order.id);
  };

  const handleDeliverOrder = () => {
    deliverOrder(order.id);
  };

  const handleCompleteOrder = () => {
    completeOrder(order.id);
    setShowReviewModal(true);
  };

  const handleSubmitReview = () => {
    if (!currentUser || !order.runnerId) return;
    
    addReview({
      orderId: order.id,
      fromUserId: currentUser.id,
      toUserId: order.runnerId,
      rating,
      comment: reviewComment,
      tags: selectedTags,
    });
    
    setShowReviewModal(false);
    alert('评价成功！');
  };

  const handleSubmitDispute = () => {
    if (!currentUser) return;
    
    createDispute({
      orderId: order.id,
      complainantId: currentUser.id,
      reason: disputeReason,
    });
    
    setShowDisputeModal(false);
    alert('争议已提交，管理员会尽快处理');
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const isExpress = order.type === 'express';

  const getActionButton = () => {
    if (order.status === 'pending' && !isPublisher) {
      return (
        <Button fullWidth size="lg" onClick={handleAcceptOrder}>
          立即接单
        </Button>
      );
    }
    if (order.status === 'accepted' && isRunner) {
      return (
        <Button fullWidth size="lg" onClick={handlePickOrder}>
          确认取货
        </Button>
      );
    }
    if (order.status === 'picked' && isRunner) {
      return (
        <Button fullWidth size="lg" onClick={handleDeliverOrder}>
          开始配送
        </Button>
      );
    }
    if (order.status === 'delivering' && isPublisher) {
      return (
        <Button fullWidth size="lg" onClick={handleCompleteOrder}>
          确认收货
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28 md:pb-8">
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-14">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 ml-2">订单详情</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                {isExpress ? (
                  <Package className="w-6 h-6" />
                ) : (
                  <ShoppingBag className="w-6 h-6" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">{order.title}</h2>
                <p className="text-white/80 text-sm">{getOrderTypeText(order.type)}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{formatMoney(order.reward)}</div>
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm mt-1">
                {getOrderStatusText(order.status)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">任务进度</h3>
          <Timeline
            status={order.status as OrderStatus}
            createdAt={order.createdAt}
            acceptedAt={order.acceptedAt}
            pickedAt={order.pickedAt}
            deliveredAt={order.deliveredAt}
            completedAt={order.completedAt}
          />
        </div>

        {isRunner && ['accepted', 'picked', 'delivering'].includes(order.status) && (
          <div className="mb-6">
            {order.status === 'delivering' ? (
              <NavigationCard
                from={order.pickupLocation}
                to={order.deliveryAddress}
                distance={(order.distance || 1) * 0.8}
                fromLabel="取货点"
                toLabel="送达地址"
                stage="delivery"
              />
            ) : (
              <NavigationCard
                from="我的位置"
                to={order.pickupLocation}
                distance={order.distance || 1}
                fromLabel="当前位置"
                toLabel={isExpress ? '快递站点' : '购买地点'}
                stage="pickup"
              />
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">任务详情</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">取货地点</p>
                <p className="font-medium text-gray-900">{order.pickupLocation}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-secondary-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">送达地址</p>
                <p className="font-medium text-gray-900">{order.deliveryAddress}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">期望时间</p>
                <p className="font-medium text-gray-900">{formatDateTime(order.pickupTime)}</p>
              </div>
            </div>
            {isExpress && (
              <div className="bg-gradient-to-r from-info/10 to-secondary-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">快递信息</span>
                  <span className="text-xs px-2 py-0.5 bg-info/20 text-info rounded-full">
                    {order.expressSite || '快递'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-info" />
                  <span className="font-mono font-bold text-lg text-gray-900">
                    {order.expressNo || '暂无单号'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {order.description && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-2">备注说明</p>
              <p className="text-gray-700">{order.description}</p>
            </div>
          )}
        </div>

        {publisher && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">发布者</h3>
            <div className="flex items-center gap-3">
              <img
                src={publisher.avatar}
                alt={publisher.username}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{publisher.username}</p>
                <p className="text-sm text-gray-500">学号: {publisher.studentId}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        )}

        {runner && runnerProfile && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">接单跑手</h3>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={runner.avatar}
                alt={runner.username}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{runner.username}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span className="text-sm font-medium text-gray-700">
                      {runnerProfile.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    完成 {runnerProfile.completedOrders} 单
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {runnerReviews.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-3">最新评价</p>
                {runnerReviews.slice(0, 2).map((review) => (
                  <div key={review.id} className="py-3 first:pt-0">
                    <div className="flex items-center justify-between mb-1">
                      <Rating value={review.rating} size="sm" />
                      <span className="text-xs text-gray-400">
                        {formatDateTime(review.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{review.comment}</p>
                    {review.tags.length > 0 && (
                      <div className="flex gap-1.5 mt-2">
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
            )}
          </div>
        )}

        {isPublisher && order.status === 'completed' && (
          <button
            onClick={() => setShowDisputeModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3 text-danger hover:bg-red-50 rounded-xl transition-colors mb-6"
          >
            <AlertTriangle className="w-5 h-5" />
            <span>有问题？申请争议</span>
          </button>
        )}
      </div>

      {getActionButton() && (
        <div className="fixed bottom-20 md:bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-30">
          <div className="container mx-auto max-w-2xl">
            {getActionButton()}
          </div>
        </div>
      )}

      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="评价跑手"
      >
        <div className="text-center mb-6">
          <div className="justify-center flex mb-3">
            <Rating
              value={rating}
              size="lg"
              readonly={false}
              onChange={setRating}
            />
          </div>
          <p className="text-gray-600">
            {rating === 5 ? '非常满意！' : rating >= 4 ? '还不错' : rating >= 3 ? '一般' : '不太满意'}
          </p>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">选择标签</p>
          <div className="flex flex-wrap gap-2">
            {reviewTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">评价内容</p>
          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="分享一下你的体验吧..."
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-colors resize-none"
          />
        </div>

        <Button fullWidth onClick={handleSubmitReview}>
          提交评价
        </Button>
      </Modal>

      <Modal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        title="申请争议"
      >
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">争议原因</p>
          <textarea
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            placeholder="请详细描述争议原因..."
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-colors resize-none"
          />
        </div>

        <p className="text-sm text-gray-500 mb-6">
          提交后，管理员会在24小时内处理。核实后将为您退款。
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            fullWidth
            onClick={() => setShowDisputeModal(false)}
          >
            取消
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={handleSubmitDispute}
            disabled={!disputeReason}
          >
            提交争议
          </Button>
        </div>
      </Modal>
    </div>
  );
}
