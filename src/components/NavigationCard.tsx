import { useState } from 'react';
import { Navigation, MapPin, Clock, Footprints, Bike, X, ExternalLink } from 'lucide-react';
import Modal from './Modal';

interface NavigationCardProps {
  from: string;
  to: string;
  distance: number;
  fromLabel?: string;
  toLabel?: string;
  stage: 'pickup' | 'delivery';
}

export default function NavigationCard({
  from,
  to,
  distance,
  fromLabel = '我的位置',
  toLabel = '目的地',
  stage,
}: NavigationCardProps) {
  const [showMapModal, setShowMapModal] = useState(false);
  const estimatedTime = Math.round(distance * 15);
  const isPickup = stage === 'pickup';

  const openMap = (type: 'amap' | 'baidu') => {
    const fromEncoded = encodeURIComponent(from);
    const toEncoded = encodeURIComponent(to);

    if (type === 'amap') {
      window.open(
        `https://uri.amap.com/navigation?from=${fromEncoded}&to=${toEncoded}&mode=bus&src=campusrun`,
        '_blank'
      );
    } else {
      window.open(
        `https://api.map.baidu.com/direction?origin=${fromEncoded}&destination=${toEncoded}&mode=transit&src=campusrun`,
        '_blank'
      );
    }
    setShowMapModal(false);
  };

  return (
    <div className={`rounded-2xl overflow-hidden shadow-card ${
      isPickup ? 'bg-gradient-to-br from-primary-500 to-primary-600' : 'bg-gradient-to-br from-secondary-500 to-secondary-600'
    } text-white`}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            <span className="font-medium">
              {isPickup ? '前往取货点' : '前往送达地址'}
            </span>
          </div>
          <button
            onClick={() => setShowMapModal(true)}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <Navigation className="w-4 h-4" />
            开始导航
          </button>
        </div>

        <div className="relative">
          <svg
            viewBox="0 0 400 80"
            className="w-full h-20 mb-4"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              d="M 40 40 Q 100 10, 160 30 T 280 50 T 360 40"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 40 40 Q 100 10, 160 30 T 280 50 T 360 40"
              stroke="white"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="12 8"
              className="animate-pulse"
            />
            <circle cx="40" cy="40" r="8" fill="white" />
            <circle cx="40" cy="40" r="4" fill={isPickup ? '#FF6B35' : '#00B4D8'} />
            <circle cx="360" cy="40" r="10" fill="white" />
            <circle cx="360" cy="40" r="6" fill={isPickup ? '#FF6B35' : '#00B4D8'} />

            <g transform="translate(180, 15)">
              <circle cx="20" cy="20" r="16" fill="white" opacity="0.9" />
              <text
                x="20"
                y="25"
                textAnchor="middle"
                fontSize="14"
                fontWeight="bold"
                fill={isPickup ? '#FF6B35' : '#00B4D8'}
              >
                {distance.toFixed(1)}km
              </text>
            </g>
          </svg>
        </div>

        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <div className="w-3 h-3 bg-white rounded-full" />
          </div>
          <div>
            <p className="text-white/70 text-sm">{fromLabel}</p>
            <p className="font-medium">{from}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <MapPin className={`w-4 h-4 ${isPickup ? 'text-primary-500' : 'text-secondary-500'}`} />
          </div>
          <div>
            <p className="text-white/70 text-sm">{toLabel}</p>
            <p className="font-medium">{to}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Footprints className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold">{distance.toFixed(1)}</p>
            <p className="text-xs text-white/70">公里</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Bike className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold">{estimatedTime}</p>
            <p className="text-xs text-white/70">分钟</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold">预计</p>
            <p className="text-xs text-white/70">{estimatedTime}分钟到达</p>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        title="选择地图导航"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-500 mb-4">
            选择下方地图应用，查看详细路线和导航
          </p>

          <button
            onClick={() => openMap('amap')}
            className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
              高
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">高德地图</p>
              <p className="text-sm text-gray-500">公交、步行路线规划</p>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
          </button>

          <button
            onClick={() => openMap('baidu')}
            className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-secondary-300 hover:bg-secondary-50 transition-all group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
              百
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">百度地图</p>
              <p className="text-sm text-gray-500">详细街景和实时路况</p>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-secondary-500 transition-colors" />
          </button>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">导航信息：</span>
              <br />
              起点：{from}
              <br />
              终点：{to}
              <br />
              全程约 {distance.toFixed(1)} 公里，预计 {estimatedTime} 分钟
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
