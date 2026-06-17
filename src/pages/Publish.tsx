import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, MapPin, Clock, DollarSign, FileText, ChevronLeft } from 'lucide-react';
import Button from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import type { OrderType } from '../types';

export default function Publish() {
  const navigate = useNavigate();
  const { currentUser, publishOrder } = useAppStore();
  const [type, setType] = useState<OrderType>('express');
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pickupLocation: '',
    deliveryAddress: '',
    reward: '',
    expressSite: '',
    expressNo: '',
    pickupTime: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!currentUser) {
      alert('请先登录');
      return;
    }

    if (currentUser.balance < Number(formData.reward)) {
      alert('余额不足，请先充值');
      return;
    }

    const orderTitle = type === 'express' && formData.expressSite && formData.expressNo
      ? `代取${formData.expressSite}快递（尾号${formData.expressNo.slice(-4)}）`
      : formData.title;

    publishOrder({
      type,
      title: orderTitle,
      description: formData.description,
      pickupLocation: formData.pickupLocation,
      deliveryAddress: formData.deliveryAddress,
      reward: Number(formData.reward),
      expressSite: type === 'express' ? formData.expressSite : undefined,
      expressNo: type === 'express' ? formData.expressNo : undefined,
      pickupTime: formData.pickupTime,
      distance: Math.random() * 2,
    });

    alert('发布成功！');
    navigate('/');
  };

  const canNext = () => {
    if (step === 1) {
      if (type === 'express') {
        return formData.expressSite && formData.expressNo;
      } else {
        return formData.title && formData.description;
      }
    }
    if (step === 2) {
      return formData.pickupLocation && formData.deliveryAddress && formData.pickupTime;
    }
    if (step === 3) {
      return formData.reward && Number(formData.reward) > 0;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-14">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 ml-2">发布任务</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm transition-all ${
                  step >= s
                    ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 h-1 mx-2 rounded ${
                    step > s ? 'bg-primary-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setType('express')}
            className={`flex-1 p-4 rounded-2xl border-2 transition-all ${
              type === 'express'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${
                type === 'express'
                  ? 'bg-gradient-to-br from-primary-400 to-primary-600'
                  : 'bg-gray-100'
              }`}
            >
              <Package
                className={`w-6 h-6 ${type === 'express' ? 'text-white' : 'text-gray-400'}`}
              />
            </div>
            <p
              className={`font-medium text-center ${
                type === 'express' ? 'text-primary-600' : 'text-gray-600'
              }`}
            >
              代取快递
            </p>
          </button>
          <button
            onClick={() => setType('errand')}
            className={`flex-1 p-4 rounded-2xl border-2 transition-all ${
              type === 'errand'
                ? 'border-secondary-500 bg-secondary-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${
                type === 'errand'
                  ? 'bg-gradient-to-br from-secondary-400 to-secondary-600'
                  : 'bg-gray-100'
              }`}
            >
              <ShoppingBag
                className={`w-6 h-6 ${type === 'errand' ? 'text-white' : 'text-gray-400'}`}
              />
            </div>
            <p
              className={`font-medium text-center ${
                type === 'errand' ? 'text-secondary-600' : 'text-gray-600'
              }`}
            >
              跑腿代买
            </p>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6">
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {type === 'express' ? '快递信息' : '跑腿信息'}
              </h2>

              {type === 'express' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">快递站点</label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {['东校区菜鸟驿站', '西校区快递中心', '南校区快递点', '北校区邮政点'].map((site) => (
                        <button
                          key={site}
                          onClick={() => {
                            handleChange('expressSite', site);
                            handleChange('pickupLocation', site);
                          }}
                          className={`p-3 text-sm rounded-xl border-2 transition-all text-left ${
                            formData.expressSite === site
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          {site}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Package className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={formData.expressSite}
                        onChange={(e) => {
                          handleChange('expressSite', e.target.value);
                          if (e.target.value) {
                            handleChange('pickupLocation', e.target.value);
                          }
                        }}
                        placeholder="或输入其他快递站点"
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <FormField
                    icon={<FileText className="w-5 h-5" />}
                    label="快递单号"
                    placeholder="请输入快递单号"
                    value={formData.expressNo}
                    onChange={(v) => handleChange('expressNo', v)}
                  />

                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-2">自动生成标题</p>
                    <p className="font-medium text-gray-900">
                      {formData.expressSite && formData.expressNo
                        ? `代取${formData.expressSite}快递（尾号${formData.expressNo.slice(-4)}）`
                        : '填写快递站点和单号后自动生成'}
                    </p>
                  </div>

                  <FormField
                    icon={<FileText className="w-5 h-5" />}
                    label="备注说明（选填）"
                    placeholder="如有特殊要求请填写..."
                    value={formData.description}
                    onChange={(v) => handleChange('description', v)}
                    textarea
                  />
                </>
              ) : (
                <>
                  <FormField
                    icon={<ShoppingBag className="w-5 h-5" />}
                    label="商品标题"
                    placeholder="如：帮忙买杯奶茶"
                    value={formData.title}
                    onChange={(v) => handleChange('title', v)}
                  />
                  <FormField
                    icon={<FileText className="w-5 h-5" />}
                    label="商品描述"
                    placeholder="详细描述商品信息，如规格、口味等"
                    value={formData.description}
                    onChange={(v) => handleChange('description', v)}
                    textarea
                  />
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">取送信息</h2>

              <FormField
                icon={<MapPin className="w-5 h-5 text-primary-500" />}
                label={type === 'express' ? '取件地点' : '购买地点'}
                placeholder="请输入取货地点"
                value={formData.pickupLocation}
                onChange={(v) => handleChange('pickupLocation', v)}
              />
              <FormField
                icon={<MapPin className="w-5 h-5 text-secondary-500" />}
                label="送达地址"
                placeholder="请输入详细送达地址"
                value={formData.deliveryAddress}
                onChange={(v) => handleChange('deliveryAddress', v)}
              />
              <FormField
                icon={<Clock className="w-5 h-5 text-warning" />}
                label={type === 'express' ? '取件时间' : '期望送达时间'}
                type="datetime-local"
                placeholder=""
                value={formData.pickupTime}
                onChange={(v) => handleChange('pickupTime', v)}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">设置报酬</h2>

              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-600">您的余额</p>
                    <p className="text-xl font-bold text-gray-900">
                      ¥{currentUser?.balance.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">
                    ¥
                  </span>
                  <input
                    type="number"
                    value={formData.reward}
                    onChange={(e) => handleChange('reward', e.target.value)}
                    placeholder="请输入报酬金额"
                    className="w-full pl-12 pr-4 py-4 text-2xl font-bold text-right bg-white rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex gap-2 mt-3">
                  {[5, 8, 10, 15].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleChange('reward', String(amount))}
                      className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                        Number(formData.reward) === amount
                          ? 'bg-primary-500 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      ¥{amount}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-700">
                  <span className="font-medium">温馨提示：</span>
                  发布后报酬将被冻结，任务完成后支付给跑手。如取消任务，报酬将原路退回。
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)} fullWidth>
              上一步
            </Button>
          ) : (
            <div className="flex-1" />
          )}
          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              fullWidth
            >
              下一步
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canNext()} fullWidth>
              确认发布
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function FormField({
  icon,
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  textarea = false,
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
        {textarea ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-colors resize-none"
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary-500 focus:bg-white focus:outline-none transition-colors"
          />
        )}
      </div>
    </div>
  );
}
