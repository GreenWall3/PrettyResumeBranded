'use client';

import { LogoutButton } from "@/components/auth/logout-button";
import { SettingsButton } from "@/components/settings/settings-button";
// import { ModelSelector } from "@/components/settings/model-selector";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Menu, User, LayoutDashboard, ChevronRight } from "lucide-react";
import { PageTitle } from "./page-title";
// import { TogglePlanButton } from '@/components/settings/toggle-plan-button';
import { ProUpgradeButton } from "@/components/settings/pro-upgrade-button";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface AppHeaderProps {
  children?: React.ReactNode;
  showUpgradeButton?: boolean;
}

export function AppHeader({ children, showUpgradeButton = true }: AppHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="h-16 fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/30 via-white/50 to-violet-50/30" />
      
      {/* Subtle accent lines */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-400 via-purple-500 to-violet-400" />
      <div className="absolute top-0 h-[1px] w-full bg-white/50" />
      
      {/* Content Container */}
      <div className="max-w-[1920px] mx-auto h-full px-4 flex items-center justify-between relative">
        {/* Left Section - Logo and Title with improved spacing */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 transition-transform duration-300 hover:scale-[1.02]">
            <Logo className="text-xl" />
          </div>
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
          <div className="flex items-center min-w-0 max-w-[150px] sm:max-w-[320px] lg:max-w-[600px]">
            <div className="truncate font-medium text-slate-700">
              <PageTitle />
            </div>
          </div>
        </div>

        {/* Right Section - Navigation Items */}
        <div className="flex items-center space-x-1">
          {children ? (
            children
          ) : (
            <>
              {/* Desktop Navigation - Redesigned with pill-shaped buttons */}
              <nav className="hidden md:flex items-center gap-2">
                {showUpgradeButton && (
                  <>
                    <ProUpgradeButton />
                    <div className="h-5 w-px bg-slate-200 mx-2" />
                  </>
                )}
                
                <div className="flex items-center bg-slate-50 rounded-full p-1 border border-slate-200 shadow-sm">
                  <Link 
                    href="/dashboard" 
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                      "text-sm font-medium text-slate-700 hover:text-indigo-600",
                      "hover:bg-white hover:shadow-sm transition-all duration-200"
                    )}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                  
                  <Link 
                    href="/profile" 
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                      "text-sm font-medium text-slate-700 hover:text-indigo-600",
                      "hover:bg-white hover:shadow-sm transition-all duration-200"
                    )}
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>
                  
                  <SettingsButton className="rounded-full" />
                  
                  <LogoutButton className="rounded-full" />
                </div>
              </nav>

              {/* Mobile Menu - Redesigned with better animation */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-slate-200">
                    <Menu className="h-5 w-5 text-slate-700" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px] border-l border-slate-200 bg-gradient-to-b from-white to-slate-50">
                  <SheetHeader className="border-b border-slate-100 pb-4">
                    <SheetTitle className="text-indigo-700">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-2 pt-6">
                    {showUpgradeButton && (
                      <div className="mb-4">
                        <ProUpgradeButton className="w-full rounded-xl justify-center py-2" />
                      </div>
                    )}
                    
                    <div className="space-y-1 px-2">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-xl",
                          "text-sm font-medium text-slate-700 hover:text-indigo-600",
                          "hover:bg-white hover:shadow-sm transition-all duration-200"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <LayoutDashboard className="h-5 w-5 text-indigo-500" />
                          <span>Dashboard</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </Link>
                      
                      <Link
                        href="/profile"
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-xl",
                          "text-sm font-medium text-slate-700 hover:text-indigo-600",
                          "hover:bg-white hover:shadow-sm transition-all duration-200"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-indigo-500" />
                          <span>Profile</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </Link>
                      
                      <div className="px-1 py-1">
                        <SettingsButton className="w-full justify-between px-4 py-3 rounded-xl text-sm font-medium" />
                      </div>
                      
                      <div className="px-1 py-1">
                        <LogoutButton className="w-full justify-between px-4 py-3 rounded-xl text-sm font-medium" />
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </header>
  );
}