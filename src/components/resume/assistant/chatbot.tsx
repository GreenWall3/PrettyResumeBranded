'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useChat } from 'ai/react';
import { Card } from "@/components/ui/card";
import { Bot, Trash2, Pencil, ChevronDown, RefreshCw, Sparkles, MessageSquareQuote, X, ArrowUp } from "lucide-react";
import { Education, Project, Resume, Skill, WorkExperience, Job } from '@/lib/types';
import { Message } from 'ai';
import { cn } from '@/lib/utils';
import { ToolInvocation } from 'ai';
import { MemoizedMarkdown } from '@/components/ui/memoized-markdown';
import { Suggestion } from './suggestions';
import { SuggestionSkeleton } from './suggestion-skeleton';
import ChatInput from './chat-input';
import { LoadingDots } from '@/components/ui/loading-dots';
import { ApiKey } from '@/utils/ai-tools';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { WholeResumeSuggestion } from './suggestions';
import { QuickSuggestions } from './quick-suggestions';
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ApiKeyErrorAlert } from '@/components/ui/api-key-error-alert';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';

const LOCAL_STORAGE_KEY = 'Pretty_Resume-api-keys';
const MODEL_STORAGE_KEY = 'Pretty_Resume-default-model';

interface ChatBotProps {
  resume: Resume;
  onResumeChange: (field: keyof Resume, value: Resume[typeof field]) => void;
  job?: Job | null;
}

