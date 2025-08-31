"use client";

import { RequestComment, CommentUtils } from "@/types/comment";

interface CommentWithMentionsProps {
  comment: RequestComment;
  className?: string;
}

export function CommentWithMentions({ comment, className = "" }: CommentWithMentionsProps) {
  // Parse the comment text and highlight mentions
  const renderCommentText = () => {
    if (!comment.mentionedStaff || comment.mentionedStaff.length === 0) {
      // No mentions, return plain text
      return (
        <span className="text-sm text-gray-700 whitespace-pre-wrap">
          {comment.comment}
        </span>
      );
    }

    // Create a map of mention patterns to staff info for quick lookup
    const mentionMap = new Map<string, { id: number; name: string }>();
    comment.mentionedStaff.forEach(staff => {
      // Try multiple variations of the name for flexible matching
      const nameVariations = [
        staff.name.toLowerCase().replace(/\s+/g, '.'),  // "John Doe" -> "john.doe"
        staff.name.toLowerCase().replace(/\s+/g, '_'),  // "John Doe" -> "john_doe"
        staff.name.toLowerCase().replace(/\s+/g, ''),   // "John Doe" -> "johndoe"
        staff.name.toLowerCase(),                       // "John Doe" -> "john doe"
      ];
      
      nameVariations.forEach(variation => {
        mentionMap.set(variation, { id: staff.id, name: staff.name });
      });
    });

    // Split text by @ mentions and process each part
    const mentionRegex = /@([a-zA-Z0-9._\s-]+)/g;
    const parts = comment.comment.split(mentionRegex);
    const elements: React.ReactNode[] = [];
    
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Regular text part
        if (parts[i]) {
          elements.push(
            <span key={`text-${i}`}>
              {parts[i]}
            </span>
          );
        }
      } else {
        // Potential mention part
        const mentionText = parts[i];
        const staff = mentionMap.get(mentionText.toLowerCase());
        
        if (staff) {
          // Valid mention - render as highlighted
          elements.push(
            <span
              key={`mention-${i}`}
              className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-sm font-medium cursor-pointer hover:bg-blue-200 transition-colors"
              title={`Mentioned: ${staff.name}`}
              data-staff-id={staff.id}
            >
              @{staff.name}
            </span>
          );
        } else {
          // Invalid mention - render as plain text with @ prefix
          elements.push(
            <span key={`invalid-mention-${i}`} className="text-gray-500">
              @{mentionText}
            </span>
          );
        }
      }
    }

    return (
      <div className={`text-sm text-gray-700 whitespace-pre-wrap ${className}`}>
        {elements}
      </div>
    );
  };

  return renderCommentText();
}

// Helper component for showing mentioned staff in comment metadata
interface MentionedStaffListProps {
  mentionedStaff: Array<{ id: number; name: string; email?: string }>;
  className?: string;
}

export function MentionedStaffList({ mentionedStaff, className = "" }: MentionedStaffListProps) {
  if (!mentionedStaff || mentionedStaff.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 text-xs text-gray-500 ${className}`}>
      <span>Mentioned:</span>
      <div className="flex flex-wrap gap-1">
        {mentionedStaff.map((staff, index) => (
          <span key={staff.id} className="flex items-center">
            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
              {staff.name}
            </span>
            {index < mentionedStaff.length - 1 && <span className="mx-1">,</span>}
          </span>
        ))}
      </div>
    </div>
  );
}