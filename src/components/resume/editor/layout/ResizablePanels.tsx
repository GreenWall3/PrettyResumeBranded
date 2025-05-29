import { cn } from "@/lib/utils";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ReactNode, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface ResizablePanelsProps {
  isBaseResume: boolean;
  editorPanel: ReactNode;
  previewPanel: (width: number) => ReactNode;
}

export function ResizablePanels({
  isBaseResume,
  editorPanel,
  previewPanel
}: ResizablePanelsProps) {
  const [previewSize, setPreviewSize] = useState(60);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPercentageRef = useRef(60); // Store last percentage
  const [isMobile, setIsMobile] = useState(false);

  // Add function to calculate pixel width
  const updatePixelWidth = () => {
    const containerWidth = containerRef.current?.clientWidth || 0;
    const pixelWidth = Math.floor((containerWidth * lastPercentageRef.current) / 100);
    setPreviewSize(pixelWidth);
  };

  // Check if screen is mobile
  const checkIsMobile = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  // Toggle mobile preview visibility
  const toggleMobilePreview = () => {
    setShowPreviewMobile(prev => !prev);
  };

  useEffect(() => {
    // Handle window resize
    const handleResize = () => {
      updatePixelWidth();
      checkIsMobile();
    };
    
    window.addEventListener('resize', handleResize);

    // Initial calculation
    updatePixelWidth();
    checkIsMobile();

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Desktop Layout
  if (!isMobile) {
    return (
      <div ref={containerRef} className="h-full relative">
        <ResizablePanelGroup
          direction="horizontal"
          className={cn(
            "relative h-full rounded-lg  ",
            isBaseResume
              ? "border-purple-200/40"
              : "border-pink-300/50"
          )}
        >
          {/* Editor Panel */}
          <ResizablePanel defaultSize={40} minSize={30} maxSize={70}>
            {editorPanel}
          </ResizablePanel>

          {/* Resize Handle */}
          <ResizableHandle 
            withHandle 
            className={cn(
              isBaseResume
                ? "bg-purple-100/50 hover:bg-purple-200/50"
                : "bg-pink-200/50 hover:bg-pink-300/50 shadow-sm shadow-pink-200/20"
            )}
          />

          {/* Preview Panel */}
          <ResizablePanel 
            defaultSize={60} 
            minSize={30} 
            maxSize={70}
            onResize={(size) => {
              lastPercentageRef.current = size; // Store current percentage
              updatePixelWidth();
            }}
            className={cn(
              "shadow-[0_0_30px_-5px_rgba(0,0,0,0.3)] overflow-y-scroll",
              isBaseResume
                ? "shadow-purple-200/50"
                : "shadow-pink-200/50"
            )}
          >
            {previewPanel(previewSize)}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    );
  }

  // Mobile Layout
  return (
    <div ref={containerRef} className="h-full relative">
      <div className="h-full flex flex-col">
        {/* Editor Panel */}
        <div className="flex-grow">
          {editorPanel}
        </div>

        {/* Preview Toggle Button */}
        <Button
          onClick={toggleMobilePreview}
          size="sm"
          className={cn(
            "fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 flex items-center justify-center shadow-md",
            isBaseResume 
              ? "bg-purple-100 hover:bg-purple-200 text-purple-800"
              : "bg-pink-200 hover:bg-pink-300 text-pink-800",
            showPreviewMobile && "opacity-70 hover:opacity-100"
          )}
        >
          <Eye className="h-5 w-5" />
        </Button>

        {/* Preview Panel - Shown when toggled */}
        {showPreviewMobile && (
          <div className={cn(
            "fixed inset-0 bg-white z-40 overflow-y-auto pt-16",
            "shadow-[0_0_30px_-5px_rgba(0,0,0,0.3)]",
            isBaseResume
              ? "shadow-purple-200/50"
              : "shadow-pink-200/50"
          )}>
            {previewPanel(window.innerWidth)}
          </div>
        )}
      </div>
    </div>
  );
}