'use client';

import { usePathname } from 'next/navigation';
import { AppHeader } from './app-header';
import { useEffect } from 'react';

interface ConditionalHeaderProps {
  showUpgradeButton?: boolean;
}

export function ConditionalHeader({ showUpgradeButton }: ConditionalHeaderProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  // Add or remove padding class from main element based on header visibility
  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      if (isHomePage) {
        mainElement.classList.remove('pt-14');
      } else {
        mainElement.classList.add('pt-14');
      }
    }
  }, [isHomePage]);

  if (isHomePage) {
    return null;
  }
  
  return <AppHeader showUpgradeButton={showUpgradeButton} />;
} 