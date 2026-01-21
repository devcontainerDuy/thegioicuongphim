import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Miễn Phí',
    price: '0đ',
    period: '/tháng',
    description: 'Trải nghiệm cơ bản',
    icon: Zap,
    features: [
      'Xem phim có quảng cáo',
      'Chất lượng SD (480p)',
      'Xem trên 1 thiết bị',
      'Giới hạn 5 phim/ngày',
    ],
    buttonText: 'Đang sử dụng',
    buttonVariant: 'outline',
    popular: false,
  },
  {
    name: 'Premium',
    price: '79.000đ',
    period: '/tháng',
    description: 'Trải nghiệm không giới hạn',
    icon: Crown,
    features: [
      'Không quảng cáo',
      'Chất lượng Full HD (1080p)',
      'Xem trên 3 thiết bị',
      'Xem không giới hạn',
      'Tải phim offline',
      'Phim mới sớm nhất',
    ],
    buttonText: 'Nâng cấp ngay',
    buttonVariant: 'default',
    popular: true,
  },
  {
    name: 'VIP',
    price: '149.000đ',
    period: '/tháng',
    description: 'Trải nghiệm cao cấp nhất',
    icon: Sparkles,
    features: [
      'Tất cả tính năng Premium',
      'Chất lượng 4K Ultra HD',
      'Xem trên 5 thiết bị',
      'Âm thanh Dolby Atmos',
      'Ưu tiên hỗ trợ 24/7',
      'Sự kiện VIP độc quyền',
    ],
    buttonText: 'Đăng ký VIP',
    buttonVariant: 'default',
    popular: false,
  },
];

function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Chọn gói phù hợp với bạn
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Trải nghiệm xem phim không giới hạn với các gói đăng ký linh hoạt
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={cn(
                  "relative rounded-2xl border p-8 transition-all duration-300 hover:scale-[1.02]",
                  plan.popular
                    ? "bg-gradient-to-b from-primary/20 to-zinc-900 border-primary shadow-xl shadow-primary/20"
                    : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">
                      PHỔ BIẾN NHẤT
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    plan.popular ? "bg-primary/20" : "bg-zinc-800"
                  )}>
                    <Icon className={cn(
                      "w-6 h-6",
                      plan.popular ? "text-primary" : "text-zinc-400"
                    )} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-sm text-zinc-500">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-zinc-500">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-zinc-300">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn(
                    "w-full py-6 font-bold",
                    plan.popular
                      ? "bg-primary hover:bg-primary/90 text-white"
                      : "bg-zinc-800 hover:bg-zinc-700 text-white"
                  )}
                  variant={plan.buttonVariant}
                  disabled={index === 0}
                >
                  {plan.buttonText}
                </Button>
              </div>
            );
          })}
        </div>

        {/* FAQ Link */}
        <div className="text-center mt-16">
          <p className="text-zinc-500">
            Có thắc mắc?{' '}
            <Link to="/faq" className="text-primary hover:underline">
              Xem câu hỏi thường gặp
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
