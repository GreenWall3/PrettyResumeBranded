'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, AlertTriangle, Crown } from "lucide-react";
import { Resume } from "@/lib/types";

import { toast } from "@/hooks/use-toast";
import { addTextToResume } from "@/utils/actions/resumes/ai";
import pdfToText from "react-pdftotext";
import { cn } from "@/lib/utils";
import { ProUpgradeButton } from "@/components/settings/pro-upgrade-button";
import { getSubscriptionStatus } from "@/utils/actions/stripe/actions";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TextImportDialogProps {
  resume: Resume;
  onResumeChange: (field: keyof Resume, value: Resume[keyof Resume]) => void;
  trigger: React.ReactNode;
}

export function TextImportDialog({
  resume,
  onResumeChange,
  trigger
}: TextImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [apiKeyError, setApiKeyError] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [isLoadingPro, setIsLoadingPro] = useState(true);

  useEffect(() => {
    if (!open) {
      setApiKeyError("");
    }
  }, [open]);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const status = await getSubscriptionStatus();
        setIsPro(status?.subscription_plan?.toLowerCase() === 'pro');
        setIsLoadingPro(false);
      } catch (error) {
        console.error('Error checking subscription:', error);
        setIsLoadingPro(false);
      }
    };

    checkSubscription();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!isPro) {
      toast({
        title: "Pro Feature",
        description: "Please upgrade to Pro to import existing resumes.",
        variant: "destructive",
      });
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === "application/pdf");

    if (pdfFile) {
      try {
        const text = await pdfToText(pdfFile);
        setContent(prev => prev + (prev ? "\n\n" : "") + text);
      } catch (err) {
        console.error('PDF processing error:', err);
        toast({
          title: "PDF Processing Error",
          description: "Failed to extract text from the PDF. Please try again or paste the content manually.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Invalid File",
        description: "Please drop a PDF file.",
        variant: "destructive",
      });
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPro) {
      toast({
        title: "Pro Feature",
        description: "Please upgrade to Pro to import existing resumes.",
        variant: "destructive",
      });
      return;
    }

    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      try {
        const text = await pdfToText(file);
        setContent(prev => prev + (prev ? "\n\n" : "") + text);
      } catch (err) {
        console.error('PDF processing error:', err);
        toast({
          title: "PDF Processing Error",
          description: "Failed to extract text from the PDF. Please try again or paste the content manually.",
          variant: "destructive",
        });
      }
    }
  };

  const handleImport = async () => {
    if (!isPro) {
      toast({
        title: "Pro Feature",
        description: "Please upgrade to Pro to import existing resumes.",
        variant: "destructive",
      });
      return;
    }

    setApiKeyError("");
    if (!content.trim()) {
      toast({
        title: "No content",
        description: "Please enter some text to import.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const updatedResume = await addTextToResume(content, resume);
      
      // Update each field of the resume
      (Object.keys(updatedResume) as Array<keyof Resume>).forEach((key) => {
        onResumeChange(key, updatedResume[key] as Resume[keyof Resume]);
      });

      toast({
        title: "Import successful",
        description: "Your resume has been updated with the imported content.",
      });
      setOpen(false);
      setContent("");
    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      if (errorMessage.includes('API key')) {
        setApiKeyError(
          'API key required. Please add your OpenAI API key in settings or upgrade to our Pro Plan.'
        );
      } else {
        toast({
          title: "Import failed",
          description: "Failed to process the text. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="relative">
          {trigger}
          {!isPro && (
            <Badge variant="outline" className="absolute -top-2 -right-2 bg-orange-50 text-orange-600 border border-orange-200 text-[10px] h-4">
              <Crown className="w-3 h-3 mr-1" />
              PRO
            </Badge>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-xl border-white/40 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
            Import Resume Content
            {!isPro && (
              <Badge variant="outline" className="bg-orange-50 text-orange-600 border border-orange-200 text-[10px] h-4">
                <Crown className="w-3 h-3 mr-1" />
                PRO
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 text-base text-muted-foreground/80">
              <p className="font-medium text-foreground">Choose one of these options:</p>
              <ol className="list-decimal list-inside space-y-1 ml-1">
                <li>Upload your PDF resume by dropping it below or clicking to browse</li>
                <li>Paste your resume text directly into the text area</li>
              </ol>
            </div>
          </DialogDescription>
        </DialogHeader>
        {!isPro ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-purple-950">Upgrade to Pro</h3>
              <p className="text-sm text-muted-foreground">
                Import existing resumes and more with our Pro plan
              </p>
            </div>
            <ProUpgradeButton />
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <label
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 transition-colors duration-200 cursor-pointer group",
                  isDragging
                    ? "border-violet-500 bg-violet-50/50"
                    : "border-violet-500/80 hover:border-violet-500 hover:bg-violet-50/10"
                )}
              >
                <input
                  type="file"
                  className="hidden"
                  accept="application/pdf"
                  onChange={handleFileInput}
                />
                <Upload className="w-10 h-10 text-violet-500 group-hover:scale-110 transition-transform duration-200" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Drop your PDF resume here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse files
                  </p>
                </div>
              </label>
              <div className="relative">
                <div className="absolute -top-3 left-3 bg-white px-2 text-sm text-muted-foreground">
                  Or paste your resume text here
                </div>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start pasting your resume content here..."
                  className="min-h-[100px] bg-white/50 border-black/40 focus:border-violet-500/40 focus:ring-violet-500/20 transition-all duration-300 pt-4"
                />
              </div>
            </div>
            {apiKeyError && (
              <div className="px-4 py-3 bg-red-50/50 border border-red-200/50 rounded-lg flex items-start gap-3 text-red-600 text-sm">
                <div className="p-1.5 rounded-full bg-red-100">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">API Key Required</p>
                  <p className="text-red-500/90">{apiKeyError}</p>
                  <div className="mt-2 flex flex-col gap-2 justify-start">
                    <div className="w-auto mx-auto">
                      <ProUpgradeButton />
                    </div>
                    <div className="text-center text-xs text-red-400">or</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50/50 w-auto mx-auto"
                      onClick={() => window.location.href = '/settings'}
                    >
                      Set API Keys in Settings
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-gray-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={isProcessing || !content.trim()}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Import'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 