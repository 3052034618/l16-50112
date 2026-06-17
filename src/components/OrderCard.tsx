import { Link } from 'react-router-dom';
import { Package, ShoppingBag, MapPin, Clock, Star } from 'lucide-react';
import type { Order } from '../types';
import { getOrderStatusText, getOrderStatusColor, formatDate, formatMoney } from '../utils';
import { useAppStore } from '../store/useAppStore';

interface OrderCardProps {
  order: Order;
  showPublisher?: boolean;
}

export default function OrderCard({ order, showPublisher = false }: OrderCardProps) {
  const { users, getRunnerProfile } = useAppStore();
  const publisher = users.find(u => u.id === order.publisherId);
  const runnerProfile = order.runnerId ? getRunnerProfile(order.runnerId) : null;

  const isExpress = order.type === 'express';

  return (
    <Link
      to={`/order/${order.id}`}
      className="block bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group hover:-translate-y-1"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isExpress
                  ? 'bg-gradient-to-br from-primary-400 to-primary-600'
                  : 'bg-gradient-to-br from-secondary-400 to-secondary-600'
              }`}
            >
              {isExpress ? (
                <Package className="w-6 h-6 text-white" />
              ) : (
                <ShoppingBag className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-500 transition-colors line-clamp-1">
                {order.title}
              </h3>
              <p className="text-sm text-gray-500">
                {isExpress ? '代取快递' : '跑腿代买'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-primary-500">
              {formatMoney(order.reward)}
            </div>
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(
                order.status
              )}`}
            >
              {getOrderStatusText(order.status)}
            </span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{order.description || (isExpress && order.expressNo ? `快递单号: ${order.expressNo}` : '')}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0" />
            <span className="truncate">取货: {order.pickupLocation}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4 text-secondary-400 flex-shrink-0" />
            <span className="truncate">送达: {order.deliveryAddress}</span>
          </div>
          {isExpress && order.expressNo && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-info">#</span>
              </div>
              <span className="text-info font-mono font-medium">{order.expressNo}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4 text-warning flex-shrink-0" />
            <span>取件时间: {formatDate(order.pickupTime)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {showPublisher && publisher ? (
            <div className="flex items-center gap-2">
              <img
                src={publisher.avatar}
                alt={publisher.username}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm text-gray-600">{publisher.username}</span>
            </div>
          ) : runnerProfile ? (
            <div className="flex items-center gap-2">
              <img
                src={users.find(u => u.id === order.runnerId)?.avatar}
                alt="跑手"
                className="w-6 h-6 rounded-full"
              />
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                <span className="text-sm font-medium text-gray-700">
                  {runnerProfile.rating.toFixed(1)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                发布于 {formatDate(order.createdAt)}
              </span>
            </div>
          )}

          {order.distance !== undefined && (
            <div className="text-sm text-secondary-500 font-medium">
              {order.distance}km
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
