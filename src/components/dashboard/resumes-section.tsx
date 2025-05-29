'use client';

import { Trash2, Copy, FileText, Sparkles, ChevronLeft, ChevronRight, Plus, Award } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { MiniResumePreview } from '@/components/resume/shared/mini-resume-preview';
import { CreateResumeDialog } from '@/components/resume/management/dialogs/create-resume-dialog';
import { ResumeSortControls, type SortOption, type SortDirection } from '@/components/resume/management/resume-sort-controls';
import type { Profile, Resume } from '@/lib/types';
import { deleteResume, copyResume } from '@/utils/actions/resumes/actions';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

interface ResumesSectionProps {
  type: 'base' | 'tailored';
  resumes: Resume[];
  profile: Profile;
  sortParam: string;
  directionParam: string;
  currentSort: SortOption;
  currentDirection: SortDirection;
  baseResumes?: Resume[]; // Only needed for tailored type
  canCreateMore?: boolean;
}

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
}

export function ResumesSection({ 
  type,
  resumes,
  profile,
  sortParam,
  directionParam,
  currentSort,
  currentDirection,
  baseResumes = [],
  canCreateMore
}: ResumesSectionProps) {

  const themeConfig = {
    base: {
      primary: 'bg-indigo-500',
      primaryHover: 'hover:bg-indigo-600',
      secondary: 'bg-indigo-100',
      secondaryHover: 'hover:bg-indigo-200',
      text: 'text-indigo-600',
      textHover: 'hover:text-indigo-700',
      borderColor: 'border-indigo-200',
      borderHover: 'hover:border-indigo-300',
      shadow: 'shadow-indigo-100',
      gradientFrom: 'from-indigo-500',
      gradientTo: 'to-purple-600',
      lightBg: 'bg-indigo-50',
      icon: FileText,
    },
    tailored: {
      primary: 'bg-rose-500',
      primaryHover: 'hover:bg-rose-600',
      secondary: 'bg-rose-100',
      secondaryHover: 'hover:bg-rose-200',
      text: 'text-rose-600',
      textHover: 'hover:text-rose-700',
      borderColor: 'border-rose-200',
      borderHover: 'hover:border-rose-300',
      shadow: 'shadow-rose-100',
      gradientFrom: 'from-rose-500',
      gradientTo: 'to-pink-600',
      lightBg: 'bg-rose-50',
      icon: Sparkles,
    }
  }[type];

  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 8
  });

  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
  const endIndex = startIndex + pagination.itemsPerPage;
  const paginatedResumes = resumes.slice(startIndex, endIndex);
  const totalPages = Math.ceil(resumes.length / pagination.itemsPerPage);

  function handlePageChange(page: number) {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  }

  // Create Resume Card Component
  const CreateResumeCard = () => (
    <CreateResumeDialog 
      type={type} 
      profile={profile}
      {...(type === 'tailored' && { baseResumes })}
    >
      <Card className={cn(
        "group cursor-pointer h-full min-h-[240px]",
        "border-dashed border-2 transition-all duration-300",
        type === 'base' ? "border-indigo-300" : "border-rose-300",
        "hover:scale-[1.02] hover:shadow-lg",
      )}>
        <CardContent className="flex flex-col items-center justify-center h-full p-4 gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            "transition-all duration-300 group-hover:scale-110",
            type === 'base' ? themeConfig.secondary : themeConfig.secondary,
          )}>
            <Plus className={cn(
              "w-5 h-5 transition-all duration-300",
              type === 'base' ? themeConfig.text : themeConfig.text
            )} />
          </div>
          
          <div className="text-center">
            <p className={cn(
              "font-medium text-base mb-1",
              type === 'base' ? themeConfig.text : themeConfig.text
            )}>
              Create New {type === 'base' ? 'Base' : 'Tailored'} Resume
            </p>
            <p className="text-xs text-muted-foreground">
              {type === 'base' 
                ? "Create a foundation resume" 
                : "Customize for specific position"}
            </p>
          </div>
        </CardContent>
      </Card>
    </CreateResumeDialog>
  );

  // Limit Reached Card Component
  const LimitReachedCard = () => (
    <Link href="/subscription" className="block h-full">
      <Card className={cn(
        "group cursor-pointer h-full min-h-[240px]",
        "border-dashed border-2 border-amber-300",
        "transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-lg hover:border-amber-400",
        "bg-gradient-to-b from-amber-50/50 to-transparent"
      )}>
        <CardContent className="flex flex-col items-center justify-center h-full p-4 gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          
          <div className="text-center">
            <p className="font-medium text-base mb-1 text-amber-600">
              Upgrade Plan
            </p>
            <p className="text-xs text-amber-600/80 mb-2">
              Limit reached
            </p>
            <Badge variant="outline" className="text-xs bg-amber-100/50 text-amber-700 border-amber-200 hover:bg-amber-100">
              View Plans
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  // Resume Card Component
  const ResumeCard = ({ resume }: { resume: Resume }) => {
    const date = new Date(resume.created_at);
    const formattedDate = format(date, 'MMM d, yyyy');
    
    return (
      <Card className={cn(
        "group h-full min-h-[240px] transition-all duration-300",
        "hover:shadow-md hover:scale-[1.01]",
        "border overflow-hidden",
        type === 'base' ? "border-indigo-100" : "border-rose-100",
      )}>
        <Link href={`/resumes/${resume.id}`} className="block h-full">
          <CardHeader className={cn(
            "pb-1 px-3 pt-2",
            type === 'base' ? "bg-indigo-50/50" : "bg-rose-50/50",
          )}>
            {resume.target_role && (
              <CardDescription className="line-clamp-1 text-xs" title={resume.target_role}>
                {resume.target_role}
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent className="p-2 flex-grow relative">
            <div className="aspect-[8.5/11] w-full max-h-[140px] overflow-hidden rounded-sm bg-white border shadow-sm mx-auto">
              <MiniResumePreview
                name={resume.name}
                type={type}
                target_role={resume.target_role}
                createdAt={resume.created_at}
                className="h-full w-full"
              />
            </div>
          </CardContent>
          
          <CardFooter className={cn(
            "flex justify-between items-center px-2 py-1 text-[10px] text-muted-foreground border-t",
            type === 'base' ? "border-indigo-100/50" : "border-rose-100/50",
          )}>
            <span>{formattedDate}</span>
            <Badge variant="outline" className={cn(
              "text-[10px] font-normal px-1.5 py-0",
              type === 'base' ? "bg-indigo-50 border-indigo-100 text-indigo-600" : "bg-rose-50 border-rose-100 text-rose-600"
            )}>
              {type}
            </Badge>
          </CardFooter>
        </Link>
        
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <ResumeActionButtons resume={resume} />
        </div>
      </Card>
    );
  };

  // Resume Action Buttons
  const ResumeActionButtons = ({ resume }: { resume: Resume }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 rounded-full bg-white/80 backdrop-blur-sm text-rose-500 hover:bg-rose-50 hover:text-rose-600 border border-rose-100 shadow-sm p-0"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Resume</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{resume.name}&quot;? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={async () => await deleteResume(resume.id)}>
            <AlertDialogAction
              type="submit"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  // Pagination Component
  const PaginationControls = () => {
    if (resumes.length <= pagination.itemsPerPage) return null;
    
    return (
      <Pagination className="mx-auto">
        <PaginationContent className="gap-1">
          <PaginationItem>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className={cn(
                "h-8 w-8 rounded-full",
                "border text-muted-foreground",
                type === 'base' ? "hover:border-indigo-200 hover:bg-indigo-50" : "hover:border-rose-200 hover:bg-rose-50"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </PaginationItem>
          
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNumber = index + 1;
            
            // Show current page, first page, last page, and pages around current
            const shouldShow = 
              pageNumber === 1 || 
              pageNumber === totalPages || 
              (pageNumber >= pagination.currentPage - 1 && pageNumber <= pagination.currentPage + 1);
              
            // Show ellipsis when needed
            const showEllipsis = 
              (pageNumber === 2 && pagination.currentPage > 3) ||
              (pageNumber === totalPages - 1 && pagination.currentPage < totalPages - 2);
            
            if (shouldShow) {
              const isActive = pagination.currentPage === pageNumber;
              return (
                <PaginationItem key={index}>
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="icon"
                    onClick={() => handlePageChange(pageNumber)}
                    className={cn(
                      "h-8 w-8 rounded-full",
                      isActive ? (
                        type === 'base' ? "bg-indigo-500 hover:bg-indigo-600" : "bg-rose-500 hover:bg-rose-600"
                      ) : (
                        "border text-muted-foreground"
                      ),
                      !isActive && type === 'base' ? "hover:border-indigo-200 hover:bg-indigo-50" : "hover:border-rose-200 hover:bg-rose-50"
                    )}
                  >
                    {pageNumber}
                  </Button>
                </PaginationItem>
              );
            }
            
            if (showEllipsis) {
              return (
                <PaginationItem key={index}>
                  <span className="flex h-8 w-8 items-center justify-center text-muted-foreground">
                    ···
                  </span>
                </PaginationItem>
              );
            }
            
            return null;
          })}
          
          <PaginationItem>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === totalPages}
              className={cn(
                "h-8 w-8 rounded-full",
                "border text-muted-foreground",
                type === 'base' ? "hover:border-indigo-200 hover:bg-indigo-50" : "hover:border-rose-200 hover:bg-rose-50"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <section className="space-y-4">
      {/* Header with Sort Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 pb-2 border-b">
        <div>
          <h2 className="text-xl font-bold">My Resumes</h2>
          <p className="text-muted-foreground text-xs mt-0.5">
            {type === 'base'
              ? "Create and manage your foundational resumes"
              : "Customize resumes for specific job applications"}
          </p>
        </div>
        
        <ResumeSortControls 
          sortParam={sortParam}
          directionParam={directionParam}
          currentSort={currentSort}
          currentDirection={currentDirection}
        />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
          {canCreateMore ? (
            <CreateResumeCard />
          ) : (
            <LimitReachedCard />
          )}

          {paginatedResumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
        
        <div className="flex justify-center mt-4">
          <PaginationControls />
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        <div className="flex flex-col space-y-3">
          {canCreateMore ? (
            <div className="px-1">
              <CreateResumeCard />
            </div>
          ) : (
            <div className="px-1">
              <LimitReachedCard />
            </div>
          )}
          
          {paginatedResumes.length > 0 && (
            <Carousel className="w-full px-1">
              <CarouselContent>
                {paginatedResumes.map((resume) => (
                  <CarouselItem key={resume.id} className="basis-[85%]">
                    <ResumeCard resume={resume} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="sm:block">
                <CarouselPrevious className="absolute -left-3 top-1/2 h-7 w-7" />
                <CarouselNext className="absolute -right-3 top-1/2 h-7 w-7" />
              </div>
            </Carousel>
          )}
        </div>
        
        <div className="flex justify-center mt-3">
          <PaginationControls />
        </div>
      </div>
      
      {/* Message when no resumes */}
      {resumes.length === 0 && (
        <div className={cn(
          "text-center py-8 px-4 rounded-lg border border-dashed",
          type === 'base' ? "border-indigo-200 bg-indigo-50/50" : "border-rose-200 bg-rose-50/50"
        )}>
          <themeConfig.icon className={cn(
            "mx-auto h-8 w-8 mb-3",
            type === 'base' ? "text-indigo-400" : "text-rose-400"
          )} />
          <h3 className="text-base font-medium mb-1">No {type} resumes yet</h3>
          <p className="text-sm text-muted-foreground">
            {type === 'base' 
              ? "Create your first base resume to get started" 
              : "Customize a resume for a specific job application"}
          </p>
        </div>
      )}
    </section>
  );
} 