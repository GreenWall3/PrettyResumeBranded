'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Check } from "lucide-react";

interface WelcomeDialogProps {
  isOpen: boolean;
}

export function WelcomeDialog({ isOpen: initialIsOpen }: WelcomeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(initialIsOpen);
  }, [initialIsOpen]);

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={setIsOpen}
    >
      <DialogContent className="sm:max-w-md overflow-hidden p-0 border border-white/40 shadow-xl bg-white/95 backdrop-blur-sm">
        {/* Top decorative gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500" />
        
        {/* Background decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-teal-400/10 to-cyan-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-teal-400/10 to-cyan-400/10 rounded-full blur-3xl" />
        
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-teal-500" />
            <span className="text-sm font-medium text-teal-700">Get started in minutes</span>
          </div>
          <DialogTitle className="text-2xl font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent text-center">
            Welcome to Pretty_Resume! 🎉
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          <h3 className="font-medium text-foreground text-center">Here's how to get started:</h3>
          <div className="space-y-5">
            <div className="flex items-start gap-4 group">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 flex items-center justify-center shadow-sm group-hover:shadow transition-all duration-300">
                <span className="text-sm font-semibold bg-gradient-to-br from-teal-600 to-cyan-600 bg-clip-text text-transparent">1</span>
              </div>
              <div className="flex-1 pt-1.5">
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  Fill out your profile with your work experience, education, and skills
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 group">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 flex items-center justify-center shadow-sm group-hover:shadow transition-all duration-300">
                <span className="text-sm font-semibold bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent">2</span>
              </div>
              <div className="flex-1 pt-1.5">
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  Create base resumes for different types of roles you're interested in
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 group">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 flex items-center justify-center shadow-sm group-hover:shadow transition-all duration-300">
                <span className="text-sm font-semibold bg-gradient-to-br from-pink-600 to-rose-600 bg-clip-text text-transparent">3</span>
              </div>
              <div className="flex-1 pt-1.5">
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  Use your base resumes to create tailored versions for specific job applications
                </p>
              </div>
            </div>
          </div>
          <div className="pt-4 space-y-3">
            <Link href="/profile" className="block">
              <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-medium py-5 shadow-md hover:shadow-lg transition-all duration-300 group">
                <span>Start by Filling Your Profile</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="w-full py-5 border-muted-foreground/20 hover:bg-muted/50 transition-all duration-300 font-medium group"
              onClick={() => setIsOpen(false)}
            >
              <Check className="mr-2 h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
              I'll do this later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 