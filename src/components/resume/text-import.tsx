'use client';

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Resume } from "@/lib/types";
import { TextImportDialog } from "./management/dialogs/text-import-dialog";
import { cn } from "@/lib/utils";

interface TextImportProps {
  resume: Resume;
  onResumeChange: (field: keyof Resume, value: Resume[keyof Resume]) => void;
  className?: string;
}

export function TextImport({
  resume,
  onResumeChange,
  className
}: TextImportProps) {
  return (
    <TextImportDialog
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
          <FileText className="mr-1.5 h-3.5 w-3.5" />
          Import
        </Button>
      }
    />
  );
} 