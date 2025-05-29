'use client';

import { useEffect } from 'react';

interface BuyMeCoffeeProps {
  className?: string;
}

export function BuyMeCoffee({ className }: BuyMeCoffeeProps) {
  useEffect(() => {

  }, []); // Empty dependency array means this runs once on mount

  // Return empty div to maintain component structure
  return <div id="bmc-wbtn-container" className={className} />;
} 