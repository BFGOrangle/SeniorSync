import React, { useState, KeyboardEvent, useRef } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  value: string; // Comma-separated string of tags
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TagInput({ value, onChange, placeholder, disabled, className }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Convert string to array of tags
  const tags = value ? value.split(',').map(tag => tag.trim()).filter(Boolean) : [];
  
  // Convert array back to string
  const tagsToString = (tagArray: string[]) => tagArray.join(', ');
  
  const addTag = (tagText: string) => {
    const trimmedTag = tagText.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      onChange(tagsToString(newTags));
    }
    setInputValue('');
  };
  
  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    onChange(tagsToString(newTags));
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag if input is empty and backspace is pressed
      removeTag(tags.length - 1);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };
  
  return (
    <div 
      className={`min-h-[40px] w-full border border-gray-300 rounded-md px-3 py-2 bg-white cursor-text focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent ${className || ''}`}
      onClick={handleContainerClick}
    >
      <div className="flex flex-wrap gap-1 items-center">
        {/* Display existing tags */}
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(index);
                }}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
        
        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          disabled={disabled}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
        />
      </div>
    </div>
  );
}