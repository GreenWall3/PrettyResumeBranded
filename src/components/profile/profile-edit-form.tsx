'use client';

import { Profile, WorkExperience, Education, Project } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User, Linkedin, Briefcase, GraduationCap, Wrench, FolderGit2, Upload, Save, Trash2} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { ProfileBasicInfoForm } from "@/components/profile/profile-basic-info-form";
import { ProfileWorkExperienceForm } from "@/components/profile/profile-work-experience-form";
import { ProfileProjectsForm } from "@/components/profile/profile-projects-form";
import { ProfileEducationForm } from "@/components/profile/profile-education-form";
import { ProfileSkillsForm } from "@/components/profile/profile-skills-form";
// import { ProfileEditorHeader } from "./profile-editor-header";
import { formatProfileWithAI } from "../../utils/actions/profiles/ai";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

import { ProUpgradeButton } from "@/components/settings/pro-upgrade-button";
import { AlertTriangle } from "lucide-react";
import { importResume, updateProfile } from "@/utils/actions/profiles/actions";

interface ProfileEditFormProps {
  profile: Profile;
}

export function ProfileEditForm({ profile: initialProfile }: ProfileEditFormProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
  const [isTextImportDialogOpen, setIsTextImportDialogOpen] = useState(false);
  const [resumeContent, setResumeContent] = useState("");
  const [textImportContent, setTextImportContent] = useState("");
  const [isProcessingResume, setIsProcessingResume] = useState(false);
  const [apiKeyError, setApiKeyError] = useState("");
  const router = useRouter();

  // Sync with server state when initialProfile changes
  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  // Add useEffect to clear error when dialogs close
  useEffect(() => {
    if (!isResumeDialogOpen && !isTextImportDialogOpen) {
      setApiKeyError("");
    }
  }, [isResumeDialogOpen, isTextImportDialogOpen]);

  const updateField = (field: keyof Profile, value: unknown) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await updateProfile(profile);
      toast.success("Changes saved successfully", {
        position: "bottom-right",
        className: "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none",
      });
      // Force a server revalidation
      router.refresh();
    } catch (error) {
      void error;
      toast.error("Unable to save your changes. Please try again.", {
        position: "bottom-right",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsResetting(true);
      // Reset to empty profile locally
      const resetProfile = {
        id: profile.id,
        user_id: profile.user_id,
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        location: '',
        website: '',
        linkedin_url: '',
        github_url: '',
        work_experience: [],
        education: [],
        skills: [],
        projects: [],
        created_at: profile.created_at,
        updated_at: profile.updated_at
      };
      
      // Update local state
      setProfile(resetProfile);
      
      // Save to database
      await updateProfile(resetProfile);
      
      toast.success("Profile reset successfully", {
        position: "bottom-right",
        className: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-none",
      });
      
      // Force a server revalidation
      router.refresh();
    } catch (error: unknown) {
      toast.error("Failed to reset profile. Please try again.", {
        position: "bottom-right",
      });
      console.error(error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleLinkedInImport = () => {
    toast.info("LinkedIn import feature coming soon!", {
      position: "bottom-right",
      className: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-none",
    });
  };

  const handleResumeUpload = async (content: string) => {
    try {
      setIsProcessingResume(true);
      
      // Get model and API key from local storage
      const MODEL_STORAGE_KEY = 'Pretty_Resume-default-model';
      const LOCAL_STORAGE_KEY = 'Pretty_Resume-api-keys';
      
      const selectedModel = localStorage.getItem(MODEL_STORAGE_KEY) || 'claude-3-sonnet-20240229';
      const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
      let apiKeys = [];
      
      try {
        apiKeys = storedKeys ? JSON.parse(storedKeys) : [];
      } catch (error) {
        console.error('Error parsing API keys:', error);
      }
      
      const result = await formatProfileWithAI(content, {
        model: selectedModel,
        apiKeys
      });
      
      if (result) {
        // Clean and transform the data to match our database schema
        const cleanedProfile: Partial<Profile> = {
          first_name: result.first_name || null,
          last_name: result.last_name || null,
          email: result.email || null,
          phone_number: result.phone_number || null,
          location: result.location || null,
          website: result.website || null,
          linkedin_url: result.linkedin_url || null,
          github_url: result.github_url || null,
          work_experience: Array.isArray(result.work_experience) 
            ? result.work_experience.map((exp: Partial<WorkExperience>) => ({
                company: exp.company || '',
                position: exp.position || '',
                location: exp.location || '',
                date: exp.date || '',
                description: Array.isArray(exp.description) 
                  ? exp.description 
                  : [exp.description || ''],
                technologies: Array.isArray(exp.technologies) 
                  ? exp.technologies 
                  : []
              }))
            : [],
          education: Array.isArray(result.education)
            ? result.education.map((edu: Partial<Education>) => ({
                school: edu.school || '',
                degree: edu.degree || '',
                field: edu.field || '',
                location: edu.location || '',
                date: edu.date || '',
                gpa: edu.gpa ? parseFloat(edu.gpa.toString()) : undefined,
                achievements: Array.isArray(edu.achievements) 
                  ? edu.achievements 
                  : []
              }))
            : [],
          skills: Array.isArray(result.skills)
            ? result.skills.map((skill: { category: string; skills?: string[]; items?: string[] }) => ({
                category: skill.category || '',
                items: Array.isArray(skill.skills) 
                  ? skill.skills 
                  : Array.isArray(skill.items) 
                    ? skill.items 
                    : []
              }))
            : [],
          projects: Array.isArray(result.projects)
            ? result.projects.map((proj: Partial<Project>) => ({
                name: proj.name || '',
                description: Array.isArray(proj.description) 
                  ? proj.description 
                  : [proj.description || ''],
                technologies: Array.isArray(proj.technologies) 
                  ? proj.technologies 
                  : [],
                url: proj.url || undefined,
                github_url: proj.github_url || undefined,
                date: proj.date || ''
              }))
            : []
        };
        
        await importResume(cleanedProfile);
        
        setProfile(prev => ({
          ...prev,
          ...cleanedProfile
        }));
        toast.success("Content imported successfully - Don't forget to save your changes", {
          position: "bottom-right",
          className: "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-none",
        });
        setIsResumeDialogOpen(false);
        setIsTextImportDialogOpen(false);
        setResumeContent("");
        setTextImportContent("");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Resume upload error:', error);
        if (error.message.toLowerCase().includes('api key')) {
          setApiKeyError(
            'API key required. Please add your OpenAI API key in settings or upgrade to our Pro Plan.'
          );
        } else {
          toast.error("Failed to process content: " + error.message, {
            position: "bottom-right",
          });
        }
      }
    } finally {
      setIsProcessingResume(false);
    }
  };

  return (
    <div className="relative mx-auto">
      

      {/* Action Bar */}
      <div className="z-50 mt-4">
        <div className="max-w-[2000px] mx-auto">
          <div className="mx-6 mb-6">
            <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg rounded-2xl p-2 px-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600" />
                <span className="text-xs font-medium text-muted-foreground">Profile Editor</span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Reset Profile Button */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="relative bg-white/50 hover:bg-white/60 border-rose-500/20 hover:border-rose-500/30 text-rose-600 transition-all duration-500 h-8 px-3 shadow-sm hover:shadow-md group"
                      disabled={isResetting}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/5 to-rose-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                      {isResetting ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          <span className="text-xs">Resetting</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          <span className="text-xs">Reset</span>
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="sm:max-w-[425px]">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset Profile</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to reset your profile? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleReset}
                        disabled={isResetting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isResetting ? "Resetting..." : "Reset Profile"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Save Button */}
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  size="sm"
                  className="relative bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 transition-all duration-500 shadow-md hover:shadow-lg hover:shadow-teal-500/20 h-8 px-3 group"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,#ffffff20_50%,transparent_100%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      <span className="text-xs">Saving</span>
                    </>
                  ) : (
                    <>
                      <Save className="mr-1.5 h-3.5 w-3.5" />
                      <span className="text-xs">Save</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content container with consistent styling */}
      <div className="relative px-6 md:px-8 lg:px-10 pb-10">
      
       {/* Import Actions Row (add back this feature code here (berhoua))*/}

        {/* Enhanced Tabs with smooth transitions and connected design */}
        <div className="relative ">
          {/* <div className="absolute inset-x-0 -top-3 h-8 bg-gradient-to-b from-white/60 to-transparent pointer-events-none"></div> */}
          <div className="relative ">
            <Tabs defaultValue="basic" className="w-full ">
              <TabsList className=" h-full relative bg-white/80  backdrop-blur-xl border border-white/40 rounded-xl overflow-x-auto flex whitespace-nowrap gap-2 shadow-lg">
                <TabsTrigger 
                  value="basic" 
                  className=" group flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium relative transition-all duration-300
                    data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500/10 data-[state=active]:to-cyan-500/10
                    data-[state=active]:border-teal-500/20 data-[state=active]:shadow-lg hover:bg-white/60
                    data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
                >
                  <div className="p-1.5 rounded-full bg-teal-100/80 transition-transform duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:bg-teal-100">
                    <User className="h-4 w-4 text-teal-600 transition-colors group-data-[state=inactive]:text-teal-500/70" />
                  </div>
                  <span className="relative">
                    Basic Info
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-teal-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="experience" 
                  className="group flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium relative transition-all duration-300
                    data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/10 data-[state=active]:to-blue-500/10
                    data-[state=active]:border-cyan-500/20 data-[state=active]:shadow-lg hover:bg-white/60
                    data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
                >
                  <div className="p-1.5 rounded-full bg-cyan-100/80 transition-transform duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:bg-cyan-100">
                    <Briefcase className="h-4 w-4 text-cyan-600 transition-colors group-data-[state=inactive]:text-cyan-500/70" />
                  </div>
                  <span className="relative">
                    Work Experience
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-cyan-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="projects" 
                  className="group flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium relative transition-all duration-300
                    data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/10 data-[state=active]:to-purple-500/10
                    data-[state=active]:border-violet-500/20 data-[state=active]:shadow-lg hover:bg-white/60
                    data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
                >
                  <div className="p-1.5 rounded-full bg-violet-100/80 transition-transform duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:bg-violet-100">
                    <FolderGit2 className="h-4 w-4 text-violet-600 transition-colors group-data-[state=inactive]:text-violet-500/70" />
                  </div>
                  <span className="relative">
                    Projects
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-violet-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="education" 
                  className="group flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium relative transition-all duration-300
                    data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/10 data-[state=active]:to-blue-500/10
                    data-[state=active]:border-indigo-500/20 data-[state=active]:shadow-lg hover:bg-white/60
                    data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
                >
                  <div className="p-1.5 rounded-full bg-indigo-100/80 transition-transform duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:bg-indigo-100">
                    <GraduationCap className="h-4 w-4 text-indigo-600 transition-colors group-data-[state=inactive]:text-indigo-500/70" />
                  </div>
                  <span className="relative">
                    Education
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-indigo-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="skills" 
                  className="group flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium relative transition-all duration-300
                    data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500/10 data-[state=active]:to-pink-500/10
                    data-[state=active]:border-rose-500/20 data-[state=active]:shadow-lg hover:bg-white/60
                    data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900"
                >
                  <div className="p-1.5 rounded-full bg-rose-100/80 transition-transform duration-300 group-data-[state=active]:scale-110 group-data-[state=active]:bg-rose-100">
                    <Wrench className="h-4 w-4 text-rose-600 transition-colors group-data-[state=inactive]:text-rose-500/70" />
                  </div>
                  <span className="relative">
                    Skills
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-rose-500 scale-x-0 transition-transform duration-300 group-data-[state=active]:scale-x-100"></div>
                  </span>
                </TabsTrigger>
               
              </TabsList>
              <div className="relative">
                {/* Content gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-white/10 to-white/20 pointer-events-none rounded-2xl"></div>
                
                {/* Tab content with consistent card styling */}
                <div className="relative space-y-6">
                  <TabsContent value="basic" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                    <Card className="bg-gradient-to-br from-white/50 via-white/40 to-white/50 backdrop-blur-xl border-white/40 shadow-xl transition-all duration-500 hover:shadow-2xl rounded-xl overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                      <div className="relative p-6">
                        <ProfileBasicInfoForm
                          profile={profile}
                          onChange={(field, value) => {
                            if (field in profile) {
                              updateField(field as keyof Profile, value);
                            }
                          }}
                        />
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="experience" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                    <Card className="bg-gradient-to-br from-white/50 via-white/40 to-white/50 backdrop-blur-xl border-white/40 shadow-2xl transition-all duration-500 hover:shadow-3xl rounded-2xl overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                      <div className="relative p-8">
                        <ProfileWorkExperienceForm
                          experiences={profile.work_experience}
                          onChange={(experiences) => updateField('work_experience', experiences)}
                        />
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="projects" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                    <Card className="bg-gradient-to-br from-white/50 via-white/40 to-white/50 backdrop-blur-xl border-white/40 shadow-2xl transition-all duration-500 hover:shadow-3xl rounded-2xl overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                      <div className="relative p-8">
                        <ProfileProjectsForm
                          projects={profile.projects}
                          onChange={(projects) => updateField('projects', projects)}
                        />
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="education" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                    <Card className="bg-gradient-to-br from-white/50 via-white/40 to-white/50 backdrop-blur-xl border-white/40 shadow-2xl transition-all duration-500 hover:shadow-3xl rounded-2xl overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                      <div className="relative p-8">
                        <ProfileEducationForm
                          education={profile.education}
                          onChange={(education) => updateField('education', education)}
                        />
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="skills" className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                    <Card className="bg-gradient-to-br from-white/50 via-white/40 to-white/50 backdrop-blur-xl border-white/40 shadow-2xl transition-all duration-500 hover:shadow-3xl rounded-2xl overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                      <div className="relative p-8">
                        <ProfileSkillsForm
                          skills={profile.skills}
                          onChange={(skills) => updateField('skills', skills)}
                        />
                      </div>
                    </Card>
                  </TabsContent>

                 
                </div>
              </div>
            </Tabs>
          </div>
          <div className="absolute inset-x-0 -bottom-3 h-8 bg-gradient-to-t from-white/60 to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
} 