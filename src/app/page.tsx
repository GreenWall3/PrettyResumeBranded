'use client'

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Wand2, LayoutDashboard, ArrowUp, CheckCircle2, Star, Zap } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import LogoCarousel from "./components/LogoCarousel";
import { Camera, Clock, UsersIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from 'next/navigation';
import { AuthDialog } from "@/components/auth/auth-dialog";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

interface Review {
  title: string;
  content: string;
  author: string;
  rating: number;
  date: string;
}

const reviews: Review[] = [
  {
    title: "Best resume builder I've ever used",
    content: "The AI suggestions were spot-on and helped me highlight achievements I would have otherwise missed. Got three interviews within a week!",
    author: "Sarah Johnson",
    rating: 5,
    date: "March 15, 2024"
  },
  {
    title: "Incredibly intuitive and professional",
    content: "Pretty Resume is amazing, the advanced AI assistance in the Pro plan helped me craft a standout resume. Worth every penny!",
    author: "Michael Chen",
    rating: 5,
    date: "March 12, 2024"
  },
  {
    title: "Transformed my job search",
    content: "The resume score tool helped me identify weaknesses in my resume. The AI suggestions were relevant and the whole process was seamless.",
    author: "Emily Rodriguez",
    rating: 5,
    date: "March 10, 2024"
  },
  {
    title: "Perfect balance of simplicity and power",
    content: "The free version was enough to get me started, but upgrading to Pro with unlimited resumes and the score tool was a game-changer for my job hunt.",
    author: "David Wilson",
    rating: 4,
    date: "March 25, 2024"
  },
  {
    title: "Priority support saved my application",
    content: "Had a last-minute issue before a deadline and the priority support team helped me fix my resume within minutes. Couldn't be more grateful!",
    author: "Jennifer Lee",
    rating: 5,
    date: "April 2, 2024"
  },
  {
    title: "The adjustable layouts are fantastic",
    content: "I love how I can fine-tune the layout to fit my needs. The Pro version offers so many more options than the basic adjustable layout.",
    author: "Robert Garcia",
    rating: 5,
    date: "March 30, 2024"
  },
  {
    title: "Import feature saved me hours",
    content: "Being able to import my existing resume and have the AI enhance it was incredibly time-saving. The advanced AI assistance polished everything perfectly.",
    author: "Aisha Patel",
    rating: 5,
    date: "April 5, 2024"
  },
  {
    title: "Worth the upgrade from free to Pro",
    content: "Started with the free version which was good, but the Pro features like the resume score tool and advanced AI assistance make a huge difference in quality.",
    author: "Thomas Brown",
    rating: 4,
    date: "March 20, 2024"
  }
];

export default function Home() {
  const [searchTopic, setSearchTopic] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [counter, setCounter] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const heroVideoRef = useRef(null);
  const [showOverlays, setShowOverlays] = useState(true);
  const [isSliderActive, setIsSliderActive] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const router = useRouter();
  const [showConfirmationSuccess, setShowConfirmationSuccess] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Check authentication status when component mounts
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsSignedIn(!!user);
    };

    checkAuth();

    // Listen for auth state changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setIsSignedIn(true);
      } else if (event === 'SIGNED_OUT') {
        setIsSignedIn(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerPage(3);
      } else if (window.innerWidth >= 768) {
        setItemsPerPage(3);
      } else {
        setItemsPerPage(3);
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  useEffect(() => {
    const targetNumber = 999;
    const duration = 2000; // 2 seconds
    const steps = 50; // Number of steps
    const stepDuration = duration / steps;
    const increment = targetNumber / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      if (currentStep < steps) {
        setCounter(Math.min(Math.round(increment * (currentStep + 1)), targetNumber));
        currentStep++;
      } else {
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Check for confirmation success message
    if (searchParams.get('message') === 'confirmation_success') {
      setShowConfirmationSuccess(true);
      
      // Auto-hide the success dialog after 5 seconds
      const timer = setTimeout(() => {
        setShowConfirmationSuccess(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      // Show button when page is scrolled more than 400px
      setShowBackToTop(window.scrollY > 400);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleNextReview = () => {
    setCurrentPage((prev) => (prev + 1) % Math.ceil(10 / itemsPerPage));
  };

  const handlePrevReview = () => {
    setCurrentPage((prev) => (prev - 1 + Math.ceil(10 / itemsPerPage)) % Math.ceil(10 / itemsPerPage));
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const handleResumeButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSignedIn) {
      router.push('/dashboard');
    } else {
      setShowAuthDialog(true);
    }
  };

  return (
    <div className="bg-slate-50 bg-grid-small-black/[0.15] overflow-x-hidden">
      {/* Header Section */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-lg border-b border-slate-200/60 shadow-sm h-16">
        {/* Animated gradient background with enhanced glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/70 via-white/80 to-purple-50/70 animate-gradient-slow" />
        
        {/* Enhanced accent lines with animation */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-600 to-violet-500 animate-pulse" />
        <div className="absolute top-0 h-[1px] w-full bg-white/70 animate-shimmer" />
        
        {/* Decorative elements */}
        <div className="absolute -top-4 right-4 md:right-20 w-24 h-24 bg-purple-300/20 rounded-full blur-xl"></div>
        <div className="absolute -top-6 left-10 w-32 h-32 bg-indigo-300/10 rounded-full blur-xl"></div>
        
        {/* Content Container with micro-interactions */}
        <div className="max-w-[1920px] mx-auto h-full px-4 md:px-8 flex items-center justify-between relative">
          {/* Left Section - Enhanced Logo */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:drop-shadow-md">
              <Link href="/">
                <div className="flex items-center relative group">
                  <Logo className="h-8 w-auto group-hover:text-indigo-600 transition-colors duration-300" />
                  <div className="absolute -inset-2 bg-indigo-100/0 group-hover:bg-indigo-100/30 rounded-full blur-md transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                </div>
              </Link>
            </div>
          </div>

          {/* Center Section - Enhanced Menu Items with indicators and animations */}
          <nav className="hidden md:flex items-center space-x-8">
            {["Features", "Pricing", "Reviews", "FAQs", "Contact"].map((item, index) => (
              <Link 
                key={index}
                href={item === "Contact" ? "/contact" : `#${item.toLowerCase()}`}
                className="group relative text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-300"
              >
                <span className="relative z-10 flex items-center">
                  {item}
                  <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-indigo-500 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></div>
                </span>
              </Link>
            ))}
          </nav>

          {/* Right Section - Enhanced Auth Button with glowing effect */}
          <div className="flex items-center space-x-1">
            {isSignedIn ? (
              <Link 
                href="/dashboard" 
                className={cn(
                  "group relative flex items-center gap-1.5 px-4 py-2 rounded-full",
                  "text-sm font-medium text-slate-700 hover:text-indigo-600",
                  "bg-white/90 border border-slate-200/90 shadow-sm",
                  "hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-300"
                )}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full opacity-0 group-hover:opacity-70 blur-md transition-all duration-300"></div>
                <LayoutDashboard className="h-4 w-4 relative z-10 group-hover:text-indigo-500 transition-colors duration-300" />
                <span className="relative z-10">Dashboard</span>
              </Link>
            ) : (
              <Button 
                variant="outline" 
                className="group relative rounded-full border-slate-200/80 bg-white/90 px-4 py-2 hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all duration-300"
                onClick={() => setShowAuthDialog(true)}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full opacity-0 group-hover:opacity-70 blur-md transition-all duration-300"></div>
                <span className="relative z-10">Login</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Dialog */}
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />

      {/* Confirmation Success Dialog */}
      <AnimatePresence>
        {showConfirmationSuccess && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirmationSuccess(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="relative mx-auto max-w-md p-8 rounded-xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Background effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border border-green-200/50 shadow-xl rounded-xl" />
              <div className="absolute top-0 right-0 h-20 w-20 bg-green-300/20 rounded-full blur-xl" />
              <div className="absolute bottom-0 left-0 h-16 w-16 bg-emerald-300/20 rounded-full blur-xl" />
              
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                {/* Success icon with animated ring */}
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-30" />
                  <div className="relative bg-green-100 p-3 rounded-full">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  ✨ Account Confirmed Successfully!
                </h3>
                
                <p className="text-gray-700">
                  Welcome to Pretty Resume! You can now log in to your account and start creating amazing resumes.
                </p>
                
                <div className="pt-3 space-y-3 w-full">
                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transition-all"
                    onClick={() => {
                      setShowConfirmationSuccess(false);
                      setShowAuthDialog(true);
                    }}
                  >
                    Log in now
                  </Button>
                  
                 
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-2 mx-auto px-4 md:px-6 max-w-7xl relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-10 w-56 h-56 bg-indigo-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left Column - Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col space-y-5 px-4 md:px-0 text-center sm:text-left"
          >
            {/* Animated badge with glow effect */}
            <div className="relative flex justify-center sm:justify-start">
              <div className="absolute -inset-1 to-indigo-400 rounded-full opacity-30 blur-sm animate-pulse"></div>
              <span className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100/80 to-indigo-100/80 backdrop-blur-sm border border-purple-200/50 text-purple-600 text-xs font-medium shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin-slow">
                  <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2" />
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                AI-POWERED RESUME BUILDER
              </span>
            </div>
            
            {/* Animated gradient heading */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                Make your <span className="relative">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 animate-gradient-x">professional<br />resume</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-3 bg-gradient-to-r from-purple-300/20 via-indigo-300/20 to-purple-300/20 blur-md"></span>
                </span> in minutes
              </h1>
              
              <p className="text-sm md:text-base text-gray-600 max-w-lg mx-auto sm:mx-0">
                From generating bullet points to automatic formatting, our AI resume builder delivers professional results quickly.
              </p>
            </div>

            {/* Action buttons with enhanced styling */}
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleResumeButtonClick} className="group relative inline-flex items-center justify-center font-medium h-12 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 px-6 text-sm text-white transition-all duration-300 ease-in-out shadow-md hover:shadow-purple-500/30 overflow-hidden w-full sm:w-auto">
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center justify-center sm:justify-start w-full">
                    Build My Resume Now
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </button>
                
                <button onClick={handleResumeButtonClick} className="group relative inline-flex items-center justify-center font-medium h-12 rounded-md border border-purple-200 bg-white/80 backdrop-blur-sm px-6 text-sm text-gray-700 transition-all duration-300 ease-in-out hover:bg-purple-50 hover:border-purple-300 w-full sm:w-auto">
                  <span className="relative flex items-center justify-center sm:justify-start w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-500 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    Upload Existing Resume
                  </span>
                </button>
              </div>

              {/* Enhanced trust indicators with glass morphism effect */}
              <div className="relative group">
                <div className="absolute -inset-1 to-indigo-400/20 rounded-lg blur-sm group-hover:opacity-100 transition duration-1000 group-hover:duration-300 opacity-70"></div>
                <div className="relative flex flex-col sm:flex-row items-center gap-4 backdrop-blur-md rounded-lg p-4 border-purple-100/60 transition-all duration-300">
                  {/* Expert avatars with animation */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
                    <div className="flex -space-x-3 hover:-space-x-1 transition-all duration-300">
                      <Image width={28} height={28} className="h-7 w-7 rounded-full border-2 border-white ring-2 ring-purple-100 shadow-sm transition-transform duration-300 hover:scale-110 z-30" src="/images/avatars/avatar1.webp" alt="Expert avatar" />
                      <Image width={28} height={28} className="h-7 w-7 rounded-full border-2 border-white ring-2 ring-purple-100 shadow-sm transition-transform duration-300 hover:scale-110 z-20" src="/images/avatars/avatar2.webp" alt="Expert avatar" />
                      <Image width={28} height={28} className="h-7 w-7 rounded-full border-2 border-white ring-2 ring-purple-100 shadow-sm transition-transform duration-300 hover:scale-110 z-10" src="/images/avatars/avatar3.webp" alt="Expert avatar" />
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white ring-2 ring-purple-100 bg-purple-100 text-[9px] font-semibold text-purple-600 shadow-sm z-0">8+</div>
                    </div>
                    <span className="text-xs font-medium text-gray-700">Career Experts</span>
                  </div>
                  
                  {/* Animated divider */}
                  <div className="hidden sm:block h-12 w-px bg-gradient-to-b from-purple-200/30 via-purple-200/80 to-purple-200/30"></div>
                  
                  {/* Ratings with micro-interactions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                    <div className="flex items-center bg-purple-50/50 px-2 py-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-purple-500">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                      </svg>
                    </div>
                    
                    <div className="flex items-center group">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={i < 4 ? "currentColor" : i === 4 ? "currentColor" : "none"} 
                          className={`${i < 4 ? "text-yellow-400" : i === 4 ? "text-yellow-400" : "text-gray-300"} 
                          ${i === 4 ? "clip-path-half" : ""} hover:scale-110 transition-transform duration-200`}>
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Video Demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative md:-ml-12"
          >
            
            
            {/* Video Container */}
            <div className="relative overflow-hidden rounded-xl shadow-xl backdrop-blur-sm bg-white border border-purple-100 group hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-all duration-700">
              {/* Main video container */}
              <div style={{
                position: "relative", 
                boxSizing: "content-box", 
                width: isMobile ? "109%" : "104%",
                aspectRatio: isMobile ? "1.7" : "1.8",
                marginLeft: isMobile ? "-4%" : "-2%",
                padding: "0"
              }}>
                <iframe 
                  src="https://app.supademo.com/embed/cm9bw5y9o3n3upxcbrp5rn3ko?embed_v=2" 
                  loading="lazy" 
                  title="Resume Builder Demo" 
                  allow="clipboard-write" 
                  frameBorder="0" 
                  allowFullScreen 
                  style={{
                    position: "absolute", 
                    top: 0, 
                    left: 0, 
                    width: "100%", 
                    height: "98%",
                    borderRadius: "0.75rem",
                    border: "2px solid rgba(124, 58, 237, 0.6)",
                    borderLeft: "4px solid rgba(124, 58, 237, 0.8)",
                    borderRight: "4px solid rgba(124, 58, 237, 0.8)",
                    boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)"
                  }}
                ></iframe>
              </div>
              
              {/* Purple banner at bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 flex items-center justify-between">
                <span>See how our AI builds your resume</span>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


     {/* Trusted partners */}
     <section className="py-8 bg-transparent border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <h2 className="text-2xl font-bold text-gray-900">
                Trusted By Job-Seekers, Hired By Top Employers
              </h2>
              <p className="text-sm text-gray-500 max-w-md">
                Leading companies trust our Ai Resume Builder
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* Minimal gradient masks */}
            <div className="absolute left-0 top-0 bottom-0 w-16  from-white to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-16  from-white to-transparent z-10"></div>

            <div className="relative overflow-hidden">
              <LogoCarousel />
            </div>
          </motion.div>
        </div>
      </section>

     


      
{/* Features Section */}
<section id="features" className="py-10 bg-slate-50 bg-grid-small-black/[0.15] relative overflow-hidden">
  {/* Simplified background elements */}
  <div className="absolute inset-0 -z-10 pointer-events-none">
    <div className="absolute top-1/3 left-10 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-10 w-56 h-56 bg-blue-400/10 rounded-full blur-3xl"></div>
  </div>

  <div className="max-w-6xl mx-auto px-4 relative z-10">
    <div className="text-center mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
        KEY FEATURES
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight"
      >
        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Ultimate</span> Resume Builder
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-gray-600 text-base max-w-2xl mx-auto"
      >
        All the tools you need to create professional resumes that help you land your dream job
      </motion.p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mt-8 max-w-6xl mx-auto">
      {/* Feature 1 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="flex flex-col"
      >
        <div className="bg-blue-100 rounded-xl p-3 mb-3 inline-flex">
          <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        </div>
        <h3 className="text-lg font-bold mb-1">Leverage the latest AI tech</h3>
        <p className="text-gray-600 text-sm">Make a fully customized resume in minutes using our AI-powered software.</p>
      </motion.div>

      {/* Feature 2 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="flex flex-col"
      >
        <div className="bg-amber-100 rounded-xl p-3 mb-3 inline-flex">
          <svg className="w-8 h-8 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <h3 className="text-lg font-bold mb-1">Generate bullet points</h3>
        <p className="text-gray-600 text-sm">AI-generated experience bullet points that showcase your on-the-job skills.</p>
      </motion.div>

      {/* Feature 3 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="flex flex-col"
      >
        <div className="bg-teal-100 rounded-xl p-3 mb-3 inline-flex">
          <svg className="w-8 h-8 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <rect x="9" y="9" width="6" height="6"></rect>
          </svg>
        </div>
        <h3 className="text-lg font-bold mb-1">Auto-format each section</h3>
        <p className="text-gray-600 text-sm">Focus on content while our resume maker handles margins and spacing.</p>
      </motion.div>

      {/* Feature 4 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="flex flex-col"
      >
        <div className="bg-pink-100 rounded-xl p-3 mb-3 inline-flex">
          <svg className="w-8 h-8 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-bold mb-1">Instant downloads</h3>
        <p className="text-gray-600 text-sm">Download your resume instantly in PDF format with a professional design.</p>
      </motion.div>

      {/* Feature 5 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="flex flex-col"
      >
        <div className="bg-indigo-100 rounded-xl p-3 mb-3 inline-flex">
          <svg className="w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15V6"></path>
            <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
            <path d="M12 12H3"></path>
            <path d="M16 6H3"></path>
            <path d="M12 18H3"></path>
          </svg>
        </div>
        <h3 className="text-lg font-bold mb-1">Industry-specific skills</h3>
        <p className="text-gray-600 text-sm">Get AI-powered skill suggestions to your job title.</p>
      </motion.div>

      {/* Feature 6 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="flex flex-col"
      >
        <div className="bg-green-100 rounded-xl p-3 mb-3 inline-flex">
          <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
          </svg>
        </div>
        <h3 className="text-lg font-bold mb-1">Launch your job hunt</h3>
        <p className="text-gray-600 text-sm">Get more interviews and better job offers with your perfected resume.</p>
      </motion.div>
    </div>
  </div>
</section>



{/* 3 Steps Section - Compact Redesign */}
<section className="py-12 bg-[#f9f5ff] relative overflow-hidden">
  {/* Background decorative elements */}
  <div className="absolute top-1/2 right-0 transform -translate-y-1/2 z-0">
    <img src="/right-decor.svg" alt="" className="w-full max-w-xs" />
  </div>
  <div className="absolute top-1/2 left-0 transform -translate-y-1/2 z-0">
    <img src="/left-decore.avif" alt="" className="w-full max-w-xs" />
  </div>

  <div className="max-w-6xl mx-auto px-4 relative z-10">
    {/* Heading */}
    <div className="text-center mb-10">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
        Create your resume in 3 easy steps <span className="text-purple-600">now with AI</span>
      </h2>
    </div>
  
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
      {/* Step 1 */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="text-5xl font-bold text-gray-900">1</div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Add your information</h3>
            <p className="text-sm text-gray-700">
              Fill in the blanks or <span className="text-purple-800 font-medium">quickly import your resume</span> with AI.
            </p>
          </div>
        </div>
      </div>
      
      {/* Step 2 */}
      <div className="bg-purple-100 rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="text-5xl font-bold text-gray-900">2</div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Edit With Ease</h3>
            <p className="text-sm text-gray-700">
            Customize your resume in minutes with AI. Auto-generate bullet points and format sections effortlessly.
            </p>
          </div>
        </div>
      </div>
      
      {/* Step 3 */}
      <div className="bg-purple-100 rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="text-5xl font-bold text-gray-900">3</div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Click "Download"</h3>
            <p className="text-sm text-gray-700">
              Instantly receive your beautiful ready-to-submit resume.
            </p>
          </div>
        </div>
      </div>
    </div>
      
    {/* CTA Button */}
    <div className="flex justify-center mt-8">
      <a 
        href="#" 
        onClick={handleResumeButtonClick}
        className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-full transition-colors duration-300"
      >
        Build my resume with AI
      </a>
    </div>
  </div>
</section>

{/* AI Assistant Section */}
<section className="py-16 bg-indigo-50">
  <div className="max-w-7xl mx-auto px-4">
    <div className="flex flex-col md:flex-row items-center gap-8">
      {/* Left Content */}
      <div className="w-full md:w-1/2 md:pr-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-600 mb-6">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
          </svg>
          <span className="text-sm font-medium">AI ASSISTANT</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          AI-Powered <span className="text-purple-600">Resume Assistant</span>
        </h2>
        
        <p className="text-lg text-gray-700 mb-8">
          Get real-time feedback and suggestions from our advanced AI assistant. Optimize your resume content, improve your bullet points, and ensure your skills stand out to recruiters and ATS systems.
        </p>
        
        <a 
          href="#" 
          onClick={handleResumeButtonClick}
          className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl shadow-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-purple-500/25"
        >
          TRY AI ASSISTANT
        </a>
      </div>
      
      {/* Right Image */}
      <div className="w-full md:w-1/2 relative">
        <div className="relative max-w-md mx-auto">
          {/* Main chat image with hover effect */}
          <div className="relative z-10 transform-gpu transition-all duration-500 hover:scale-105">
            <Image
              src="/Chat.webp"
              alt="AI Resume Assistant"
              width={600}
              height={500}
              className="rounded-2xl shadow-xl border-4 border-white"
              priority
            />
            
            {/* Chat bubble decoration */}
            <div className="absolute -top-8 -right-8 bg-white p-3 rounded-xl shadow-lg transform rotate-3 transition-all duration-300 hover:rotate-0 hover:scale-110">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2.5 21.5L7 20.6622C8.47087 21.513 10.1786 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xs font-medium">AI Assistant</span>
              </div>
            </div>
          </div>
          
          {/* Floating UI elements for visual interest */}
          <div className="absolute -bottom-6 -left-6 z-20 bg-white p-3 rounded-xl shadow-lg transform -rotate-6 transition-all duration-300 hover:rotate-0 hover:scale-110">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs font-medium">Smart Suggestions</span>
            </div>
          </div>
          
          {/* Animated gradient background elements */}
          <div className="absolute -z-10 -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-purple-300 to-indigo-200 rounded-full opacity-70 blur-2xl animate-pulse"></div>
          <div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-pink-300 to-purple-200 rounded-full opacity-70 blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          {/* Decorative pattern */}
          <div className="absolute -z-5 top-5 -right-12 w-24 h-24 opacity-20">
            <div className="grid grid-cols-3 gap-2">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-900"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


{/* Resume Score Section */}
<section className="py-16 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4">
    <div className="flex flex-col md:flex-row items-center gap-8">
      {/* Left Image */}
      <div className="w-full md:w-1/2 relative">
        <div className="relative max-w-md mx-auto">
          <Image
            src="/score-left.webp"
            alt="Resume Score Analysis"
            width={600}
            height={500}
            className="rounded-2xl shadow-lg"
            priority
          />
          {/* Decorative elements */}
          <div className="absolute -z-10 -top-6 -left-6 w-24 h-24 bg-purple-200 rounded-full opacity-70 blur-xl"></div>
          <div className="absolute -z-10 -bottom-6 -right-6 w-32 h-32 bg-purple-200 rounded-full opacity-70 blur-xl"></div>
            </div>
          </div>
          
      {/* Right Content */}
      <div className="w-full md:w-1/2 md:pl-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-600 mb-6">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
                </svg>
          <span className="text-sm font-medium">RESUME SCORE</span>
              </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Check and analyze your <span className="text-purple-600">resume score</span>
        </h2>
        
        <p className="text-lg text-gray-700 mb-8">
          Get your resume score along with feedback on strengths, weaknesses, and tips to enhance it!
        </p>
        
        <a 
          href="#" 
          onClick={handleResumeButtonClick}
          className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl shadow-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-purple-500/25"
        >
          CHECK MY SCORE
        </a>
                </div>
              </div>
            </div>
</section>

{/* Dashboard Section */}
<section className="py-16 bg-purple-50">
  <div className="max-w-7xl mx-auto px-4">
    <div className="flex flex-col md:flex-row items-center gap-8">
      {/* Left Content */}
      <div className="w-full md:w-1/2 md:pr-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-600 mb-6">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
          </svg>
          <span className="text-sm font-medium">DASHBOARD</span>
          </div>
          
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Beautiful <span className="text-purple-600">Resume Dashboard</span>
        </h2>
        
        <div className="h-1 w-16 bg-purple-600 mb-6"></div>
        
        <p className="text-lg text-gray-700 mb-8">
        Manage all your resumes in one place with our intuitive dashboard. Easily create and organize resumes, customize them as needed, Stay organized and in control throughout your job search journey.
        </p>
        
        <a 
          href="#" 
          onClick={handleResumeButtonClick}
          className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl shadow-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-purple-500/25"
        >
          EXPLORE DASHBOARD
        </a>
      </div>
      
      {/* Right Image - Redesigned */}
      <div className="w-full md:w-1/2 relative">
        <div className="relative max-w-md mx-auto">
          {/* Main dashboard image with floating effect */}
          <div className="relative z-10 transition-transform duration-700 hover:scale-105 transform-gpu">
            <Image
              src="/dash.webp"
              alt="Resume Dashboard Interface"
              width={600}
              height={500}
              className="rounded-2xl shadow-2xl border-4 border-white"
              priority
            />
          </div>
          
          {/* Floating UI Elements - for visual interest */}
          <div className="absolute -bottom-8 -left-8 z-20 bg-white p-4 rounded-xl shadow-lg transform rotate-6 transition-transform duration-500 hover:rotate-0 hover:scale-110">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-sm font-medium">Resume Score: 92%</span>
            </div>
          </div>
          
          <div className="absolute -top-6 -right-6 z-20 bg-white p-3 rounded-xl shadow-lg transform -rotate-3 transition-transform duration-500 hover:rotate-0 hover:scale-110">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
              </svg>
              <span className="text-xs font-medium">26 Views Today</span>
            </div>
          </div>
          
          {/* Animated background elements */}
          <div className="absolute -z-10 -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-purple-300 to-pink-200 rounded-full opacity-70 blur-2xl animate-pulse"></div>
          <div className="absolute -z-10 -bottom-10 -right-10 w-40 h-40 bg-gradient-to-tl from-indigo-300 to-purple-200 rounded-full opacity-70 blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          {/* Decorative dots pattern */}
          <div className="absolute -z-5 bottom-10 -left-16 w-32 h-32 opacity-30">
            <div className="absolute w-1.5 h-1.5 bg-purple-900 rounded-full"></div>
            <div className="absolute w-1.5 h-1.5 bg-purple-900 rounded-full" style={{ top: '8px', left: '8px' }}></div>
            <div className="absolute w-1.5 h-1.5 bg-purple-900 rounded-full" style={{ top: '16px', left: '16px' }}></div>
            <div className="absolute w-1.5 h-1.5 bg-purple-900 rounded-full" style={{ top: '24px', left: '24px' }}></div>
            <div className="absolute w-1.5 h-1.5 bg-purple-900 rounded-full" style={{ top: '32px', left: '32px' }}></div>
            <div className="absolute w-1.5 h-1.5 bg-purple-900 rounded-full" style={{ top: '40px', left: '40px' }}></div>
            <div className="absolute w-1.5 h-1.5 bg-purple-900 rounded-full" style={{ top: '8px' }}></div>
            <div className="absolute w-1.5 h-1.5 bg-purple-900 rounded-full" style={{ top: '16px', left: '8px' }}></div>
            <div className="absolute w-1.5 h-1.5 bg-purple-900 rounded-full" style={{ top: '24px', left: '16px' }}></div>
            <div className="absolute w-1.5 h-1.5 bg-purple-900 rounded-full" style={{ top: '32px', left: '24px' }}></div>
            <div className="absolute w-1.5 h-1.5 bg-purple-900 rounded-full" style={{ top: '16px' }}></div>
            <div className="absolute w-1.5 h-1.5 bg-purple-900 rounded-full" style={{ top: '24px', left: '8px' }}></div>
            <div className="absolute w-1.5 h-1.5 bg-purple-900 rounded-full" style={{ top: '32px', left: '16px' }}></div>
            <div className="absolute w-1.5 h-1.5 bg-purple-900 rounded-full" style={{ top: '24px' }}></div>
            <div className="absolute w-1.5 h-1.5 bg-purple-900 rounded-full" style={{ top: '32px', left: '8px' }}></div>
            <div className="absolute w-1.5 h-1.5 bg-purple-900 rounded-full" style={{ top: '32px' }}></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>



    {/* Reviews Section */}
<section id="reviews" className="w-full py-8 md:py-16 lg:py-20 bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-sky-50/50">
  <div className="container px-4 md:px-6">
    <div className="flex flex-col items-center justify-center space-y-4 text-center">
      <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
        Job seekers love our resume builder.
      </h2>
      <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
        Join thousands of professionals who've landed their dream jobs using our AI-powered resume builder.
      </p>
    </div>
    <div className="mt-12 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-purple-50/50 via-purple-50/30 to-transparent z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-purple-50/50 via-purple-50/30 to-transparent z-10"></div>
      <motion.div
        className="flex space-x-8 pb-8"
        animate={{
          x: [0, -2400]
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {[...reviews, ...reviews, ...reviews, ...reviews].map((review: Review, index: number) => (
          <div
            key={index}
            className="min-w-[350px] max-w-[350px] p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col"
          >
            <div className="flex items-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < review.rating ? "text-orange-400" : "text-gray-300"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">{review.title}</h3>
            <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-4">{review.content}</p>
            <div className="flex justify-between items-center text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
              <span className="font-medium">{review.author}</span>
              <span className="text-gray-400">{review.date}</span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  </div>
</section>

{/* Pricing Section */}
<section id="pricing" className="py-16 bg-gradient-to-b from-white to-purple-50/30 relative overflow-hidden">
  {/* Background decorative elements */}
  <div className="absolute inset-0 -z-10 pointer-events-none">
    <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-300/10 rounded-full blur-3xl"></div>
    <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-indigo-300/10 rounded-full blur-3xl"></div>
  </div>
  
  <div className="max-w-6xl mx-auto px-4">
    <div className="text-center mb-12">
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 mb-3"
      >
        SIMPLE PRICING
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
      >
        Simple, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">transparent</span> pricing
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-lg text-gray-600 max-w-2xl mx-auto"
      >
        Choose the plan that's right for you and start building your professional resume today.
      </motion.p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {/* Free Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-500 hover:border-purple-200"
      >
        {/* Subtle gradient accent */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-gray-200 to-gray-300"></div>
        
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Free</h3>
            <span className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">Basic</span>
          </div>
          
          <div className="flex items-baseline mb-8">
            <span className="text-4xl font-bold text-gray-900">$0</span>
            <span className="text-gray-500 ml-2">/month</span>
          </div>
          
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200"></div>
            <ul className="space-y-5 mb-8 pl-4">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-gray-700">2 Resumes</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-gray-700">Basic AI Assistance</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-gray-700">Adjustable Layout</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-gray-700">Limited Export</span>
              </li>
            </ul>
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            {isSignedIn ? (
              <Link href="/subscription" passHref>
                <Button className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-medium py-3 rounded-xl transition-colors duration-300 shadow-sm group-hover:shadow-md group-hover:border-gray-300">
                  Get Started
                </Button>
              </Link>
            ) : (
              <AuthDialog>
                <Button className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-medium py-3 rounded-xl transition-colors duration-300 shadow-sm group-hover:shadow-md group-hover:border-gray-300">
                  Get Started
                </Button>
              </AuthDialog>
            )}
          </div>
        </div>
      </motion.div>

      {/* Pro Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="group relative bg-gradient-to-b from-purple-50 to-white rounded-2xl overflow-hidden border border-purple-200 shadow-md hover:shadow-xl transition-all duration-500 hover:border-purple-300"
      >
        {/* Gradient accent at top */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-purple-600 to-pink-600"></div>
        
        {/* Popular badge with shine animation */}
        <div className="absolute top-0 right-0">
          <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-4 py-1 uppercase tracking-wider shadow-md transform rotate-0 origin-top-right">
            Popular
            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-20 transform -skew-x-30 translate-x-full animate-shine"></div>
          </div>
        </div>
        
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Pro</h3>
            <span className="px-3 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">Recommended</span>
          </div>
          
          <div className="flex items-baseline mb-8">
            <span className="text-4xl font-bold text-purple-600">$9</span>
            <span className="text-gray-500 ml-2">/month</span>
          </div>
          
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 via-pink-300 to-purple-300"></div>
            <ul className="space-y-5 mb-8 pl-4">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-purple-500 mr-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-gray-700">Unlimited Resumes</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-purple-500 mr-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-gray-700">Advanced AI Assistance</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-purple-500 mr-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-gray-700">Import from Resume</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-purple-500 mr-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-gray-700">Resume Score Tool</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-purple-500 mr-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-gray-700">Adjustable Layouts</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-purple-500 mr-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="text-gray-700">Priority Support</span>
              </li>
            </ul>
          </div>
          
          <div className="pt-4 border-t border-purple-100">
            {isSignedIn ? (
              <Link href="/subscription?plan=pro" passHref>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg group-hover:shadow-purple-200">
                  Upgrade to Pro
                </Button>
              </Link>
            ) : (
              <AuthDialog>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg group-hover:shadow-purple-200">
                  Upgrade to Pro
                </Button>
              </AuthDialog>
            )}
          </div>
        </div>
      </motion.div>
    </div>

    {/* Added testimonial for social proof */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 }}
      className="mt-12 max-w-3xl mx-auto text-center"
    >
      <div className="flex justify-center mb-4">
        <div className="flex -space-x-2">
          <Image width={40} height={40} className="h-10 w-10 rounded-full border-2 border-white ring-2 ring-purple-100" src="/images/avatars/avatar1.webp" alt="Customer" />
          <Image width={40} height={40} className="h-10 w-10 rounded-full border-2 border-white ring-2 ring-purple-100" src="/images/avatars/avatar2.webp" alt="Customer" />
          <Image width={40} height={40} className="h-10 w-10 rounded-full border-2 border-white ring-2 ring-purple-100" src="/images/avatars/avatar3.webp" alt="Customer" />
        </div>
      </div>
      <p className="text-purple-800 font-medium mb-2">Trusted by 10,000+ job seekers</p>
      <p className="text-sm text-gray-600 italic">"After upgrading to Pro, I was able to create tailored resumes for each job application. The AI suggestions were spot-on and I landed interviews with 3 of my dream companies!"</p>
      <div className="mt-3 text-gray-600 text-xs">— Jennifer K., Software Engineer</div>
    </motion.div>
  </div>
</section>
     
{/* FAQ Section */}
<section id="faqs" className="py-10 bg-white">
  <div className="max-w-4xl mx-auto px-4">
    <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
      Frequently Asked <span className="text-purple-600">Questions</span>
    </h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* FAQ Item 1 - Expanded by default */}
      <details open className="group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <summary className="flex justify-between items-center p-4 cursor-pointer hover:bg-purple-50 transition-colors duration-200">
          <h3 className="text-base font-medium text-gray-700">What is Pretty Resume?</h3>
          <div className="bg-purple-500 rounded-full p-1 transition-transform duration-300 group-open:rotate-180">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </summary>
        <div className="p-4 border-t border-gray-100 bg-white/50 text-sm text-gray-600">
          <p>
            Pretty Resume is an AI-powered resume builder that helps job seekers create professional resumes with ease. Our platform offers both free and premium options with features like AI assistance, adjustable layouts, and resume scoring tools.
          </p>
          
        </div>
      </details>
      
      {/* FAQ Item 2 */}
      <details open className="group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <summary className="flex justify-between items-center p-4 cursor-pointer hover:bg-purple-50 transition-colors duration-200">
          <h3 className="text-base font-medium text-gray-700">What's included in the free plan?</h3>
          <div className="bg-gray-200 group-open:bg-purple-500 rounded-full p-1 transition-all duration-300 group-open:rotate-180">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-open:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </summary>
        <div className="p-4 border-t border-gray-100 bg-white/50 text-sm text-gray-600">
          <p>
            Our free plan includes access to 2 resumes, basic AI assistance to help improve your content, adjustable layout options, and limited export capabilities. It's perfect for users who need a simple, professional resume without advanced features.
          </p>
        </div>
      </details>
      
      {/* FAQ Item 3 */}
      <details className="group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <summary className="flex justify-between items-center p-4 cursor-pointer hover:bg-purple-50 transition-colors duration-200">
          <h3 className="text-base font-medium text-gray-700">What additional features come with Pro?</h3>
          <div className="bg-gray-200 group-open:bg-purple-500 rounded-full p-1 transition-all duration-300 group-open:rotate-180">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-open:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </summary>
        <div className="p-4 border-t border-gray-100 bg-white/50 text-sm text-gray-600">
          <p>
            The Pro plan ($9/month) includes unlimited resumes, advanced AI assistance for better content optimization, the ability to import from existing resumes, our resume score tool to evaluate your resume's effectiveness, multiple adjustable layouts, and priority support for any questions or issues.
          </p>
        </div>
      </details>
      
      {/* FAQ Item 4 */}
      <details className="group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <summary className="flex justify-between items-center p-4 cursor-pointer hover:bg-purple-50 transition-colors duration-200">
          <h3 className="text-base font-medium text-gray-700">How does the Resume Score Tool work?</h3>
          <div className="bg-gray-200 group-open:bg-purple-500 rounded-full p-1 transition-all duration-300 group-open:rotate-180">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-open:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </summary>
        <div className="p-4 border-t border-gray-100 bg-white/50 text-sm text-gray-600">
          <p>
            Our Resume Score Tool analyzes your resume against industry standards and ATS requirements, providing a comprehensive score and specific recommendations for improvement. It evaluates factors like keyword optimization, content strength, formatting, and overall impact to help you create a more effective resume.
          </p>
        </div>
      </details>
      
      {/* FAQ Item 5 */}
      <details className="group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <summary className="flex justify-between items-center p-4 cursor-pointer hover:bg-purple-50 transition-colors duration-200">
          <h3 className="text-base font-medium text-gray-700">How often can I update my resume?</h3>
          <div className="bg-gray-200 group-open:bg-purple-500 rounded-full p-1 transition-all duration-300 group-open:rotate-180">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-open:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </summary>
        <div className="p-4 border-t border-gray-100 bg-white/50 text-sm text-gray-600">
          <p>
          You can update your resume as often as you like! Free users can make unlimited edits to their 2 resumes, while Pro users can create and edit unlimited resumes to target different positions or industries.</p>
        </div>
      </details>
      
      {/* FAQ Item 6 */}
      <details className="group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <summary className="flex justify-between items-center p-4 cursor-pointer hover:bg-purple-50 transition-colors duration-200">
          <h3 className="text-base font-medium text-gray-700">How do I import my existing resume?</h3>
          <div className="bg-gray-200 group-open:bg-purple-500 rounded-full p-1 transition-all duration-300 group-open:rotate-180">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-open:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </summary>
        <div className="p-4 border-t border-gray-100 bg-white/50 text-sm text-gray-600">
          <p>
            With our Pro plan, you can upload your existing resume in PDF, DOCX, or TXT format. Our system will automatically extract your information and format it within our templates. You can then make adjustments, apply our advanced AI suggestions, and export your improved resume in your preferred format.
          </p>
        </div>
      </details>
      
      {/* FAQ Item 7 */}
      <details className="group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <summary className="flex justify-between items-center p-4 cursor-pointer hover:bg-purple-50 transition-colors duration-200">
          <h3 className="text-base font-medium text-gray-700">Is my information secure?</h3>
          <div className="bg-gray-200 group-open:bg-purple-500 rounded-full p-1 transition-all duration-300 group-open:rotate-180">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-open:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </summary>
        <div className="p-4 border-t border-gray-100 bg-white/50 text-sm text-gray-600">
          <p>
            Yes, your data security is our priority. Pretty Resume employs industry-standard encryption to protect your personal information. We never share your data with third parties without your explicit consent, and you can request deletion of your information at any time through your account settings.
          </p>
        </div>
      </details>
      
      {/* FAQ Item 8 */}
      <details className="group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <summary className="flex justify-between items-center p-4 cursor-pointer hover:bg-purple-50 transition-colors duration-200">
          <h3 className="text-base font-medium text-gray-700">Can I cancel my Pro subscription at any time?</h3>
          <div className="bg-gray-200 group-open:bg-purple-500 rounded-full p-1 transition-all duration-300 group-open:rotate-180">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-open:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </summary>
        <div className="p-4 border-t border-gray-100 bg-white/50 text-sm text-gray-600">
          <p>
          Absolutely. You can cancel your Pro subscription at any time through your account settings. You'll continue to have access to Pro features until the end of your current billing period.
          </p>
        </div>
      </details>
    </div>
  </div>
</section>



{/* Merged CTA and Footer Section */}
<section className="pt-12 pb-4 relative overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100">
  {/* Background decorative elements */}
  <div className="absolute inset-0 bg-grid-small-black/[0.05]"></div>
  
{/* CTA Card */}
<div className="max-w-7xl mx-auto px-4 mb-16">
  <div className="relative overflow-hidden rounded-[2rem] shadow-lg bg-gradient-to-r from-purple-900 to-purple-800">
    {/* Animated particles */}
    <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
    
    <div className="flex flex-col md:flex-row items-center">
      {/* Left Content */}
      <div className="w-full md:w-1/2 p-6 md:p-12 relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-purple-200 mb-4">
          <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-sm font-medium">AI Resume Builder</span>
        </div>
        
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
          Create Your Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 animate-text-gradient">Resume</span> in Minutes
        </h2>
        
        {/* Description */}
        <p className="text-gray-300 text-base md:text-lg max-w-xl leading-relaxed mb-6">
          Join thousands of job seekers who trust our AI to create stunning resumes that land interviews and secure dream jobs.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a 
            href="#" 
            onClick={handleResumeButtonClick}
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-purple-900 font-semibold rounded-xl shadow-lg hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 hover:shadow-purple-500/25"
          >
            Start Free Trial
            <svg className="ml-2 w-4 h-4 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
          
          <Link
            href="#pricing"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
          >
            View Pricing
          </Link>
        </div>
      </div>
      
      {/* Right Image */}
      <div className="w-full md:w-1/2 relative h-[250px] md:h-[400px]">
        <Image
          src="/cta.avif"
          alt="Resume Builder"
          fill
          className="object-contain md:object-cover object-center rounded-none md:rounded-r-[2rem]"
          style={{ right: '0', position: 'absolute' }}
          priority
        />
        {/* Removed the gradient overlay that was partially hiding the image */}
      </div>
    </div>
  </div>
</div>

  {/* Footer Section */}
  <div className="max-w-7xl mx-auto px-4 relative">
    {/* Top disclaimer with gradient background */}
    <div className="rounded-xl bg-gradient-to-r from-purple-100/50 to-indigo-100/50 p-4 text-center mb-8 border border-purple-200/50 backdrop-blur-sm">
      <p className="text-xs text-gray-600">¹ Results based on a survey of 1,500 Pretty Resume users who actively applied for jobs between January and March 2024.</p>
      <p className="mt-1 text-xs text-gray-600">*All company names, logos, and trademarks mentioned are the property of their respective owners. References to external companies or job platforms do not imply any partnership, endorsement, or affiliation with Pretty Resume. Pretty Resume is an independent resume building service designed to help job seekers create professional application materials.</p>
    </div>
    
    {/* Brand and Trust Section */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-gray-200 pb-8 mb-8">
      {/* Brand and Description */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left">
        <div className="text-2xl font-bold text-black mb-4">Pretty Resume™</div>
        <p className="text-gray-600 max-w-md">
          Since 2022, PrettyResume has helped 5 million job seekers. Our tools guide you through the entire job search process.
        </p>
      </div>
      
      {/* Trust badges */}
      <div className="flex flex-col items-center">
        <div className="flex items-center mb-2">
          <div className="text-lg font-bold text-black mr-2">EXCELLENT</div>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
        <div className="flex items-center mb-4">
          <span className="text-sm text-black">8,250 reviews</span>
          <img src="/trustpilot-logo.svg" alt="Trustpilot" className="h-5 ml-2" />
        </div>
        
        {/* Award badge */}
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4 rounded-full border border-purple-200/50">
          <svg className="w-10 h-10 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div className="text-center mt-2">
          <div className="font-semibold text-black">One Of the Best Resume Builder</div>
          <div className="text-sm text-gray-500">we Started in 2022</div>
        </div>
      </div>
      
      {/* Contact info and CTA */}
      <div className="flex flex-col items-center md:items-end">
        <a 
          href="#" 
          onClick={handleResumeButtonClick}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-md transition-all duration-300 transform hover:scale-105 mb-6 shadow-md hover:shadow-purple-500/25"
        >
          Build my resume now
        </a>
        
        <div className="flex items-center mb-4">
          <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <a href="mailto:support@prettyresume.com" className="hover:text-purple-600 transition-colors duration-200 text-black">support@prettyresume.com</a>
        </div>
        <div className="text-sm text-gray-500 text-center md:text-right">
          <div>Mon-Sun 8 AM - 5PM EST</div>
        </div>
      </div>
    </div>
    
    
  {/* Bottom bar with Copyright */}
<div className="flex flex-col sm:flex-row justify-between items-center  pb-4 text-xs border-t border-gray-100 px-5 sm:px-8 md:px-10">
  <div className="flex flex-wrap justify-center gap-x-4 mb-3 sm:mb-0">
    <a href="/privacy" className="text-gray-500 hover:text-purple-600 transition-colors">Privacy Policy</a>
    <a href="/terms" className="text-gray-500 hover:text-purple-600 transition-colors">Terms of Service</a>
    <a href="/cookies" className="text-gray-500 hover:text-purple-600 transition-colors">Cookie Policy</a>
    <span className="text-gray-400">© 2025 Pretty Resume</span>
  </div>
  
  <div className="flex items-center gap-3">
      
  <div className="flex items-center gap-3">
  <a href="https://facebook.com" className="text-gray-400 hover:text-purple-600" aria-label="Facebook">
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  </a>
  <a href="https://twitter.com" className="text-gray-400 hover:text-purple-600" aria-label="Twitter">
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 1 23 3z" />
    </svg>
  </a>
  <a href="https://linkedin.com" className="text-gray-400 hover:text-purple-600" aria-label="LinkedIn">
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  </a>
  <a href="https://pinterest.com" className="text-gray-400 hover:text-purple-600" aria-label="Pinterest">
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  </a>
  <a href="https://youtube.com" className="text-gray-400 hover:text-purple-600" aria-label="YouTube">
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  </a>
  <a href="https://tiktok.com" className="text-gray-400 hover:text-purple-600" aria-label="TikTok">
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  </a>
</div>
  </div>
</div>
    
  {/* Chat button */}
<div className="fixed bottom-6 right-6 z-50">
  <button 
    onClick={() => window.location.href = '/contact'}
    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full p-4 shadow-lg flex items-center transition-all duration-300 transform hover:scale-105"
  >
    <svg className="w-4 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
    <span className="ml-2">Need help?</span>
  </button>
</div>
    
    {/* Back to top button */}
    {showBackToTop && (
      <div className="fixed bottom-6 right-36 z-50">
        <button 
          onClick={scrollToTop}
          className="bg-white text-purple-600 border border-purple-200 rounded-full p-3 shadow-md hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 group"
          aria-label="Scroll to top"
        >
          <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>
    )}
  </div>
</section>



    {/* Auth Dialog for footer's "Build my resume now" button */}
    <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
}
