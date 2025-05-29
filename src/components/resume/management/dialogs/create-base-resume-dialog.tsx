'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Profile, WorkExperience, Education, Skill, Project, Resume } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Loader2, FileText, Copy, Wand2, Plus, Upload, Crown, Linkedin, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { createBaseResume } from "@/utils/actions/resumes/actions";
import pdfToText from "react-pdftotext";
import { getSubscriptionStatus } from "@/utils/actions/stripe/actions";
import { importLinkedInProfile } from "@/utils/actions/profiles/actions";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { convertTextToResume } from "@/utils/actions/resumes/ai";
import { ApiErrorDialog } from "@/components/ui/api-error-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProUpgradeButton } from "@/components/settings/pro-upgrade-button";

interface CreateBaseResumeDialogProps {
  children: React.ReactNode;
  profile: Profile;
}

export function CreateBaseResumeDialog({ children, profile }: CreateBaseResumeDialogProps) {
  const [open, setOpen] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [importOption, setImportOption] = useState<'import-profile' | 'scratch' | 'import-resume' | 'import-linkedin'>('import-profile');
  const [isTargetRoleInvalid, setIsTargetRoleInvalid] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [isLoadingPro, setIsLoadingPro] = useState(true);
  const [selectedItems, setSelectedItems] = useState<{
    work_experience: string[];
    education: string[];
    skills: string[];
    projects: string[];
  }>({
    work_experience: [],
    education: [],
    skills: [],
    projects: []
  });
  const [resumeText, setResumeText] = useState('');
  const router = useRouter();
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState<{ title: string; description: string }>({
    title: "",
    description: ""
  });
  const [isDragging, setIsDragging] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [linkedinProfileData, setLinkedinProfileData] = useState('');
  const [isLoadingLinkedIn, setIsLoadingLinkedIn] = useState(false);

  const getItemId = (type: keyof typeof selectedItems, item: WorkExperience | Education | Skill | Project): string => {
    switch (type) {
      case 'work_experience':
        return `${(item as WorkExperience).company}-${(item as WorkExperience).position}-${(item as WorkExperience).date}`;
      case 'projects':
        return (item as Project).name;
      case 'education':
        return `${(item as Education).school}-${(item as Education).degree}-${(item as Education).field}`;
      case 'skills':
        return (item as Skill).category;
      default:
        return '';
    }
  };

  const handleItemSelection = (section: keyof typeof selectedItems, id: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [section]: prev[section].includes(id)
        ? prev[section].filter(x => x !== id)
        : [...prev[section], id]
    }));
  };

  const handleSectionSelection = (section: keyof typeof selectedItems, checked: boolean) => {
    setSelectedItems(prev => ({
      ...prev,
      [section]: checked 
        ? profile[section].map(item => getItemId(section, item))
        : []
    }));
  };

  const isSectionSelected = (section: keyof typeof selectedItems): boolean => {
    const sectionItems = profile[section].map(item => getItemId(section, item));
    return sectionItems.length > 0 && sectionItems.every(id => selectedItems[section].includes(id));
  };

  const isSectionPartiallySelected = (section: keyof typeof selectedItems): boolean => {
    const sectionItems = profile[section].map(item => getItemId(section, item));
    const selectedCount = sectionItems.filter(id => selectedItems[section].includes(id)).length;
    return selectedCount > 0 && selectedCount < sectionItems.length;
  };

  const handleCreate = async () => {
    if (!targetRole.trim()) {
      setIsTargetRoleInvalid(true);
      setTimeout(() => setIsTargetRoleInvalid(false), 820);
      toast({
        title: "Required Field Missing",
        description: "Target role is a required field. Please enter your target role.",
        variant: "destructive",
      });
      return;
    }

    if ((importOption === 'import-resume' || importOption === 'import-linkedin') && !isPro) {
      toast({
        title: "Pro Feature",
        description: "Please upgrade to Pro to import existing resumes.",
        variant: "destructive",
      });
      return;
    }

    if (importOption === 'import-linkedin' && !linkedinUrl.trim()) {
      toast({
        title: "LinkedIn URL Required",
        description: "Please enter your LinkedIn profile URL.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);

      if (importOption === 'import-resume') {
        if (!resumeText.trim()) {
          return;
        }

        // Create an empty resume to pass to convertTextToResume
        const emptyResume: Resume = {
          id: '',
          user_id: '',
          name: targetRole,
          target_role: targetRole,
          is_base_resume: true,
          first_name: '',
          last_name: '',
          email: '',
          work_experience: [],
          education: [],
          skills: [],
          projects: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          has_cover_letter: false,
        };

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


        try {
          const convertedResume = await convertTextToResume(resumeText, emptyResume, targetRole, {
            model: selectedModel || '',
            apiKeys
          });
          
          // Extract content sections and basic info for createBaseResume
          const selectedContent = {
            // Basic Info
            first_name: convertedResume.first_name || '',
            last_name: convertedResume.last_name || '',
            email: convertedResume.email || '',
            phone_number: convertedResume.phone_number,
            location: convertedResume.location,
            website: convertedResume.website,
            linkedin_url: convertedResume.linkedin_url,
            github_url: convertedResume.github_url,
            
            // Content Sections
            work_experience: convertedResume.work_experience || [],
            education: convertedResume.education || [],
            skills: convertedResume.skills || [],
            projects: convertedResume.projects || [],
          };
          
          const resume = await createBaseResume(
            targetRole,
            'import-resume',
            selectedContent as any
          );
          
          toast({
            title: "Success",
            description: "Resume created successfully",
          });

          router.push(`/resumes/${resume.id}`);
          setOpen(false);
          return;
        } catch (error: Error | unknown) {
          if (error instanceof Error && (
            error.message.toLowerCase().includes('api key') || 
            error.message.toLowerCase().includes('unauthorized') ||
            error.message.toLowerCase().includes('invalid key') ||
            error.message.toLowerCase().includes('invalid x-api-key')
          )) {
            setErrorMessage({
              title: "API Key Error",
              description: "There was an issue with your API key. Please check your settings and try again."
            });
          } else {
            setErrorMessage({
              title: "Error",
              description: "Failed to convert resume text. Please try again."
            });
          }
          setShowErrorDialog(true);
          setIsCreating(false);
          return;
        }
      }

      if (importOption === 'import-linkedin') {
        try {
          // Fetch LinkedIn profile data
          const result = await importLinkedInProfile(linkedinUrl);
          
          if (!result.success) {
            toast({
              title: "Error",
              description: result.error || "Failed to fetch LinkedIn profile",
              variant: "destructive",
            });
            setIsCreating(false);
            return;
          }

          // Create an empty resume to pass to convertTextToResume
          const emptyResume: Resume = {
            id: '',
            user_id: '',
            name: targetRole,
            target_role: targetRole,
            is_base_resume: true,
            first_name: '',
            last_name: '',
            email: '',
            work_experience: [],
            education: [],
            skills: [],
            projects: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            has_cover_letter: false,
          };

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
          const linkedinText = `LinkedIn Profile URL: ${linkedinUrl}\n\nLinkedIn Profile Data:\n${JSON.stringify(result.data, null, 2)}`;
          
          const convertedResume = await convertTextToResume(linkedinText, emptyResume, targetRole, {
            model: selectedModel || '',
            apiKeys
          });
          
          // Extract content sections and basic info for createBaseResume
          const selectedContent = {
            // Basic Info
            first_name: convertedResume.first_name || '',
            last_name: convertedResume.last_name || '',
            email: convertedResume.email || '',
            phone_number: convertedResume.phone_number,
            location: convertedResume.location,
            website: convertedResume.website,
            linkedin_url: convertedResume.linkedin_url || linkedinUrl,
            github_url: convertedResume.github_url,
            
            // Content Sections
            work_experience: convertedResume.work_experience || [],
            education: convertedResume.education || [],
            skills: convertedResume.skills || [],
            projects: convertedResume.projects || [],
          };
          
          const resume = await createBaseResume(
            targetRole,
            'import-resume',
            selectedContent as any
          );
          
          toast({
            title: "Success",
            description: "Resume created from LinkedIn profile",
          });

          router.push(`/resumes/${resume.id}`);
          setOpen(false);
          return;
        } catch (error: Error | unknown) {
          console.error('LinkedIn import error:', error);
          if (error instanceof Error && (
            error.message.toLowerCase().includes('api key') || 
            error.message.toLowerCase().includes('unauthorized') ||
            error.message.toLowerCase().includes('invalid key') ||
            error.message.toLowerCase().includes('invalid x-api-key')
          )) {
            setErrorMessage({
              title: "API Key Error",
              description: "There was an issue with your API key. Please check your settings and try again."
            });
          } else {
            setErrorMessage({
              title: "Error",
              description: "Failed to process LinkedIn profile data. Please try again."
            });
          }
          setShowErrorDialog(true);
          setIsCreating(false);
          return;
        }
      }

      const selectedContent = {
        work_experience: profile.work_experience.filter(exp => 
          selectedItems.work_experience.includes(getItemId('work_experience', exp))
        ),
        education: profile.education.filter(edu => 
          selectedItems.education.includes(getItemId('education', edu))
        ),
        skills: profile.skills.filter(skill => 
          selectedItems.skills.includes(getItemId('skills', skill))
        ),
        projects: profile.projects.filter(project => 
          selectedItems.projects.includes(getItemId('projects', project))
        ),
      };

      const resume = await createBaseResume(
        targetRole, 
        importOption === 'scratch' ? 'fresh' : 'import-profile',
        selectedContent
      );

      toast({
        title: "Success",
        description: "Resume created successfully",
      });

      router.push(`/resumes/${resume.id}`);
      setOpen(false);
    } catch (error) {
      console.error('Create resume error:', error);
      setErrorMessage({
        title: "Error",
        description: "Failed to create resume. Please try again."
      });
      setShowErrorDialog(true);
    } finally {
      setIsCreating(false);
    }
  };

  // Initialize all items as selected when dialog opens
  const initializeSelectedItems = () => {
    setSelectedItems({
      work_experience: profile.work_experience.map(exp => getItemId('work_experience', exp)),
      education: profile.education.map(edu => getItemId('education', edu)),
      skills: profile.skills.map(skill => getItemId('skills', skill)),
      projects: profile.projects.map(project => getItemId('projects', project))
    });
  };

  // Reset form and initialize selected items when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Move focus back to the trigger when closing
      const trigger = document.querySelector('[data-state="open"]');
      if (trigger) {
        (trigger as HTMLElement).focus();
      }
    }
    setOpen(newOpen);
    if (newOpen) {
      setTargetRole('');
      setImportOption('import-profile');
      initializeSelectedItems();
    }
  };

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

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === "application/pdf");

    if (pdfFile) {
      try {
        const text = await pdfToText(pdfFile);
        setResumeText(prev => prev + (prev ? "\n\n" : "") + text);
      } catch {
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
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      try {
        const text = await pdfToText(file);
        setResumeText(prev => prev + (prev ? "\n\n" : "") + text);
      } catch {
        toast({
          title: "PDF Processing Error",
          description: "Failed to extract text from the PDF. Please try again or paste the content manually.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFetchLinkedInProfile = async () => {
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
      setIsLoadingLinkedIn(true);
      
      const result = await importLinkedInProfile(linkedinUrl);
      
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch LinkedIn profile",
          variant: "destructive",
        });
        return;
      }
      
      // Format the JSON data for display
      setLinkedinProfileData(JSON.stringify(result.data, null, 2));
      
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
      setIsLoadingLinkedIn(false);
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className={cn(
        "sm:max-w-[800px] p-0 max-h-[90vh] overflow-y-auto w-[95vw]",
        "bg-gradient-to-b backdrop-blur-2xl border-white/40 shadow-2xl",
        "from-purple-50/95 to-indigo-50/90 border-purple-200/40",
        "rounded-xl"
      )}>
        <style jsx global>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
            20%, 40%, 60%, 80% { transform: translateX(2px); }
          }
          .shake {
            animation: shake 0.8s cubic-bezier(.36,.07,.19,.97) both;
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          .pulse {
            animation: pulse 2s infinite ease-in-out;
          }
          
          .card-hover-effect {
            transition: all 0.3s ease;
          }
          .card-hover-effect:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px -5px rgba(124, 58, 237, 0.1), 0 6px 8px -5px rgba(124, 58, 237, 0.04);
          }

          /* Make modal scrollbar thinner and custom styled */
          .scrollbar-thin::-webkit-scrollbar {
            width: 4px;
          }
          .scrollbar-thin::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background: #c4b5fd;
            border-radius: 10px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: #a78bfa;
          }
        `}</style>
        {/* Header Section */}
        <div className={cn(
          "relative px-3 sm:px-6 pt-5 pb-3 top-0 z-10",
          "bg-gradient-to-r from-purple-600 to-indigo-600 text-white",
          "rounded-t-xl"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-xl transition-all duration-300",
              "bg-white/20 backdrop-blur-md border border-white/30"
            )}>
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-white">
                Create Base Resume
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-white/80">
                Create a new base resume template
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-3 sm:px-6 py-4 space-y-4 bg-gradient-to-b from-white to-purple-50/30 scrollbar-thin">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label 
                htmlFor="target-role"
                className="text-sm sm:text-base font-medium text-purple-800"
              >
                Target Role <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="target-role"
                  placeholder="e.g., Senior Software Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className={cn(
                    "bg-white/90 border h-10 text-sm rounded-lg shadow-sm",
                    "focus:border-purple-500 focus:ring-purple-500/20 placeholder:text-gray-400",
                    "pl-3 pr-9 transition-all duration-300",
                    isTargetRoleInvalid ? "border-red-500 shake" : "border-purple-200/60 hover:border-purple-300"
                  )}
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400">
                  <FileText className="h-4 w-4" />
                </div>
              </div>
              <p className="text-xs text-purple-600 italic pl-1">
                This role will be used to optimize your resume
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-purple-200 pb-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                <Label className="text-xs sm:text-sm font-semibold text-purple-800">
                  Resume Content
                </Label>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <input
                    type="radio"
                    id="import-profile"
                    name="importOption"
                    value="import-profile"
                    checked={importOption === 'import-profile'}
                    onChange={(e) => setImportOption(e.target.value as 'import-profile' | 'scratch' | 'import-resume' | 'import-linkedin')}
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor="import-profile"
                    className={cn(
                      "flex items-center h-auto sm:h-[80px] rounded-lg p-3",
                      "bg-white border shadow-sm card-hover-effect",
                      "transition-all duration-300 cursor-pointer overflow-hidden relative",
                      "peer-checked:border-purple-500 peer-checked:bg-purple-50",
                      "peer-checked:shadow-md peer-checked:shadow-purple-100",
                      "hover:border-purple-300"
                    )}
                  >
                    {importOption === 'import-profile' && (
                      <div className="absolute -right-2 -top-2 bg-purple-500 text-white p-1 rounded-bl-lg rounded-tr-lg shadow-md">
                        <div className="text-[10px] font-medium px-1">Selected</div>
                      </div>
                    )}
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-100 to-indigo-200 border border-purple-200 flex items-center justify-center shrink-0 shadow-md">
                      <Copy className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="ml-2 flex flex-col">
                      <div className="font-semibold text-xs text-purple-900">Import from Profile</div>
                      <span className="text-xs text-gray-600 mt-0.5 hidden sm:inline-block">
                        Import your experience and skills
                      </span>
                    </div>
                  </Label>
                </div>

                <div>
                  <input
                    type="radio"
                    id="import-linkedin"
                    name="importOption"
                    value="import-linkedin"
                    checked={importOption === 'import-linkedin'}
                    onChange={(e) => setImportOption(e.target.value as 'import-profile' | 'scratch' | 'import-resume' | 'import-linkedin')}
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor="import-linkedin"
                    className={cn(
                      "flex items-center h-auto sm:h-[80px] rounded-lg p-3",
                      "bg-white border shadow-sm card-hover-effect",
                      "transition-all duration-300 cursor-pointer overflow-hidden relative",
                      "peer-checked:border-purple-500 peer-checked:bg-purple-50",
                      "peer-checked:shadow-md peer-checked:shadow-purple-100",
                      "hover:border-purple-300"
                    )}
                  >
                    {importOption === 'import-linkedin' && (
                      <div className="absolute -right-2 -top-2 bg-purple-500 text-white p-1 rounded-bl-lg rounded-tr-lg shadow-md">
                        <div className="text-[10px] font-medium px-1">Selected</div>
                      </div>
                    )}
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-200 flex items-center justify-center shrink-0 shadow-md">
                      <Linkedin className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="ml-2 flex flex-col">
                      <div className="font-semibold text-xs text-purple-900">Import from LinkedIn</div>
                      <span className="text-xs text-gray-600 mt-0.5 hidden sm:inline-block">
                        Paste your LinkedIn URL
                      </span>
                    </div>
                  </Label>
                </div>

                <div>
                  <input
                    type="radio"
                    id="import-resume"
                    name="importOption"
                    value="import-resume"
                    checked={importOption === 'import-resume'}
                    onChange={(e) => isPro && setImportOption(e.target.value as 'import-profile' | 'scratch' | 'import-resume' | 'import-linkedin')}
                    className="sr-only peer"
                    disabled={!isPro}
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label
                          htmlFor="import-resume"
                          className={cn(
                            "flex items-center h-auto sm:h-[80px] rounded-lg p-3 relative",
                            "bg-white border shadow-sm",
                            isPro ? [
                              "card-hover-effect",
                              "transition-all duration-300 cursor-pointer",
                              "peer-checked:border-purple-500 peer-checked:bg-purple-50",
                              "peer-checked:shadow-md peer-checked:shadow-purple-100",
                              "hover:border-purple-300"
                            ] : [
                              "opacity-75 cursor-not-allowed",
                              "border-gray-200 bg-gray-50"
                            ],
                            importOption === 'import-resume' && "border-purple-500 bg-purple-50"
                          )}
                        >
                          {importOption === 'import-resume' && isPro && (
                            <div className="absolute -right-2 -top-2 bg-purple-500 text-white p-1 rounded-bl-lg rounded-tr-lg shadow-md">
                              <div className="text-[10px] font-medium px-1">Selected</div>
                            </div>
                          )}
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 border border-pink-200 flex items-center justify-center shrink-0 shadow-md">
                            <Plus className="h-4 w-4 text-pink-600" />
                          </div>
                          <div className="ml-2 flex flex-col">
                            <div className="font-semibold text-xs text-purple-900 flex items-center gap-1">
                              Import from Resume
                              {!isPro && (
                                <Badge variant="outline" className="bg-orange-50 text-orange-600 border border-orange-200 text-[9px] h-3.5">
                                  <Crown className="w-2.5 h-2.5 mr-0.5" />
                                  PRO
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-gray-600 mt-0.5 hidden sm:inline-block">
                              Paste your existing resume
                            </span>
                          </div>
                        </Label>
                      </TooltipTrigger>
                      {!isPro && (
                        <TooltipContent side="top" className="bg-orange-50 border-orange-200 max-w-[200px] text-center shadow-lg">
                          <p className="text-orange-600 text-xs font-medium">Upgrade to Pro to import existing resumes</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div>
                  <input
                    type="radio"
                    id="scratch"
                    name="importOption"
                    value="scratch"
                    checked={importOption === 'scratch'}
                    onChange={(e) => setImportOption(e.target.value as 'import-profile' | 'scratch' | 'import-resume' | 'import-linkedin')}
                    className="sr-only peer"
                  />
                  <Label
                    htmlFor="scratch"
                    className={cn(
                      "flex items-center h-auto sm:h-[80px] rounded-lg p-3",
                      "bg-white border shadow-sm card-hover-effect",
                      "transition-all duration-300 cursor-pointer overflow-hidden relative",
                      "peer-checked:border-purple-500 peer-checked:bg-purple-50",
                      "peer-checked:shadow-md peer-checked:shadow-purple-100",
                      "hover:border-purple-300"
                    )}
                  >
                    {importOption === 'scratch' && (
                      <div className="absolute -right-2 -top-2 bg-purple-500 text-white p-1 rounded-bl-lg rounded-tr-lg shadow-md">
                        <div className="text-[10px] font-medium px-1">Selected</div>
                      </div>
                    )}
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 border border-indigo-200 flex items-center justify-center shrink-0 shadow-md">
                      <Wand2 className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="ml-2 flex flex-col">
                      <div className="font-semibold text-xs text-purple-900">Start Fresh</div>
                      <span className="text-xs text-gray-600 mt-0.5 hidden sm:inline-block">
                        Create a blank resume
                      </span>
                    </div>
                  </Label>
                </div>
              </div>

              {importOption === 'import-linkedin' && (
                <div className="mt-4 space-y-3 bg-white rounded-lg p-3 border border-purple-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Linkedin className="h-4 w-4 text-blue-600" />
                    <h3 className="text-xs font-semibold text-purple-900">LinkedIn Profile URL</h3>
                  </div>
                  
                  <div className="relative">
                    
                    <Input
                      id="linkedin-url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://www.linkedin.com/in/yourprofile"
                      className="pt-3 text-sm bg-white border border-purple-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-lg flex-1 h-10"
                    />
                  </div>
                  
                  <div className="flex items-start mt-3 bg-blue-50 p-2 rounded-lg border border-blue-100">
                    <div className="text-blue-600 mr-1.5 mt-0.5 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 16v-4"></path>
                        <path d="M12 8h.01"></path>
                      </svg>
                    </div>
                    <div className="text-xs text-blue-700">
                      We'll extract information from your public LinkedIn profile to create your resume. Make sure your profile is set to public visibility.
                    </div>
                  </div>
                  
                  {!isPro && (
                    <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-700 text-xs">
                      <div className="p-1 rounded-full bg-amber-100 flex-shrink-0">
                        <Crown className="w-3 h-3 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Pro Feature</p>
                        <p className="text-amber-600/90 text-xs">LinkedIn import is available for Pro users.</p>
                        <div className="mt-1.5">
                          <ProUpgradeButton />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {importOption === 'import-profile' && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Left Column */}
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg border border-purple-100 shadow-sm overflow-hidden">
                      <Accordion type="single" collapsible className="space-y-0">
                        {/* Work Experience */}
                        <AccordionItem value="work-experience" className="border-0 border-b border-purple-100">
                          <div className="flex items-center w-full gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-white">
                            <Checkbox
                              id="work-experience-section"
                              checked={isSectionSelected('work_experience')}
                              onCheckedChange={(checked) => handleSectionSelection('work_experience', checked as boolean)}
                              className={cn(
                                "h-3.5 w-3.5 rounded border-purple-400",
                                isSectionPartiallySelected('work_experience') && "data-[state=checked]:bg-purple-600/50"
                              )}
                            />
                            <AccordionTrigger className="w-full py-0.5 hover:no-underline group">
                              <div className="flex flex-col items-start w-full">
                                <span className="text-xs font-semibold text-purple-800 group-hover:text-purple-900">
                                  Work Experience
                                </span>
                                <span className="text-[10px] text-purple-500">
                                  {profile.work_experience.length} {profile.work_experience.length === 1 ? 'position' : 'positions'}
                                </span>
                              </div>
                            </AccordionTrigger>
                          </div>
                          <AccordionContent className="pb-0">
                            <div className="space-y-1.5 p-1.5 max-h-[240px] overflow-y-auto scrollbar-thin">
                              {profile.work_experience.map((exp: WorkExperience) => {
                                const id = getItemId('work_experience', exp);
                                return (
                                  <div
                                    key={id}
                                    className={cn(
                                      "flex items-start space-x-2 p-2 rounded-lg",
                                      "border border-gray-200 bg-white hover:bg-purple-50/50 transition-colors",
                                      selectedItems.work_experience.includes(id) && "bg-purple-50 border-purple-200"
                                    )}
                                  >
                                    <Checkbox
                                      id={id}
                                      checked={selectedItems.work_experience.includes(id)}
                                      onCheckedChange={() => handleItemSelection('work_experience', id)}
                                      className="mt-0.5 h-3.5 w-3.5 rounded border-purple-400"
                                    />
                                    <div 
                                      className="flex-1 cursor-pointer"
                                      onClick={() => handleItemSelection('work_experience', id)}
                                    >
                                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                                        <div className="font-medium text-xs text-purple-900">{exp.position}</div>
                                        <div className="text-[10px] text-purple-600 mt-0.5 sm:mt-0">{exp.date}</div>
                                      </div>
                                      <div className="text-[10px] text-gray-600">{exp.company}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Skills */}
                        <AccordionItem value="skills" className="border-0">
                          <div className="flex items-center w-full gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-white">
                            <Checkbox
                              id="skills-section"
                              checked={isSectionSelected('skills')}
                              onCheckedChange={(checked) => handleSectionSelection('skills', checked as boolean)}
                              className={cn(
                                "h-3.5 w-3.5 rounded border-purple-400",
                                isSectionPartiallySelected('skills') && "data-[state=checked]:bg-purple-600/50"
                              )}
                            />
                            <AccordionTrigger className="w-full py-0.5 hover:no-underline group">
                              <div className="flex flex-col items-start w-full">
                                <span className="text-xs font-semibold text-purple-800 group-hover:text-purple-900">
                                  Skills
                                </span>
                                <span className="text-[10px] text-purple-500">
                                  {profile.skills.length} {profile.skills.length === 1 ? 'category' : 'categories'}
                                </span>
                              </div>
                            </AccordionTrigger>
                          </div>
                          <AccordionContent className="pb-0">
                            <div className="space-y-1.5 p-1.5 max-h-[240px] overflow-y-auto scrollbar-thin">
                              {profile.skills.map((skill: Skill) => {
                                const id = getItemId('skills', skill);
                                return (
                                  <div
                                    key={id}
                                    className={cn(
                                      "flex items-start space-x-2 p-2 rounded-lg",
                                      "border border-gray-200 bg-white hover:bg-purple-50/50 transition-colors",
                                      selectedItems.skills.includes(id) && "bg-purple-50 border-purple-200"
                                    )}
                                  >
                                    <Checkbox
                                      id={id}
                                      checked={selectedItems.skills.includes(id)}
                                      onCheckedChange={() => handleItemSelection('skills', id)}
                                      className="mt-0.5 h-3.5 w-3.5 rounded border-purple-400"
                                    />
                                    <div 
                                      className="flex-1 cursor-pointer"
                                      onClick={() => handleItemSelection('skills', id)}
                                    >
                                      <div className="font-medium text-xs mb-1 text-purple-900">{skill.category}</div>
                                      <div className="flex flex-wrap gap-1">
                                        {skill.items.map((item: string, index: number) => (
                                          <Badge
                                            key={index}
                                            variant="secondary"
                                            className="bg-white text-purple-700 border border-purple-200 text-[9px] px-1.5 py-0 mb-0.5"
                                          >
                                            {item}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg border border-purple-100 shadow-sm overflow-hidden">
                      <Accordion type="single" collapsible className="space-y-0">
                        {/* Projects */}
                        <AccordionItem value="projects" className="border-0 border-b border-purple-100">
                          <div className="flex items-center w-full gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-white">
                            <Checkbox
                              id="projects-section"
                              checked={isSectionSelected('projects')}
                              onCheckedChange={(checked) => handleSectionSelection('projects', checked as boolean)}
                              className={cn(
                                "h-3.5 w-3.5 rounded border-purple-400",
                                isSectionPartiallySelected('projects') && "data-[state=checked]:bg-purple-600/50"
                              )}
                            />
                            <AccordionTrigger className="w-full py-0.5 hover:no-underline group">
                              <div className="flex flex-col items-start w-full">
                                <span className="text-xs font-semibold text-purple-800 group-hover:text-purple-900">
                                  Projects
                                </span>
                                <span className="text-[10px] text-purple-500">
                                  {profile.projects.length} {profile.projects.length === 1 ? 'project' : 'projects'}
                                </span>
                              </div>
                            </AccordionTrigger>
                          </div>
                          <AccordionContent className="pb-0">
                            <div className="space-y-1.5 p-1.5 max-h-[240px] overflow-y-auto scrollbar-thin">
                              {profile.projects.map((project: Project) => {
                                const id = getItemId('projects', project);
                                return (
                                  <div
                                    key={id}
                                    className={cn(
                                      "flex items-start space-x-2 p-2 rounded-lg",
                                      "border border-gray-200 bg-white hover:bg-purple-50/50 transition-colors",
                                      selectedItems.projects.includes(id) && "bg-purple-50 border-purple-200"
                                    )}
                                  >
                                    <Checkbox
                                      id={id}
                                      checked={selectedItems.projects.includes(id)}
                                      onCheckedChange={() => handleItemSelection('projects', id)}
                                      className="mt-0.5 h-3.5 w-3.5 rounded border-purple-400"
                                    />
                                    <div 
                                      className="flex-1 cursor-pointer"
                                      onClick={() => handleItemSelection('projects', id)}
                                    >
                                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                                        <div className="font-medium text-xs text-purple-900">{project.name}</div>
                                        {project.date && (
                                          <div className="text-[10px] text-purple-600 mt-0.5 sm:mt-0">{project.date}</div>
                                        )}
                                      </div>
                                      {project.technologies && (
                                        <div className="text-[10px] text-gray-600 line-clamp-1">
                                          {project.technologies.join(', ')}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Education */}
                        <AccordionItem value="education" className="border-0">
                          <div className="flex items-center w-full gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-white">
                            <Checkbox
                              id="education-section"
                              checked={isSectionSelected('education')}
                              onCheckedChange={(checked) => handleSectionSelection('education', checked as boolean)}
                              className={cn(
                                "h-3.5 w-3.5 rounded border-purple-400",
                                isSectionPartiallySelected('education') && "data-[state=checked]:bg-purple-600/50"
                              )}
                            />
                            <AccordionTrigger className="w-full py-0.5 hover:no-underline group">
                              <div className="flex flex-col items-start w-full">
                                <span className="text-xs font-semibold text-purple-800 group-hover:text-purple-900">
                                  Education
                                </span>
                                <span className="text-[10px] text-purple-500">
                                  {profile.education.length} {profile.education.length === 1 ? 'institution' : 'institutions'}
                                </span>
                              </div>
                            </AccordionTrigger>
                          </div>
                          <AccordionContent className="pb-0">
                            <div className="space-y-1.5 p-1.5 max-h-[240px] overflow-y-auto scrollbar-thin">
                              {profile.education.map((edu: Education) => {
                                const id = getItemId('education', edu);
                                return (
                                  <div
                                    key={id}
                                    className={cn(
                                      "flex items-start space-x-2 p-2 rounded-lg",
                                      "border border-gray-200 bg-white hover:bg-purple-50/50 transition-colors",
                                      selectedItems.education.includes(id) && "bg-purple-50 border-purple-200"
                                    )}
                                  >
                                    <Checkbox
                                      id={id}
                                      checked={selectedItems.education.includes(id)}
                                      onCheckedChange={() => handleItemSelection('education', id)}
                                      className="mt-0.5 h-3.5 w-3.5 rounded border-purple-400"
                                    />
                                    <div 
                                      className="flex-1 cursor-pointer"
                                      onClick={() => handleItemSelection('education', id)}
                                    >
                                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                                        <div className="font-medium text-xs text-purple-900">{`${edu.degree} in ${edu.field}`}</div>
                                        <div className="text-[10px] text-purple-600 mt-0.5 sm:mt-0">{edu.date}</div>
                                      </div>
                                      <div className="text-[10px] text-gray-600">{edu.school}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                </div>
              )}

              {importOption === 'import-resume' && (
                <div className="mt-4 space-y-3 bg-white rounded-lg p-3 border border-purple-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-pink-600" />
                    <h3 className="text-xs font-semibold text-purple-900">Resume Import</h3>
                  </div>
                  
                  <label
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 cursor-pointer group",
                      isDragging
                        ? "border-purple-500 bg-purple-50"
                        : "border-purple-200 hover:border-purple-500 hover:bg-purple-50/30"
                    )}
                  >
                    <input
                      type="file"
                      className="hidden"
                      accept="application/pdf"
                      onChange={handleFileInput}
                    />
                    <div className="p-2 rounded-full bg-pink-50 border border-pink-100 group-hover:scale-110 transition-transform duration-200">
                      <Upload className="w-6 h-6 text-pink-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-purple-900">
                        Drop your PDF resume here
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        or click to browse files
                      </p>
                    </div>
                  </label>
                  
                  <div className="relative mt-3">
                    <div className="absolute -top-2 left-2 bg-white px-1.5 text-xs font-medium text-purple-600">
                      Or paste your resume text here
                    </div>
                    <Textarea
                      id="resume-text"
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Start pasting your resume content here..."
                      className="min-h-[150px] bg-white border border-purple-200 focus:border-purple-500 focus:ring-purple-500/20 pt-3 rounded-lg text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Dialog */}
        <ApiErrorDialog
          open={showErrorDialog}
          onOpenChange={setShowErrorDialog}
          errorMessage={errorMessage}
          onUpgrade={() => {
            setShowErrorDialog(false);
            window.location.href = '/subscription';
          }}
          onSettings={() => {
            setShowErrorDialog(false);
            window.location.href = '/settings';
          }}
        />

        {/* Footer Section */}
        <div className={cn(
          "px-3 sm:px-6 py-3 border-t sticky bottom-0 z-10",
          "bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.03)]",
          "rounded-b-xl"
        )}>
          <div className="flex flex-row justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className={cn(
                "border border-gray-200 text-gray-600 rounded-lg h-9 text-sm",
                "hover:bg-white hover:text-purple-700",
                "hover:border-purple-300 transition-all duration-300"
              )}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={isCreating}
              className={cn(
                "text-white shadow-md hover:shadow-lg h-9 rounded-lg text-sm",
                "bg-gradient-to-r from-purple-600 to-indigo-600",
                "hover:from-purple-700 hover:to-indigo-700",
                "transition-all duration-300 transform hover:scale-[1.02]",
                "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              )}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Resume'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 