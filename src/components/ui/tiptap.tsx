'use client'

import { useCallback, useMemo, useEffect, useRef } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Text from '@tiptap/extension-text'
import Paragraph from '@tiptap/extension-paragraph'
import debounce from 'lodash/debounce'
import Bold from '@tiptap/extension-bold'
import History from '@tiptap/extension-history'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import { memo } from 'react'
import { cn } from '@/lib/utils'

// Initialize a global registry for TipTap editors
if (typeof window !== 'undefined') {
  (window as any).__TIPTAP_EDITORS__ = (window as any).__TIPTAP_EDITORS__ || {};
}

interface TiptapProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
  readOnly?: boolean;
  variant?: 'default' | 'skill';
  editorId?: string; // Unique ID for the editor
  editorProps?: {
    attributes?: {
      class?: string;
      placeholder?: string;
    };
    handleKeyDown?: (view: any, event: KeyboardEvent) => boolean;
  };
}

const Tiptap = memo(
  ({ 
    content, 
    onChange, 
    className, 
    readOnly, 
    variant = 'default', 
    editorId,
    editorProps: customEditorProps 
  }: TiptapProps) => {
    // Transform content to HTML before loading
    const transformContent = useCallback((content: string) => {
      return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }, []);

    // Create ref for the editor DOM element
    const editorRef = useRef<HTMLDivElement | null>(null);

    // Debounce the onChange callback
    const debouncedOnChange = useMemo(
      () => debounce((text: string) => {
        onChange(text);
      }, 300),
      [onChange]
    );

    // Memoize editor configuration
    const extensions = useMemo(
      () => [
        Document, 
        Text, 
        Paragraph, 
        Bold, 
        History,
        BulletList.configure({
          HTMLAttributes: {
            class: 'list-disc ml-4 space-y-2',
          },
        }),
        ListItem,
      ],
      []
    );

    const editorProps = useMemo(
      () => ({
        attributes: {
          class: cn(
            "prose w-full rounded-lg border border-input bg-white/50 text-xs md:text-sm ring-offset-background",
            "placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Apply different styles based on variant
            variant === 'default' && "min-h-[80px] px-3 py-2",
            variant === 'skill' && "px-3",
            className
          ),
          ...customEditorProps?.attributes
        },
        handleKeyDown: customEditorProps?.handleKeyDown
      }),
      [className, customEditorProps?.attributes, variant, customEditorProps?.handleKeyDown]
    );

    const editor = useEditor({
      extensions,
      content: transformContent(content),
      editorProps: {
        ...editorProps,
        handleKeyDown: (view, event) => {
          if (editorProps.handleKeyDown?.(view, event)) {
            return true;
          }
          return false;
        }
      },
      editable: !readOnly,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        
        // Check if content contains a list
        if (html.includes('<ul>') || html.includes('<li>')) {
          // Preserve HTML structure for lists
          debouncedOnChange(html);
        } else {
          // Convert <strong> tags back to asterisks for non-list content
          const textWithAsterisks = html
            .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
            .replace(/<p>/g, '')
            .replace(/<\/p>/g, '')
            .trim();
          debouncedOnChange(textWithAsterisks);
        }
      },
      immediatelyRender: false,
    });

    // Register editor in global registry when it's ready
    useEffect(() => {
      if (editor && editorId) {
        if (typeof window !== 'undefined') {
          (window as any).__TIPTAP_EDITORS__[editorId] = editor;
        }
        
        return () => {
          // Clean up on unmount
          if (typeof window !== 'undefined' && (window as any).__TIPTAP_EDITORS__) {
            delete (window as any).__TIPTAP_EDITORS__[editorId];
          }
        };
      }
    }, [editor, editorId]);

    // Sync editor content when content prop changes
    useEffect(() => {
      if (editor && content !== editor.getHTML().replace(/<p>/g, '').replace(/<\/p>/g, '').trim()) {
        editor.commands.setContent(transformContent(content));
      }
    }, [content, editor, transformContent]);

    // Handle bold toggle event from the button click
    useEffect(() => {
      if (!editor || !editorRef.current) return;
      
      const handleToggleBold = () => {
        editor.chain().focus().toggleBold().run();
      };
      
      const element = editorRef.current;
      element.addEventListener('tiptap-toggle-bold', handleToggleBold);
      
      return () => {
        element.removeEventListener('tiptap-toggle-bold', handleToggleBold);
      };
    }, [editor]);

    return <EditorContent editor={editor} ref={editorRef} />;
  },
  (prevProps, nextProps) => {
    // Update memo comparison to include content changes
    return (
      prevProps.className === nextProps.className &&
      prevProps.readOnly === nextProps.readOnly &&
      prevProps.content === nextProps.content &&
      prevProps.variant === nextProps.variant &&
      prevProps.editorId === nextProps.editorId
    );
  }
);

// Add display name for debugging
Tiptap.displayName = 'Tiptap';

export default Tiptap;
