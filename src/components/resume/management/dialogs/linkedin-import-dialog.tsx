'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Linkedin, FileText, AlertTriangle } from "lucide-react";
import { Resume } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { ProUpgradeButton } from "@/components/settings/pro-upgrade-button";
import { importLinkedInProfile } from "@/utils/actions/profiles/actions";
import { convertTextToResume } from "@/utils/actions/resumes/ai";
import { getSubscriptionStatus } from "@/utils/actions/stripe/actions";

interface LinkedInImportDialogProps {
  resume: Resume;
  onResumeChange: (field: keyof Resume, value: Resume[keyof Resume]) => void;
  trigger: React.ReactNode;
}

export function LinkedInImportDialog({
  resume,
  onResumeChange,
  trigger
}: LinkedInImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [profileData, setProfileData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(true); // For now, we'll assume Pro access

  const handleFetchProfile = async () => {
    if (!linkedinUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a LinkedIn profile URL",
        variant: "destructive",
      });
      return;
    }

    if (!isPro) {
      toast({
        title: "Pro Feature",
        description: "Please upgrade to Pro to import LinkedIn profiles.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setApiKeyError(null);
      
      const result = await importLinkedInProfile(linkedinUrl);
      
      if (!result.success) {
        if (result.error.includes('API key')) {
          setApiKeyError(result.error);
        } else {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
        }
        return;
      }
      
      // Format the JSON data for display
      setProfileData(JSON.stringify(result.data, null, 2));
      
      toast({
        title: "Success",
        description: "LinkedIn profile data retrieved successfully",
      });
    } catch (error: any) {
      console.error('Error fetching LinkedIn profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch LinkedIn profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profileData.trim()) {
      toast({
        title: "LinkedIn Data Required",
        description: "Please fetch or paste your LinkedIn profile data",
        variant: "destructive",
      });
      return;
    }

    if (!isPro) {
      toast({
        title: "Pro Feature",
        description: "Please upgrade to Pro to import LinkedIn profiles.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setApiKeyError(null);

      // Try to parse the LinkedIn data to validate JSON format
      JSON.parse(profileData);
      
      // Get model and API key from local storage
      const MODEL_STORAGE_KEY = 'Pretty_Resume-default-model';
      const LOCAL_STORAGE_KEY = 'Pretty_Resume-api-keys';
      const selectedModel = localStorage.getItem(MODEL_STORAGE_KEY);
      const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
      let apiKeys = [];
      try {
        apiKeys = storedKeys ? JSON.parse(storedKeys) : [];
      } catch (error) {
        console.error('Error parsing API keys:', error);
      }

      // Format the LinkedIn data with the URL
      const linkedinText = `LinkedIn Profile URL: ${linkedinUrl}\n\nLinkedIn Profile Data:\n${profileData}`;
      
      // Convert LinkedIn profile data to resume format using AI
      const convertedResume = await convertTextToResume(linkedinText, resume, resume.target_role || '', {
        model: selectedModel || '',
        apiKeys
      });
      
      // Update all the resume fields
      // This replaces the old simplified approach
      const fields: (keyof Resume)[] = [
        'first_name', 'last_name', 'email', 'phone_number', 'location',
        'website', 'linkedin_url', 'github_url', 'work_experience',
        'education', 'skills', 'projects'
      ];

      for (const field of fields) {
        if (convertedResume[field] !== undefined) {
          // @ts-ignore - We need to ignore type checking here since the resume fields have different types
          onResumeChange(field, convertedResume[field]);
        }
      }
      
      toast({
        title: "Success",
        description: "LinkedIn data imported to resume",
      });
      setOpen(false);
    } catch (error: any) {
      console.error('Error processing LinkedIn data:', error);
      
      if (error.message?.toLowerCase().includes('api key') || 
          error.message?.toLowerCase().includes('unauthorized') ||
          error.message?.toLowerCase().includes('invalid key') ||
          error.message?.toLowerCase().includes('invalid x-api-key')) {
        setApiKeyError("API key is invalid or missing. Please check your settings.");
      } else if (error.message?.includes('JSON')) {
        toast({
          title: "Invalid Format",
          description: "The LinkedIn profile data is not in a valid JSON format.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to process LinkedIn data",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add a useEffect for checking pro subscription
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const status = await getSubscriptionStatus();
        setIsPro(status?.subscription_plan?.toLowerCase() === 'pro');
      } catch (error) {
        console.error('Error checking subscription:', error);
        setIsPro(false);
      }
    };

    checkSubscription();
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] p-0 bg-gradient-to-b from-white to-gray-50">
        <div className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Linkedin className="w-5 h-5 text-blue-600" />
            Import from LinkedIn
          </DialogTitle>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="text-sm font-medium">
                LinkedIn Profile URL
              </div>
              <div className="flex gap-2">
                <Input
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/in/yourprofile"
                  className="flex-1"
                />
                <Button 
                  onClick={handleFetchProfile}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    'Fetch Profile'
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 italic">
                We'll extract information from your public LinkedIn profile.
                Make sure your profile is set to public visibility.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -top-3 left-3 bg-white px-2 text-sm text-muted-foreground">
                LinkedIn Profile Data (JSON)
              </div>
              <Textarea
                value={profileData}
                onChange={(e) => setProfileData(e.target.value)}
                placeholder="LinkedIn profile data will appear here after fetching, or you can manually paste your LinkedIn profile JSON data here..."
                className="min-h-[300px] bg-white/50 border-black/40 focus:border-blue-500/40 focus:ring-blue-500/20 transition-all duration-300 pt-4 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1 italic px-1">
                You can edit the data above, or paste your own LinkedIn profile JSON data from another source.
              </p>
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
        </div>

        <div className="flex justify-between p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!profileData.trim() || isLoading}
            className={cn(
              "bg-blue-600 hover:bg-blue-700",
              "disabled:bg-blue-300"
            )}
          >
            <FileText className="mr-2 h-4 w-4" />
            Import to Resume
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 