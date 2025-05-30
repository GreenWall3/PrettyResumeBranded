'use client';

import { useRouter } from 'next/navigation';
import { PricingCard, type Plan } from './pricing-card';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Sparkles, Rocket, Zap, CheckCircle, Award, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans: Plan[] = [
  {
    title: 'Free',
    priceId: '',
    price: '$0',
    features: [
      '2 Base Resume',     
      'Basic AI Assistance',
      'Adjustable Layout',
      'Limited Export'

    ]
  },
  {
    title: 'Pro',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!,
    price: '$9',
    features: [
      'Unlimited Base Resumes',
      'Advanced Ai Assistance',
      'Import from Resume',
      'Resume Score Tool',
      'Adjustable Layouts',
      'Priority Support'
    ]
  }
];

interface FreePlanDisplayProps {
  initialProfile: {
    subscription_plan: string | null;
    subscription_status: string | null;
  } | null;
}

export function FreePlanDisplay({ initialProfile }: FreePlanDisplayProps) {
  const router = useRouter();
  const subscriptionPlan = initialProfile?.subscription_plan?.toLowerCase() || 'free';

  const handleCheckout = async (plan: Plan) => {
    if (!plan.priceId) return;
    
    router.push(`/subscription/checkout?price_id=${plan.priceId}`);
  };

  return (
    <div className="container mx-auto px-4 py-16 relative bg-slate-50 bg-grid-small-black/[0.15]">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[30%] -right-[15%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-purple-500/10 to-indigo-500/10 blur-3xl animate-[move_10s_ease-in-out_infinite]" />
        <div className="absolute -bottom-[30%] -left-[15%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-3xl animate-[move_12s_ease-in-out_infinite]" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-600 px-4 py-1.5 rounded-full text-xs font-semibold mb-4">
          <Sparkles className="h-3.5 w-3.5 text-purple-600" />
          CHOOSE YOUR PLAN
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          Elevate Your Career <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Journey</span>
        </h1>
        
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Select the perfect plan for your career goals and start building impressive resumes today
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="max-w-5xl mx-auto p-10 text-center rounded-3xl border border-purple-200/50 bg-gradient-to-br from-purple-50/80 to-indigo-50/80 backdrop-blur-xl mb-16 relative overflow-hidden shadow-2xl">
          {/* Subtle animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-indigo-400/5 animate-gradient" />
          
          <div className="relative space-y-8">
            <div className="flex items-center justify-center space-x-4">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
                className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center transform hover:rotate-12 transition-transform duration-300"
              >
                <Rocket className="h-8 w-8 text-white" />
              </motion.div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold">
                <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  Start Your Journey
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Begin crafting your perfect resume with our powerful AI-assisted tool
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { 
                  icon: Rocket,
                  text: "Quick Start",
                  subtext: "Create your first resume in minutes"
                },
                { 
                  icon: Sparkles,
                  text: "Ai Assistance",
                  subtext: "Smart suggestions and improvements"
                },
                { 
                  icon: Zap,
                  text: "Instant Results",
                  subtext: "See changes in real-time"
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className="group p-5 rounded-xl bg-white/40 backdrop-blur-sm border border-purple-100 hover:border-purple-200 hover:bg-white/60 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex flex-col items-center">
                      <div className="bg-purple-100 rounded-xl p-3 mb-3 inline-flex">
                        <item.icon className="h-6 w-6 text-purple-600 transform group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <h3 className="text-base font-medium text-gray-900 mb-1">{item.text}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.subtext}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="relative max-w-5xl mx-auto mb-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[250px] bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-cyan-500/10 blur-3xl rounded-full"></div>
        </div>
        
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            <span className="border-b-2 border-purple-500 pb-1">Choose</span> Your Plan
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Select the plan that best fits your career needs and budget
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto relative">
        {plans.map((plan) => (
          <motion.div
            key={plan.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: plan.title === 'Pro' ? 0.2 : 0,
              duration: 0.5
            }}
            className={`relative ${plan.title === 'Pro' ? 'md:-mt-4 md:mb-4' : ''}`}
          >
            {plan.title === 'Pro' && (
              <>
                {/* Enhanced animated glow effect */}
                <div className="absolute -inset-[2px] bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 rounded-2xl opacity-75 blur-lg group-hover:opacity-100 animate-pulse transition-opacity duration-500" />
                <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 rounded-2xl" />
                {/* Pro badge */}
                <div className="absolute -top-6 left-0 right-0 mx-auto w-32 z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur-md" />
                    <div className="relative bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium text-center shadow-lg">
                      Upgrade Now
                    </div>
                  </div>
                </div>
              </>
            )}
            <PricingCard
              key={plan.title}
              plan={plan}
              isCurrentPlan={plan.title.toLowerCase() === subscriptionPlan}
              onAction={handleCheckout}
              variant={plan.title === 'Pro' ? 'pro' : 'default'}
              className={cn(
                "relative",
                plan.title === 'Pro' && [
                  "scale-105 shadow-2xl",
                  "hover:scale-[1.07] hover:shadow-3xl hover:shadow-purple-500/20",
                  "transition-all duration-500"
                ]
              )}
              isLoading={false}
            />
          </motion.div>
        ))}
      </div>
      
    </div>
  );
} 
