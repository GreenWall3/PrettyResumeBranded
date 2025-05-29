'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Plan {
  title: string;
  priceId: string;
  price: string;
  features: string[];
}

interface PricingCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  isLoading: boolean;
  onAction: (plan: Plan) => void;
  buttonText?: string;
  variant?: 'default' | 'pro' | 'canceling';
  className?: string;
}

export function PricingCard({ 
  plan, 
  isCurrentPlan, 
  isLoading,
  onAction,
  buttonText,
  variant = 'default',
  className
}: PricingCardProps) {
  const isFree = plan.title === 'Free';
  const isPro = plan.title === 'Pro';
  const isProVariant = (variant === 'pro' || variant === 'canceling') && isPro;
  
  const getGradientColors = () => {
    if (variant === 'canceling' && isPro) {
      return {
        card: "border-yellow-200/50 bg-gradient-to-br from-yellow-50/50 to-orange-50/50",
        text: "from-yellow-600 to-orange-600",
        button: "from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700",
        check: "text-yellow-500"
      };
    }
    if (variant === 'pro' && isPro) {
      return {
        card: "border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-violet-50/50",
        text: "from-purple-600 to-violet-600",
        button: "from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700",
        check: "text-purple-500"
      };
    }
    return {
      card: "border-border/50 bg-background/50",
      text: "",
      button: "",
      check: "text-green-500"
    };
  };

  const colors = getGradientColors();
  
  return (
    <Card className={cn(
      "relative p-8 rounded-2xl backdrop-blur-xl flex flex-col",
      colors.card,
      className
    )}>
      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-2">{plan.title}</h3>
        <div className="flex items-baseline gap-1">
          <span className={cn(
            "text-4xl font-bold",
            isProVariant && `bg-gradient-to-br ${colors.text} bg-clip-text text-transparent`
          )}>{plan.price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <Check className={cn("h-5 w-5", colors.check)} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {!isFree && (
        <div className="mt-auto relative group">
          <div className={cn(
            "absolute -inset-[2px] rounded-lg opacity-0 blur-md transition-all duration-300",
            isProVariant && !isCurrentPlan && "group-hover:opacity-100",
            variant === 'pro' && "bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500",
            variant === 'canceling' && "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"
          )} />
          <Button
            className={cn(
              "w-full relative",
              isProVariant && !isCurrentPlan && [
                "bg-gradient-to-r shadow-lg",
                variant === 'pro' && "from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600",
                variant === 'canceling' && "from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                "text-white font-medium",
                "hover:shadow-xl",
                variant === 'pro' && "hover:shadow-purple-500/20",
                variant === 'canceling' && "hover:shadow-amber-500/20",
                "transition-all duration-300",
                "hover:-translate-y-0.5",
                "flex items-center justify-center gap-1.5"
              ],
              !isProVariant && "bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-0.5",
              isCurrentPlan && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !isCurrentPlan && onAction(plan)}
            disabled={isLoading || isCurrentPlan}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              buttonText || (
                isCurrentPlan ? (
                  'Current Plan'
                ) : (
                  <>
                    {isPro && !isCurrentPlan && (
                      <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    )}
                    <span className="transition-all duration-300 group-hover:translate-x-0.5">
                      {`Upgrade to ${plan.title}`}
                    </span>
                  </>
                )
              )
            )}
          </Button>
        </div>
      )}
    </Card>
  );
} 