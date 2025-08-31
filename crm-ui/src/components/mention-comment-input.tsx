"use client";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useStaffDropdown } from "@/hooks/use-staff";
import { CommentUtils } from "@/types/comment";

interface MentionSuggestion {
  id: number;
  fullName: string;
  jobTitle: string;
  mention: string; // Generated from fullName
}

interface MentionCommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onMentionedStaffChange?: (staffIds: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Helper function to get cursor position in pixels within textarea
const getCursorPosition = (textarea: HTMLTextAreaElement, cursorIndex: number) => {
  const textBeforeCursor = textarea.value.substring(0, cursorIndex);
  
  // Create a temporary div to measure text
  const temp = document.createElement('div');
  temp.style.position = 'absolute';
  temp.style.visibility = 'hidden';
  temp.style.whiteSpace = 'pre-wrap';
  temp.style.wordWrap = 'break-word';
  temp.style.font = window.getComputedStyle(textarea).font;
  temp.style.fontSize = window.getComputedStyle(textarea).fontSize;
  temp.style.fontFamily = window.getComputedStyle(textarea).fontFamily;
  temp.style.lineHeight = window.getComputedStyle(textarea).lineHeight;
  temp.style.padding = window.getComputedStyle(textarea).padding;
  temp.style.border = window.getComputedStyle(textarea).border;
  temp.style.width = textarea.offsetWidth + 'px';
  temp.style.height = 'auto';
  
  // Add text up to cursor
  temp.textContent = textBeforeCursor;
  document.body.appendChild(temp);
  
  const rect = textarea.getBoundingClientRect();
  const tempRect = temp.getBoundingClientRect();
  
  // Calculate position relative to textarea
  const x = tempRect.width % textarea.clientWidth;
  const y = Math.floor(tempRect.width / textarea.clientWidth) * parseFloat(window.getComputedStyle(textarea).lineHeight);
  
  document.body.removeChild(temp);
  
  return { x, y };
};

export function MentionCommentInput({
  value,
  onChange,
  onMentionedStaffChange,
  placeholder = "Enter your comment... Type @ to mention staff",
  disabled = false,
  className = "",
}: MentionCommentInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStartPos, setMentionStartPos] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { staffOptions, loading } = useStaffDropdown();

  // Create mention suggestions from staff options
  const createMentionSuggestions = (query: string = ""): MentionSuggestion[] => {
    if (!staffOptions.length) return [];

    return staffOptions
      .map(staff => ({
        id: staff.id,
        fullName: staff.fullName,
        jobTitle: staff.jobTitle,
        mention: staff.fullName.toLowerCase().replace(/\s+/g, '.'), // "John Doe" -> "john.doe"
      }))
      .filter(suggestion => 
        query === "" || 
        suggestion.fullName.toLowerCase().includes(query.toLowerCase()) ||
        suggestion.mention.includes(query.toLowerCase())
      )
      .slice(0, 6); // Limit to 6 suggestions for better UX in cursor popup
  };

  // Calculate dropdown position at cursor
  const calculateDropdownPosition = (cursorPos: number) => {
    if (!textareaRef.current) return { x: 0, y: 0 };

    const textarea = textareaRef.current;
    
    // Simple approximation - calculate line and character position
    const textBeforeCursor = value.slice(0, cursorPos);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines.length - 1;
    const currentColumn = lines[lines.length - 1].length;
    
    // Approximate character width and line height
    const style = window.getComputedStyle(textarea);
    const fontSize = parseFloat(style.fontSize);
    const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.2;
    const charWidth = fontSize * 0.6; // Approximate character width
    
    // Calculate position
    const x = Math.min(currentColumn * charWidth, textarea.clientWidth - 250); // Keep within bounds
    const y = currentLine * lineHeight + lineHeight; // Position below current line
    
    return { x, y };
  };

  // Handle text change and detect @ mentions
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(newValue);
    
    // Update mentioned staff IDs
    const mentionedStaffIds = CommentUtils.extractMentionedStaffIds(newValue, staffOptions);
    onMentionedStaffChange?.(mentionedStaffIds);

    // Check for @ mentions
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@([a-zA-Z0-9._-]*)$/);
    
    if (mentionMatch && staffOptions.length > 0) {
      const query = mentionMatch[1];
      const startPos = cursorPos - mentionMatch[0].length;
      
      setMentionQuery(query);
      setMentionStartPos(startPos);
      const newSuggestions = createMentionSuggestions(query);
      setSuggestions(newSuggestions);
      
      if (newSuggestions.length > 0) {
        const position = calculateDropdownPosition(cursorPos);
        setDropdownPosition(position);
        setShowSuggestions(true);
        setSelectedIndex(0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle key navigation in suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case 'Tab':
        if (showSuggestions && suggestions[selectedIndex]) {
          e.preventDefault();
          insertMention(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // Insert selected mention
  const insertMention = (suggestion: MentionSuggestion) => {
    if (!textareaRef.current || mentionStartPos === -1) return;

    const textarea = textareaRef.current;
    const currentValue = value;
    const beforeMention = currentValue.slice(0, mentionStartPos);
    const afterCursor = currentValue.slice(textarea.selectionStart);
    
    const mentionText = `@${suggestion.mention}`;
    const newValue = beforeMention + mentionText + ' ' + afterCursor; // Add space after mention
    const newCursorPos = mentionStartPos + mentionText.length + 1;
    
    onChange(newValue);
    
    // Update mentioned staff IDs
    const mentionedStaffIds = CommentUtils.extractMentionedStaffIds(newValue, staffOptions);
    onMentionedStaffChange?.(mentionedStaffIds);
    
    setShowSuggestions(false);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Handle clicking on suggestion
  const handleSuggestionClick = (suggestion: MentionSuggestion) => {
    insertMention(suggestion);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[100px] resize-none"
      />
      
      {/* Mention suggestions dropdown - positioned at cursor */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          className="absolute bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto z-[9999] min-w-[280px]"
          style={{
            left: `${dropdownPosition.x + 8}px`, // 8px padding from textarea edge
            top: `${dropdownPosition.y + 8}px`,   // 8px padding from textarea edge
            transform: dropdownPosition.x > 200 ? 'translateX(-100%)' : 'translateX(0)', // Flip if near right edge
          }}
        >
          <div className="p-1">
            <div className="text-xs text-gray-500 mb-1 px-2 py-1 bg-gray-50 rounded">
              {loading ? 'Loading...' : `${suggestions.length} staff`}
            </div>
            
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                className={`px-2 py-2 cursor-pointer flex items-center gap-2 rounded-md transition-colors text-sm ${
                  index === selectedIndex 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700 flex-shrink-0">
                  {suggestion.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium text-gray-900 truncate text-sm">
                    {suggestion.fullName}
                  </span>
                  <span className="text-xs text-blue-600 truncate">
                    @{suggestion.mention}
                  </span>
                </div>
                {index === selectedIndex && (
                  <div className="text-xs text-blue-600 flex-shrink-0">
                    ↵
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="mt-1 text-xs text-gray-500">
        Type @ to mention staff members
      </div>
    </div>
  );
}