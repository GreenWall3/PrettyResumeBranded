'use client';

import { Button } from "@/components/ui/button";
import { Linkedin } from "lucide-react";
import { Resume } from "@/lib/types";
import { LinkedInImportDialog } from "./management/dialogs/linkedin-import-dialog";
import { cn } from "@/lib/utils";

interface LinkedInImportProps {
  resume: Resume;
  onResumeChange: (field: keyof Resume, value: Resume[keyof Resume]) => void;
  className?: string;
}

export function LinkedInImport({
  resume,
  onResumeChange,
  className
}: LinkedInImportProps) {
  return (
    <LinkedInImportDialog
      resume={resume}
      onResumeChange={onResumeChange}
      trigger={
        <Button
          className={cn(
            className,
            "w-full"
          )}
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,#ffffff20_50%,transparent_100%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <Linkedin className="mr-1.5 h-3.5 w-3.5" />
          Import
        </Button>
      }
    />
  );
} 