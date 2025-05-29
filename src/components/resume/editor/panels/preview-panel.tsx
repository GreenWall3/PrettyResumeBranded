'use client';

import { Resume } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ResumePreview } from "../preview/resume-preview";
import CoverLetter from "@/components/cover-letter/cover-letter";
import { ResumeContextMenu } from "../preview/resume-context-menu";

interface PreviewPanelProps {
  resume: Resume;
  onResumeChange: (field: keyof Resume, value: Resume[keyof Resume]) => void;
  width: number;
  // percentWidth: number;
}

export function PreviewPanel({
  resume,
  // onResumeChange,
  width
}: PreviewPanelProps) {
  return (
    <ScrollArea className={cn(
      " z-50     bg-red-500 h-full",
      resume.is_base_resume
        ? "bg-purple-50/30"
        : "bg-pink-50/60 shadow-sm shadow-pink-200/20"
    )}>
      <div className="">
        <ResumeContextMenu resume={resume}>
          <ResumePreview resume={resume} containerWidth={width} />
        </ResumeContextMenu>
      </div>

      {/* Temporarily removed Cover Letter Feature */}
      {/* <CoverLetter 
        containerWidth={width}
      /> */}
    </ScrollArea>
  );
} 