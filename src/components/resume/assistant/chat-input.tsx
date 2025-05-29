import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, X, Sparkles, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState, useCallback, useRef, useEffect } from "react";

interface ChatInputProps {
  isLoading: boolean;
  onSubmit: (message: string) => void;
  onStop: () => void;
}

export default function ChatInput({ 
    isLoading, 
    onSubmit,
    onStop,
  }: ChatInputProps) {
    const [inputValue, setInputValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustTextareaHeight = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Calculate new height (capped at 6 lines ~ 144px)
      const newHeight = Math.min(textarea.scrollHeight, 144);
      textarea.style.height = `${newHeight}px`;
    }, []);

    // Adjust height whenever input value changes
    useEffect(() => {
      adjustTextareaHeight();
    }, [inputValue, adjustTextareaHeight]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
      e.preventDefault();
      if (inputValue.trim()) {
        const cleanedMessage = inputValue.replace(/\n+$/, '').trim();
        onSubmit(cleanedMessage);
        setInputValue("");
      }
    }, [inputValue, onSubmit]);

    return (
      <form 
        onSubmit={handleSubmit} 
        className={cn(
          "relative z-10",
          "p-2 border-t border-purple-200/60",
          "bg-gradient-to-r from-white/60 via-purple-50/40 to-white/60",
          "backdrop-blur-sm",
          "flex items-center gap-2",
          "transition-all duration-300",
          isFocused && "bg-white/80 shadow-inner"
        )}
      >
        <div className={cn(
          "flex-1 relative rounded-xl overflow-hidden",
          "transition-all duration-300",
          "bg-white/80",
          "border border-purple-200/60",
          isFocused && "border-purple-400/60 shadow-sm shadow-purple-300/20",
          "group"
        )}>
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-purple-400/80">
            <MessageSquare className="h-4 w-4" />
          </div>
          
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                } else {
                  // Ensure height is adjusted after Shift+Enter
                  requestAnimationFrame(adjustTextareaHeight);
                }
              }
            }}
            placeholder="Ask me anything about your resume..."
            rows={1}
            className={cn(
              "flex-1",
              "bg-transparent",
              "border-none focus:border-none focus-visible:ring-0",
              "placeholder:text-purple-400/80",
              "text-sm",
              "min-h-[42px]",
              "max-h-[144px]", // Approximately 6 lines
              "resize-none",
              "overflow-y-auto",
              "py-2.5 pr-3 pl-9",
              "transition-all duration-200",
              "scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent"
            )}
          />
          
          <div className={cn(
            "absolute inset-0 pointer-events-none",
            "bg-gradient-to-r from-transparent via-transparent to-white/40",
            "opacity-0 group-hover:opacity-100",
            "transition-opacity duration-300"
          )} />
        </div>
        
        <Button 
          type={isLoading ? "button" : "submit"}
          onClick={isLoading ? onStop : undefined}
          size="sm"
          className={cn(
            "rounded-full w-10 h-10 p-0 flex items-center justify-center",
            isLoading ? [
              "bg-gradient-to-br from-rose-500 to-pink-500",
              "hover:from-rose-600 hover:to-pink-600",
            ] : [
              "bg-gradient-to-br from-purple-500 to-indigo-500",
              "hover:from-purple-600 hover:to-indigo-600",
            ],
            "text-white",
            "border-none",
            "shadow-md shadow-purple-500/10",
            "transition-all duration-300",
            "hover:scale-105 hover:shadow-lg",
            "hover:-translate-y-0.5",
            !inputValue.trim() && !isLoading && "opacity-80 hover:opacity-100",
            "relative overflow-hidden"
          )}
        >
          {isLoading ? (
            <X className="h-4 w-4 relative z-10" />
          ) : (
            <>
              <Send className="h-4 w-4 relative z-10" />
              <div className={cn(
                "absolute inset-0",
                "bg-gradient-to-tr from-transparent via-white/10 to-white/30",
                "opacity-0 hover:opacity-100",
                "transition-opacity duration-300"
              )} />
            </>
          )}
        </Button>
      </form>
    );
}