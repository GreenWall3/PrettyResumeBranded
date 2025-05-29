"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { createClient } from "@/utils/supabase/client";

export default function PrivacyPolicyPage() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
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
                href={item === "Contact" ? "/contact" : `/#${item.toLowerCase()}`}
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
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500"></div>
      <div className="absolute top-20 right-10 w-64 h-64 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
      
      <div className="container mx-auto px-4 py-20 flex flex-col items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          {/* Header section with gradient text */}
          <div className="text-center mb-12 pt-16">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-transparent bg-clip-text">
              Privacy Policy
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              We value your privacy and are committed to protecting your personal information.
            </p>
          </div>

          {/* Main content area */}
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-purple-100 mb-16">
            <div className="prose prose-indigo max-w-none">
              <h2 className="text-2xl font-semibold mb-6 text-purple-700">Last Updated: April 11, 2025</h2>
              
              <p className="mb-6">
                At Pretty Resume, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
                and safeguard your information when you use our resume building service. Please read this privacy policy 
                carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-purple-700">Information We Collect</h3>
              
              <p className="mb-3">We may collect personal information that you voluntarily provide to us when you:</p>
              
              <ul className="list-disc pl-6 mb-6">
                <li>Register on our website</li>
                <li>Create a resume or CV</li>
                <li>Subscribe to our newsletter</li>
                <li>Request customer support</li>
                <li>Participate in promotions or surveys</li>
              </ul>
              
              <p className="mb-6">
                The personal information we collect may include your name, email address, phone number, billing information, 
                employment history, education history, and other information you choose to include in your resume.
              </p>
              
              <h3 className="text-xl font-semibold mb-3 text-purple-700">How We Use Your Information</h3>
              
              <p className="mb-3">We may use the information we collect for various purposes, including to:</p>
              
              <ul className="list-disc pl-6 mb-6">
                <li>Provide, maintain, and improve our services</li>
                <li>Process payments and fulfill orders</li>
                <li>Send you technical notices, updates, and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Understand how users interact with our services</li>
                <li>Detect, prevent, and address technical issues</li>
                <li>Comply with legal obligations</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-3 text-purple-700">Sharing Your Information</h3>
              
              <p className="mb-6">
                We may share your information with third parties in certain situations, including:
              </p>
              
              <ul className="list-disc pl-6 mb-6">
                <li>With service providers who perform services for us</li>
                <li>To comply with legal requirements</li>
                <li>To protect the rights, property, or safety of Pretty Resume, our users, or others</li>
                <li>In connection with a business transaction such as a merger, acquisition, or sale of assets</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-3 text-purple-700">Data Security</h3>
              
              <p className="mb-6">
                We use administrative, technical, and physical security measures to protect your personal information. 
                While we have taken reasonable steps to secure the personal information you provide to us, please be aware 
                that despite our efforts, no security measures are perfect or impenetrable, and no method of data 
                transmission can be guaranteed against any interception or other type of misuse.
              </p>
              
              <h3 className="text-xl font-semibold mb-3 text-purple-700">Your Privacy Rights</h3>
              
              <p className="mb-6">
                Depending on your location, you may have certain rights regarding your personal information, such as the 
                right to access, correct, delete, or restrict the processing of your personal information. To exercise 
                these rights, please contact us using the information provided below.
              </p>
              
              <h3 className="text-xl font-semibold mb-3 text-purple-700">Cookies and Tracking Technologies</h3>
              
              <p className="mb-6">
                We use cookies and similar tracking technologies to track activity on our service and hold certain 
                information. Cookies are files with a small amount of data which may include an anonymous unique identifier. 
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
              
              <h3 className="text-xl font-semibold mb-3 text-purple-700">Changes to This Privacy Policy</h3>
              
              <p className="mb-6">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
                Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.
              </p>
              
              <h3 className="text-xl font-semibold mb-3 text-purple-700">Contact Us</h3>
              
              <p className="mb-6">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              
              <div className="mb-6">
                <p><strong>Email:</strong> <a href="mailto:privacy@prettyresume.com" className="text-purple-600 hover:text-purple-700">privacy@prettyresume.com</a></p>
                <p><strong>Address:</strong> 123 Privacy Way, San Francisco, CA 94107</p>
                <p><strong>Phone:</strong> (800) 555-1212</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Merged CTA and Footer Section */}
      <section className="pt-12 pb-4 relative overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-grid-small-black/[0.05]"></div>
        
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
                Since 2022, PrettyResume has helped 5 million job seekers. Our tools and Certified Professional Resume Writers guide you through the entire job search process.
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
                <span className="text-sm text-black">8,250 reviews on</span>
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
                <div className="text-sm text-gray-500">we Started in 2022 • 2025</div>
              </div>
            </div>
            
            {/* Contact info and CTA */}
            <div className="flex flex-col items-center md:items-end">
              <a 
                href="#" 
                onClick={() => setShowAuthDialog(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-md transition-all duration-300 transform hover:scale-105 mb-6 shadow-md hover:shadow-purple-500/25"
              >
                Build my resume now
              </a>
              
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:855-213-0348" className="hover:text-purple-600 transition-colors duration-200 text-black">855-213-0348</a>
              </div>
              <div className="flex items-center mb-4">
                <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:support@prettyresume.com" className="hover:text-purple-600 transition-colors duration-200 text-black">support@prettyresume.com</a>
              </div>
              <div className="text-sm text-gray-500 text-center md:text-right">
                <div>Mon-Fri 8 AM - 8 PM CST</div>
                <div>Saturday 8 AM - 5 PM CST</div>
                <div>Sunday 10 AM - 6 PM CST</div>
              </div>
            </div>
          </div>
          
          {/* Bottom bar with Copyright */}
          <div className="flex flex-col sm:flex-row justify-between items-center pb-4 text-xs border-t border-gray-100 px-5 sm:px-8 md:px-10">
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
          <div className="fixed bottom-6 right-36 z-50">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-white text-purple-600 border border-purple-200 rounded-full p-3 shadow-md hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 group"
              aria-label="Scroll to top"
            >
              <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
} 