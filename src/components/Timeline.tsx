import { Check, Clock, Package, Truck, MapPin } from 'lucide-react';
import type { OrderStatus } from '../types';

interface TimelineProps {
  status: OrderStatus;
  createdAt: string;
  acceptedAt?: string;
  pickedAt?: string;
  deliveredAt?: string;
  completedAt?: string;
}

interface TimelineItem {
  icon: React.ReactNode;
  title: string;
  time?: string;
  completed: boolean;
  active: boolean;
}

export default function Timeline({
  status,
  createdAt,
  acceptedAt,
  pickedAt,
  deliveredAt,
  completedAt,
}: TimelineProps) {
  const getStatusIndex = (s: OrderStatus): number => {
    const statusOrder: OrderStatus[] = [
      'pending',
      'accepted',
      'picked',
      'delivering',
      'completed',
    ];
    return statusOrder.indexOf(s);
  };

  const currentIndex = getStatusIndex(status);

  const items: TimelineItem[] = [
    {
      icon: <Clock className="w-5 h-5" />,
      title: '订单发布',
      time: createdAt,
      completed: true,
      active: false,
    },
    {
      icon: <Package className="w-5 h-5" />,
      title: '跑手接单',
      time: acceptedAt,
      completed: currentIndex >= 1,
      active: currentIndex === 1,
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: '已取货',
      time: pickedAt,
      completed: currentIndex >= 2,
      active: currentIndex === 2,
    },
    {
      icon: <Truck className="w-5 h-5" />,
      title: '配送中',
      time: deliveredAt,
      completed: currentIndex >= 3,
      active: currentIndex === 3,
    },
    {
      icon: <Check className="w-5 h-5" />,
      title: '已完成',
      time: completedAt,
      completed: currentIndex >= 4,
      active: currentIndex === 4,
    },
  ];

  return (
    <div className="py-2">
      {items.map((item, index) => (
        <div key={index} className="relative flex gap-4">
          {index < items.length - 1 && (
            <div
              className={`absolute left-5 top-12 w-0.5 h-full -translate-y-2 ${
                item.completed ? 'bg-success' : 'bg-gray-200'
              }`}
            />
          )}
          <div
            className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              item.completed
                ? 'bg-success text-white'
                : item.active
                ? 'bg-primary-500 text-white animate-pulse'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            {item.completed && index > 0 ? (
              <Check className="w-5 h-5" />
            ) : (
              item.icon
            )}
          </div>
          <div className="flex-1 pb-8">
            <div className="flex items-center justify-between">
              <h4
                className={`font-medium ${
                  item.completed || item.active ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {item.title}
              </h4>
              {item.time && (
                <span className="text-sm text-gray-500">
                  {new Date(item.time).toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>
            {item.active && (
              <p className="text-sm text-primary-500 mt-1">进行中...</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
