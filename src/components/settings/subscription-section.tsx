'use client'

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Star, Trophy, Rocket, Clock, Zap } from "lucide-react"
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { createPortalSession, postStripeSession } from '@/app/(dashboard)/subscription/stripe-session';
import { PricingCard, type Plan } from '../pricing/pricing-card';
import { useRouter } from 'next/navigation';
import { getSubscriptionStatus } from '@/utils/actions/stripe/actions';

const plans = [
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
    price: '$20',
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

interface Profile {
  subscription_plan: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

export function SubscriptionSection() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    async function fetchSubscriptionStatus() {
      try {
        const data = await getSubscriptionStatus();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchSubscriptionStatus();
  }, []);

  const subscription_plan = profile?.subscription_plan;
  const subscription_status = profile?.subscription_status;
  const current_period_end = profile?.current_period_end;
  
  const isPro = subscription_plan?.toLowerCase() === 'pro';
  const isCanceling = subscription_status === 'canceled';

  const handlePortalSession = async () => {
    try {
      setIsLoading(true);
      const result = await createPortalSession();
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      // Handle error silently
      void error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async (plan: Plan) => {
    if (!plan.priceId) return;
    router.push(`/subscription/checkout?price_id=${plan.priceId}`);
  };

  // Calculate days remaining for canceling plan
  const daysRemaining = current_period_end
    ? Math.max(0, Math.ceil((new Date(current_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (isLoadingProfile) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="h-10 w-10 bg-muted rounded-lg" />
          <div className="h-4 w-32 bg-muted rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className={cn(
          "absolute -top-[10%] -right-[10%] w-[400px] h-[400px] rounded-full blur-3xl opacity-20",
          isPro ? "bg-gradient-to-br from-purple-500 to-violet-500" :
          isCanceling ? "bg-gradient-to-br from-amber-500 to-orange-500" :
          "bg-gradient-to-br from-teal-500 to-emerald-500"
        )} />
      </div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className={cn(
          "p-4 rounded-xl border shadow-lg backdrop-blur-sm",
          isPro ? "bg-purple-50/30 border-purple-100" :
          isCanceling ? "bg-amber-50/30 border-amber-100" :
          "bg-teal-50/30 border-teal-100"
        )}>
          <div className="flex items-center gap-4">
            {/* Status Icon */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                isPro ? "bg-gradient-to-br from-purple-500 to-violet-500" :
                isCanceling ? "bg-gradient-to-br from-amber-500 to-orange-500" :
                "bg-gradient-to-br from-teal-500 to-emerald-500"
              )}
            >
              {isPro ? <Trophy className="h-5 w-5 text-white" /> :
               isCanceling ? <Clock className="h-5 w-5 text-white animate-pulse" /> :
               <Rocket className="h-5 w-5 text-white" />}
            </motion.div>

            {/* Status Info */}
            <div className="flex-grow">
              <h2 className={cn(
                "text-lg font-semibold bg-clip-text text-transparent",
                isPro ? "bg-gradient-to-r from-purple-600 to-violet-600" :
                isCanceling ? "bg-gradient-to-r from-amber-600 to-orange-600" :
                "bg-gradient-to-r from-teal-600 to-emerald-600"
              )}>
                {isPro ? 'Pro Plan Active' : isCanceling ? 'Pro Access Ending Soon' : 'Free Plan Active'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isCanceling ? 
                  <>You have <span className="font-medium text-amber-600">{daysRemaining} days</span> remaining</> :
                  isPro ? 'Unlimited access to all features' : 'Basic access'}
              </p>
            </div>

            {/* Action Button */}
            <Button
              onClick={handlePortalSession}
              disabled={isLoading}
              className={cn(
                "px-4 py-1 text-white text-sm shrink-0",
                isPro ? "bg-violet-600 hover:bg-violet-700" :
                isCanceling ? "bg-amber-600 hover:bg-amber-700" :
                "bg-teal-600 hover:bg-teal-700"
              )}
            >
              {isLoading ? "Loading..." : 
               isPro ? 'Manage Plan' : 
               isCanceling ? 'Reactivate' : 
               'Upgrade'}
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              isPro ? [
                { icon: Trophy, text: "Premium Features" },
                { icon: Sparkles, text: "Priority Support" },
                { icon: Star, text: "Exclusive Templates" }
              ] : isCanceling ? [
                { icon: Star, text: "Premium Features Ending" },
                { icon: Clock, text: `${daysRemaining} Days Left` },
                { icon: Zap, text: "Download Your Content" }
              ] : [
                { icon: Rocket, text: "Quick Start" },
                { icon: Sparkles, text: "Basic Features" },
                { icon: Zap, text: "Standard Templates" }
              ]
            ][0].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5",
                  isPro ? "bg-purple-100/50 text-purple-700" :
                  isCanceling ? "bg-amber-100/50 text-amber-700" :
                  "bg-teal-100/50 text-teal-700"
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.text}
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Pricing Cards Grid */}
      <div className="grid sm:grid-cols-2 gap-4 pt-8">
        {plans.map((plan) => (
          <motion.div
            key={plan.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: plan.title === 'Pro' ? 0.2 : 0 }}
            className={cn("relative", plan.title === 'Pro' && "sm:-mt-2")}
          >
            {plan.title === 'Pro' && (
              <>
                <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl opacity-75 blur-sm" />
                <div className="absolute -left-2 -top-3 z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full blur-sm" />
                    <div className="relative bg-gradient-to-r from-purple-500 to-violet-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg whitespace-nowrap">
                      Most Popular
                    </div>
                  </div>
                </div>
              </>
            )}
            <PricingCard
              plan={plan}
              isCurrentPlan={plan.title.toLowerCase() === subscription_plan?.toLowerCase()}
              isLoading={isCheckingOut}
              onAction={handleCheckout}
              buttonText={plan.title.toLowerCase() === subscription_plan?.toLowerCase() ? 'Current Plan' : undefined}
              variant={isPro ? 'pro' : isCanceling ? 'canceling' : 'default'}
              className={cn(
                "relative",
                plan.title === 'Pro' && "scale-[1.02] hover:scale-[1.03] transition-transform duration-300"
              )}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
} 