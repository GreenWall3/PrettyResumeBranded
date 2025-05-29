'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { AuthProvider } from "./auth-context";
import { signInWithGoogle } from "@/app/auth/login/actions";
import { Separator } from "@/components/ui/separator";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";

const gradientClasses = {
  base: "bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600",
  hover: "hover:from-violet-500 hover:via-blue-500 hover:to-violet-500",
  shadow: "shadow-lg shadow-violet-500/25",
  animation: "transition-all duration-500 animate-gradient-x",
};

interface TabButtonProps {
  value: "login" | "signup";
  children: React.ReactNode;
}

interface AuthDialogProps {
  children?: React.ReactNode;
  autoOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function TabButton({ value, children }: TabButtonProps) {
  const colors = value === "login" 
    ? { active: "violet", hover: "violet" }
    : { active: "blue", hover: "blue" };

  return (
    <TabsTrigger 
      value={value}
      className={`
        relative overflow-hidden rounded-xl text-sm font-medium transition-all duration-500
        data-[state=inactive]:text-muted-foreground/70
        data-[state=active]:text-${colors.active}-600
        data-[state=active]:bg-gradient-to-br
        data-[state=active]:from-white/90
        data-[state=active]:to-white/70
        data-[state=active]:shadow-lg
        data-[state=active]:shadow-${colors.active}-500/20
        data-[state=active]:border
        data-[state=active]:border-${colors.active}-200/60
        data-[state=inactive]:hover:bg-white/60
        data-[state=inactive]:hover:text-${colors.hover}-600
        group
      `}
    >
      <div className={`absolute inset-0 bg-gradient-to-br from-${colors.active}-500/10 via-blue-500/10 to-${colors.active}-500/10 opacity-0 data-[state=active]:opacity-100 transition-opacity duration-500`} />
      <motion.div
        className="relative z-10 flex items-center justify-center gap-2"
        whileTap={{ scale: 0.97 }}
      >
        <div className={`w-2 h-2 rounded-full bg-${colors.active}-500 opacity-0 group-data-[state=active]:opacity-100 transition-all duration-500 group-data-[state=active]:scale-100 scale-0`} />
        {children}
      </motion.div>
    </TabsTrigger>
  );
}

function SocialAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    console.log('🚀 Starting Google sign-in process...');
    try {
      setIsLoading(true);
      console.log('📡 Calling signInWithGoogle server action...');
      const result = await signInWithGoogle();
      
      console.log('📥 Received result from server action:', result);
      if (!result.success) {
        console.error('❌ Google sign in error:', result.error);
      } else if (result.url) {
        console.log('✅ Received OAuth URL:', result.url);
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('💥 Failed to sign in with Google:', error);
    } finally {
      setIsLoading(false);
      console.log('🔄 Sign-in process completed');
    }
  };

  return (
    <div className="space-y-4 mt-6">
      {/* Temporarily commented out Google Sign-in
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="bg-gradient-to-r from-transparent via-gray-300/50 to-transparent" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white/70 px-3 py-1 rounded-full text-muted-foreground font-medium backdrop-blur-sm">
            Or continue with
          </span>
        </div>
      </div>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          variant="outline"
          className="w-full bg-white/70 hover:bg-white/90 backdrop-blur-sm border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-300/80"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              <span className="font-medium">Google</span>
            </>
          )}
        </Button>
      </motion.div>
      */}
    </div>
  );
}

export function AuthDialog({ children, autoOpen = false, open: externalOpen, onOpenChange }: AuthDialogProps) {
  const [internalOpen, setInternalOpen] = useState(autoOpen);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = (newOpen: boolean) => {
    setInternalOpen(newOpen);
    onOpenChange?.(newOpen);
  };
  
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setOpen(false);
        if (pathname === '/auth/login') {
          router.push('/dashboard');
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setOpen(false);
        router.push('/dashboard');
      }
    });

    checkAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase, pathname]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>

      {/* AUTH DIALOG TRIGGER BUTTON */}
      <DialogTrigger asChild>
        {children || (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
          {/*   <Button 
              size="lg" 
              className={`${gradientClasses.base} ${gradientClasses.hover} text-white font-semibold 
              text-lg py-6 px-10 ${gradientClasses.animation} group
              shadow-xl shadow-violet-500/30 hover:shadow-violet-500/40
              ring-2 ring-white/20 hover:ring-white/30
              transition-all duration-300
              rounded-xl relative overflow-hidden`}
              aria-label="Open authentication dialog"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center justify-center">
                Start Now
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span> 
            </Button> */}
          </motion.div>
        )}
      </DialogTrigger>

      <DialogContent 
        className="sm:max-w-[425px] p-0 bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl animate-in fade-in-0 zoom-in-95 z-50 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-2xl overflow-hidden"
      >
        <AuthProvider>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-pink-100/20 to-blue-100/20 -z-10" />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl -z-10" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl -z-10" />
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DialogTitle className="px-8 pt-8 text-center relative">
              <div className="inline-flex items-center justify-center space-x-2 mb-3">
                <motion.div 
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-5 h-5 text-violet-500" aria-hidden="true" />
                </motion.div>
                <span className="text-sm font-medium bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                  AI-Powered Resume Builder
                </span>
              </div>
              <div className="flex justify-center items-center">
                <Logo className="text-3xl mb-2" asLink={false} />
              </div>
            </DialogTitle>
            <DialogDescription className="text-center px-8 text-muted-foreground text-sm">
              Please Sign In or Sign Up to start your journey towards landing your dream job. 
            </DialogDescription>
          </motion.div>

          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as "login" | "signup")} 
            className="w-full relative mt-6"
          >
            <TabsList className="w-full h-16 bg-gradient-to-r from-white/50 via-white/60 to-white/50 border-b border-white/50 p-2 grid grid-cols-2 gap-4">
              <TabButton value="login">Sign In</TabButton>
              <TabButton value="signup">Sign Up</TabButton>
            </TabsList>

            <div className="p-8 relative bg-white/60 backdrop-blur-sm">
              <div 
                className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-gradient-to-br from-violet-200/10 via-blue-200/10 to-violet-200/10 rounded-full blur-xl -z-10" 
                aria-hidden="true"
              />
              <div 
                className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-gradient-to-br from-blue-200/10 via-violet-200/10 to-blue-200/10 rounded-full blur-xl -z-10" 
                aria-hidden="true"
              />
              
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === "login" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="login" className="relative z-20 mt-0">
                  <LoginForm />
                  <SocialAuth />
                </TabsContent>
                <TabsContent value="signup" className="relative z-20 mt-0">
                  <SignupForm />
                  <SocialAuth />
                </TabsContent>
              </motion.div>
            </div>
          </Tabs>
        </AuthProvider>
      </DialogContent>
    </Dialog>
  );
} 