function ScrollToBottom() {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  return (
    <AnimatePresence>
      {!isAtBottom && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "absolute z-50 rounded-full p-2.5",
            "bg-gradient-to-r from-purple-500 to-indigo-500",
            "text-white",
            "shadow-lg shadow-purple-500/20",
            "transition-all duration-300",
            "hover:shadow-xl hover:shadow-purple-500/30",
            "hover:-translate-y-0.5 hover:scale-105",
            "left-[50%] translate-x-[-50%] bottom-4"
          )}
          onClick={() => scrollToBottom()}
        >
          <ArrowUp className="h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function ChatBot({ resume, onResumeChange, job }: ChatBotProps) {
  const router = useRouter();
  const [accordionValue, setAccordionValue] = React.useState<string>("");
  const [apiKeys, setApiKeys] = React.useState<ApiKey[]>([]);
  const [defaultModel, setDefaultModel] = React.useState<string>('gpt-4o-mini');
  const [originalResume, setOriginalResume] = React.useState<Resume | null>(null);
  const [isInitialLoading, setIsInitialLoading] = React.useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [showBubbleAnimation, setShowBubbleAnimation] = React.useState(true);

  // Load settings from local storage
  useEffect(() => {
    const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
    const storedModel = localStorage.getItem(MODEL_STORAGE_KEY);
    
    if (storedKeys) {
      try {
        setApiKeys(JSON.parse(storedKeys));
      } catch (error) {
        console.error('Error loading API keys:', error);
      }
    }

    if (storedModel) {
      setDefaultModel(storedModel);
    }
    
    // Hide bubble animation after 3 seconds
    const timer = setTimeout(() => {
      setShowBubbleAnimation(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const config = {
    model: defaultModel,
    apiKeys,
  };
  
  const { messages, error, append, isLoading, addToolResult, stop, setMessages } = useChat({
    api: '/api/chat',
    body: {
      target_role: resume.target_role,
      resume: resume,
      config,
      job: job,
    },
    maxSteps: 5,
    onResponse() {
 
      setIsInitialLoading(false);
    },
    onError() {
      setIsInitialLoading(false);
    },
    async onToolCall({ toolCall }) {
      // setIsStreaming(false);
      
      if (toolCall.toolName === 'getResume') {
        const params = toolCall.args as { sections: string[] };
        
        const personalInfo = {
          first_name: resume.first_name,
          last_name: resume.last_name,
          email: resume.email,
          phone_number: resume.phone_number,
          location: resume.location,
          website: resume.website,
          linkedin_url: resume.linkedin_url,
          github_url: resume.github_url,
        };

        const sectionMap = {
          personal_info: personalInfo,
          work_experience: resume.work_experience,
          education: resume.education,
          skills: resume.skills,
          projects: resume.projects,
        };

        const result = params.sections.includes('all')
          ? { ...sectionMap, target_role: resume.target_role }
          : params.sections.reduce((acc, section) => ({
              ...acc,
              [section]: sectionMap[section as keyof typeof sectionMap]
            }), {});
        
        addToolResult({ toolCallId: toolCall.toolCallId, result });
        console.log('Tool call READ RESUME result:', result);
        return result;
      }

      if (toolCall.toolName === 'suggest_work_experience_improvement') {
        return toolCall.args;
      }

      if (toolCall.toolName === 'suggest_project_improvement') {
        return toolCall.args;
      }

      if (toolCall.toolName === 'suggest_skill_improvement') {
        return toolCall.args;
      }

      if (toolCall.toolName === 'suggest_education_improvement') {
        return toolCall.args;
      }

      if (toolCall.toolName === 'modifyWholeResume') {
        const updates = toolCall.args as {
          basic_info?: Partial<{
            first_name: string;
            last_name: string;
            email: string;
            phone_number: string;
            location: string;
            website: string;
            linkedin_url: string;
            github_url: string;
          }>;
          work_experience?: WorkExperience[];
          education?: Education[];
          skills?: Skill[];
          projects?: Project[];
        };
        
        // Store the current resume state before applying updates
        setOriginalResume({ ...resume });
        
        // Apply updates as before
        if (updates.basic_info) {
          Object.entries(updates.basic_info).forEach(([key, value]) => {
            if (value !== undefined) {
              onResumeChange(key as keyof Resume, value);
            }
          });
        }

        const sections = {
          work_experience: updates.work_experience,
          education: updates.education,
          skills: updates.skills,
          projects: updates.projects,
        };

        Object.entries(sections).forEach(([key, value]) => {
          if (value !== undefined) {
            onResumeChange(key as keyof Resume, value);
          }
        });

        return (
          <div key={toolCall.toolCallId} className="mt-2 w-[90%]">
            <WholeResumeSuggestion
              onReject={() => {
                // Restore the original resume state
                if (originalResume) {
                  // Restore basic info
                  Object.keys(originalResume).forEach((key) => {
                    if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
                      onResumeChange(key as keyof Resume, originalResume[key as keyof Resume]);
                    }
                  });
                  
                  // Clear the stored original state
                  setOriginalResume(null);
                }
              }}
            />
          </div>
        );
      }
    },
    onFinish() {
      setIsInitialLoading(false);
    },
    // onResponse(response) {
    //   setIsStreaming(true);
    // },
  });

  // Memoize the submit handler
  const handleSubmit = useCallback((message: string) => {
  
    
    setIsInitialLoading(true);
    append({ 
      content: message.replace(/\s+$/, ''), // Extra safety: trim trailing whitespace
      role: 'user' 
    });
    
    
    setAccordionValue("chat");
  }, [append]);

  // Add delete handler
  const handleDelete = (id: string) => {
    setMessages(messages.filter(message => message.id !== id));
  };

  // Add edit handler
  const handleEdit = (id: string, content: string) => {
    setEditingMessageId(id);
    setEditContent(content);
  };

  // Add save handler
  const handleSaveEdit = (id: string) => {
    setMessages(messages.map(message => 
      message.id === id 
        ? { ...message, content: editContent }
        : message
    ));
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setOriginalResume(null);
    setEditingMessageId(null);
    setEditContent("");
  }, [setMessages]);

  return (
    <Card className={cn(
      "flex flex-col w-[95%] mx-auto",
      "bg-gradient-to-br from-white/90 via-purple-50/50 to-indigo-50/50",
      "border border-purple-200/70",
      "shadow-lg shadow-purple-500/5",
      "transition-all duration-500",
      "hover:shadow-xl hover:shadow-purple-500/10",
      "overflow-hidden",
      "relative",
      "rounded-2xl",
      "data-[state=closed]:shadow-md data-[state=closed]:border data-[state=closed]:border-purple-200/40",
      "ml-0"
    )}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-purple-500/5 blur-2xl" />
        <div className="absolute top-1/2 -left-24 w-36 h-36 rounded-full bg-indigo-500/5 blur-2xl" />
        
        {showBubbleAnimation && (
          <>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ 
                y: [20, -40, -30, -50],
                opacity: [0, 0.7, 0.5, 0]
              }}
              transition={{ duration: 4, ease: "easeOut" }}
              className="absolute bottom-20 left-[20%] w-4 h-4 rounded-full bg-purple-400/20"
            />
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ 
                y: [20, -60, -50, -80],
                opacity: [0, 0.5, 0.3, 0]
              }}
              transition={{ duration: 5, delay: 0.5, ease: "easeOut" }}
              className="absolute bottom-30 left-[70%] w-6 h-6 rounded-full bg-indigo-400/20"
            />
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ 
                y: [20, -30, -20, -40],
                opacity: [0, 0.6, 0.4, 0]
              }}
              transition={{ duration: 3.5, delay: 1, ease: "easeOut" }}
              className="absolute bottom-10 left-[40%] w-3 h-3 rounded-full bg-purple-400/20"
            />
          </>
        )}
      </div>

      <Accordion
        type="single"
        collapsible
        value={accordionValue}
        onValueChange={setAccordionValue}
        className="relative z-10"
      >
        <AccordionItem value="chat" className="border-none py-0 my-0">

          {/* Accordion Trigger */}
          <div className="relative">
            <AccordionTrigger className={cn(
              "px-4 py-3",
              "hover:no-underline",
              "group",
              "transition-all duration-300",
              "data-[state=open]:border-b border-purple-200/60",
              "data-[state=closed]:opacity-90 data-[state=closed]:hover:opacity-100",
              "data-[state=closed]:py-2.5"
            )}>
              <div className={cn(
                "flex items-center w-full",
                "transition-transform duration-300",
                "group-hover:scale-[0.99]",
                "group-data-[state=closed]:scale-95"
              )}>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-1.5 rounded-lg",
                    "bg-gradient-to-br from-purple-500/90 to-indigo-500/90 text-white",
                    "group-hover:from-purple-600/90 group-hover:to-indigo-600/90",
                    "shadow-sm",
                    "transition-colors duration-300",
                    "group-data-[state=closed]:bg-white/60",
                    "group-data-[state=closed]:p-1"
                  )}>
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <Logo className="text-sm font-medium" asLink={false} />
                    <div className="text-xs text-purple-500/70 -mt-0.5">AI Resume Assistant</div>
                  </div>
                </div>
              </div>
            </AccordionTrigger>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  className={cn(
                    "absolute right-10 top-1/2 -translate-y-1/2",
                    "px-3 py-1 rounded-full",
                    "bg-purple-100/60 text-purple-500/90 border border-purple-200/80",
                    "hover:bg-purple-200/80 hover:text-purple-600",
                    "transition-all duration-300",
                    "focus:outline-none focus:ring-2 focus:ring-purple-400/40",
                    "disabled:opacity-50",
                    "flex items-center gap-1.5",
                    "text-xs font-medium",
                    (accordionValue !== "chat" || isAlertOpen) && "hidden",
                  )}
                  disabled={messages.length === 0}
                  aria-label="Clear chat history"
                  variant="ghost"
                  size="sm"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Clear Chat</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className={cn(
                "bg-white/95 backdrop-blur-xl",
                "border-purple-200/60",
                "shadow-lg shadow-purple-500/5",
                "rounded-2xl"
              )}>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-purple-900">Clear Chat History</AlertDialogTitle>
                  <AlertDialogDescription className="text-purple-700/70">
                    This will remove all messages and reset the chat. This action can&apos;t be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className={cn(
                    "border-purple-200/60",
                    "hover:bg-purple-50/50",
                    "hover:text-purple-700",
                    "rounded-xl"
                  )}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearChat}
                    className={cn(
                      "bg-gradient-to-r from-purple-500 to-indigo-500 text-white",
                      "hover:from-purple-600 hover:to-indigo-600",
                      "focus:ring-purple-400",
                      "rounded-xl"
                    )}
                  >
                    Clear Chat
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Accordion Content */}
          <AccordionContent className="space-y-4 pt-2">
            <StickToBottom className="h-[65vh] px-6 relative custom-scrollbar" resize="smooth" initial="smooth">
              <StickToBottom.Content className="flex flex-col custom-scrollbar space-y-3">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-6 py-12">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mb-4">
                        <MessageSquareQuote className="h-8 w-8 text-purple-500" />
                      </div>
                      <h3 className="text-lg font-medium text-purple-900 mb-1">Resume AI Assistant</h3>
                      <p className="text-sm text-center text-purple-600/70 max-w-md mb-6">
                        Ask me anything about your resume or try one of these conversation starters:
                      </p>
                    </div>
                    <QuickSuggestions onSuggestionClick={handleSubmit} />
                  </div>
                ) : (
                  <>
                    {/* Messages */}
                    {messages.map((m: Message, index) => (
                      <React.Fragment key={index}>

                        {/* Regular Message Content */}
                        {m.content && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="my-2"
                          >
                            <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              {m.role !== 'user' && (
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mr-2 mt-1 shadow-sm">
                                  <Bot className="h-4 w-4 text-white" />
                                </div>
                              )}
                              
                              <div className={cn(
                                "rounded-2xl px-5 py-3 max-w-[100%] text-sm relative group",
                                m.role === 'user' ? [
                                  "bg-gradient-to-br from-purple-500 to-indigo-500",
                                  "text-white",
                                  "shadow-md shadow-purple-500/10",
                                  "ml-auto pb-2 rounded-tr-none"
                                ] : [
                                  "bg-white/70",
                                  "border border-purple-200/60",
                                  "shadow-sm",
                                  "backdrop-blur-sm pb-2 rounded-tl-none"
                                ]
                              )}>

                                {/* Edit Message */}
                                {editingMessageId === m.id ? (
                                  <div className="flex flex-col gap-2">
                                    <Textarea
                                      value={editContent}
                                      onChange={(e) => setEditContent(e.target.value)}
                                      className={cn(
                                        "w-full min-h-[100px] p-2 rounded-lg",
                                        "bg-white/80 backdrop-blur-sm",
                                        m.role === 'user' 
                                          ? "text-purple-900 placeholder-purple-400"
                                          : "text-gray-900 placeholder-gray-400",
                                        "border border-purple-200/60 focus:border-purple-400/60",
                                        "focus:outline-none focus:ring-1 focus:ring-purple-400/60"
                                      )}
                                    />
                                    <Button
                                      onClick={() => handleSaveEdit(m.id)}
                                      className={cn(
                                        "self-end px-3 py-1 rounded-lg text-xs",
                                        "bg-gradient-to-r from-purple-500 to-indigo-500 text-white",
                                        "hover:from-purple-600 hover:to-indigo-600",
                                        "transition-colors duration-200"
                                      )}
                                    >
                                      Save
                                    </Button>
                                  </div>
                                ) : (
                                  <MemoizedMarkdown id={m.id} content={m.content} />
                                )}

                                {/* Message Actions */}
                                <div className={cn(
                                  "absolute -bottom-5 flex gap-2 rounded-full bg-white/80 backdrop-blur-sm p-1 shadow-sm border border-purple-100/50",
                                  m.role === 'user' ? "right-2" : "left-8",
                                  "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                )}>
                                  <button
                                    onClick={() => handleDelete(m.id)}
                                    className={cn(
                                      "w-6 h-6 rounded-full flex items-center justify-center",
                                      "transition-colors duration-200 hover:bg-pink-100/80",
                                      "text-pink-400 hover:text-pink-500"
                                    )}
                                    aria-label="Delete message"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleEdit(m.id, m.content)}
                                    className={cn(
                                      "w-6 h-6 rounded-full flex items-center justify-center",
                                      "transition-colors duration-200 hover:bg-purple-100/80",
                                      "text-purple-400 hover:text-purple-500"
                                    )}
                                    aria-label="Edit message"
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                              
                              {m.role === 'user' && (
                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center ml-2 mt-1 border border-purple-200/60">
                                  <div className="font-medium text-xs text-purple-600">You</div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Tool Invocations as Separate Bubbles */}
                        {m.toolInvocations?.map((toolInvocation: ToolInvocation) => {
                          const { toolName, toolCallId, state, args } = toolInvocation;
                          switch (state) {
                            case 'partial-call':
                            case 'call':
                              return (
                                <motion.div 
                                  key={toolCallId} 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="mt-3 max-w-[85%]"
                                >
                                  <div className="flex justify-start items-center">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-300/70 to-indigo-300/70 flex items-center justify-center mr-2 shadow-sm">
                                      <Bot className="h-4 w-4 text-white/90" />
                                    </div>
                                    
                                    {toolName === 'getResume' ? (
                                      <div className={cn(
                                        "rounded-2xl px-5 py-3 text-sm",
                                        "bg-white/60 border border-purple-200/60",
                                        "shadow-sm backdrop-blur-sm rounded-tl-none",
                                        "animate-pulse"
                                      )}>
                                        <div className="flex items-center gap-2">
                                          <div className="h-3 w-3 rounded-full bg-purple-300 animate-pulse"></div>
                                          <span className="text-purple-500">Reading your resume...</span>
                                        </div>
                                      </div>
                                    ) : toolName === 'modifyWholeResume' ? (
                                      <div className={cn(
                                        "w-full rounded-2xl px-5 py-3 text-sm",
                                        "bg-white/60 border border-purple-200/60",
                                        "shadow-sm backdrop-blur-sm rounded-tl-none",
                                        "animate-pulse"
                                      )}>
                                        <div className="flex items-center gap-2">
                                          <div className="h-3 w-3 rounded-full bg-purple-300 animate-pulse"></div>
                                          <span className="text-purple-500">Preparing resume improvements...</span>
                                        </div>
                                      </div>
                                    ) : toolName.startsWith('suggest_') ? (
                                      <SuggestionSkeleton />
                                    ) : null}
                                  </div>
                                </motion.div>
                              );

                            case 'result':
                              // Map tool names to resume sections and handle suggestions
                              const toolConfig = {
                                suggest_work_experience_improvement: {
                                  type: 'work_experience' as const,
                                  field: 'work_experience',
                                  content: 'improved_experience',
                                },
                                suggest_project_improvement: {
                                  type: 'project' as const,
                                  field: 'projects',
                                  content: 'improved_project',
                                },
                                suggest_skill_improvement: {
                                  type: 'skill' as const,
                                  field: 'skills',
                                  content: 'improved_skill',
                                },
                                suggest_education_improvement: {
                                  type: 'education' as const,
                                  field: 'education',
                                  content: 'improved_education',
                                },
                                modifyWholeResume: {
                                  type: 'whole_resume' as const,
                                  field: 'all',
                                  content: null,
                                },
                              } as const;
                              const config = toolConfig[toolName as keyof typeof toolConfig];

                              if (!config) return null;

                              // Handle specific tool results
                              if (toolName === 'getResume') {
                                return (
                                  <div key={toolCallId} className="mt-2 w-[90%]">
                                    <div className="flex justify-start">
                                      <div className={cn(
                                        "rounded-2xl px-4 py-2 max-w-[90%] text-sm",
                                        "bg-white/60 border border-purple-200/60",
                                        "shadow-sm backdrop-blur-sm"
                                      )}>
                                        {args.message}
                                        <p>Read Resume ✅</p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }

                              if (config.type === 'whole_resume') {
                                // Store original state before applying updates
                                if (!originalResume) {
                                  setOriginalResume({ ...resume });
                                }

                                return (
                                  <div key={toolCallId} className="mt-2 w-[90%]">
                                    <WholeResumeSuggestion
                                      onReject={() => {
                                        if (originalResume) {
                                          Object.keys(originalResume).forEach((key) => {
                                            if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
                                              onResumeChange(key as keyof Resume, originalResume[key as keyof Resume]);
                                            }
                                          });
                                          setOriginalResume(null);
                                        }
                                      }}
                                    />
                                  </div>
                                );
                              }

                              return (
                                <div key={toolCallId} className="mt-2 w-[90%]">
                                  <div className="">
                                    <Suggestion
                                      type={config.type}
                                      content={args[config.content]}
                                      currentContent={resume[config.field][args.index]}
                                      onAccept={() => onResumeChange(config.field, 
                                        resume[config.field].map((item: WorkExperience | Education | Project | Skill, i: number) => 
                                          i === args.index ? args[config.content] : item
                                        )
                                      )}
                                      onReject={() => {}}
                                    />
                                  </div>
                                </div>
                              );

                            default:
                              return null;
                          }
                        })}

                        {/* Loading Dots Message - Modified condition */}
                        {((isInitialLoading && index === messages.length - 1 && m.role === 'user') ||
                          (isLoading && index === messages.length - 1 && m.role === 'assistant')) && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-3"
                          >
                            <div className="flex justify-start items-center">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-300/70 to-indigo-300/70 flex items-center justify-center mr-2 shadow-sm animate-pulse">
                                <Bot className="h-4 w-4 text-white/90" />
                              </div>
                              <div className={cn(
                                "rounded-2xl px-5 py-3.5 min-w-[80px]",
                                "bg-white/70",
                                "border border-purple-200/60",
                                "shadow-sm",
                                "backdrop-blur-sm rounded-tl-none"
                              )}>
                                <LoadingDots className="text-purple-600" />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </React.Fragment>
                    ))}
                  </>
                )}
              
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {error.message === "Rate limit exceeded. Try again later." ? (
                      <div className={cn(
                        "rounded-xl p-5 text-sm",
                        "bg-pink-50/90 border border-pink-200/70",
                        "text-pink-700 shadow-sm"
                      )}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-full bg-pink-100">
                            <X className="h-4 w-4 text-pink-500" />
                          </div>
                          <h4 className="font-medium">Message Limit Reached</h4>
                        </div>
                        <p>You&apos;ve used all your available messages. Please try again after:</p>
                        <p className="font-medium mt-2 text-pink-800">
                          {new Date(Date.now() + 5 * 60 * 60 * 1000).toLocaleString()} {/* 5 hours from now */}
                        </p>
                      </div>
                    ) : (
                      <ApiKeyErrorAlert 
                        error={error} 
                        router={router} 
                      />
                    )}
                  </motion.div>
                )}
              </StickToBottom.Content>

              <ScrollToBottom />
            </StickToBottom>
            
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Input Bar */}
      <ChatInput
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onStop={stop}
      />
    </Card>
  );
}