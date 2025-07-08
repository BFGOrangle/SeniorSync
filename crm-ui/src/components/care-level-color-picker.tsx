"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CareLevelColorPickerProps {
  value?: string
  onChange: (color: string) => void
  disabled?: boolean
  label?: string
}

const defaultColors = [
  "#22c55e", // Green
  "#eab308", // Yellow
  "#ef4444", // Red
  "#a855f7", // Purple
  "#6b7280", // Gray
  "#3b82f6", // Blue
  "#f97316", // Orange
  "#ec4899", // Pink
  "#10b981", // Emerald
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
  "#84cc16", // Lime
]

export function CareLevelColorPicker({ 
  value = "#000000", 
  onChange, 
  disabled = false,
  label = "Care Level Color"
}: CareLevelColorPickerProps) {
  // Ensure the value has a # prefix
  const normalizedValue = value?.startsWith('#') ? value : `#${value || '000000'}`

  const handleColorChange = (newColor: string) => {
    // Always ensure the color starts with #
    const colorWithHash = newColor.startsWith('#') ? newColor : `#${newColor}`
    console.log('Color picker change:', { newColor, colorWithHash });
    onChange(colorWithHash)
  }

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value
    console.log('Hex input change:', inputValue);
    
    // If user types without #, add it
    if (inputValue && !inputValue.startsWith('#')) {
      inputValue = `#${inputValue}`
    }
    
    // Validate hex color format (basic validation)
    if (inputValue === '#' || /^#[0-9A-Fa-f]{0,6}$/.test(inputValue)) {
      console.log('Valid hex, calling onChange with:', inputValue);
      onChange(inputValue)
    } else {
      console.log('Invalid hex format:', inputValue);
    }
  }

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {/* Color Input and Hex Text Input */}
      <div className="flex items-center space-x-2">
        <Input
          type="color"
          value={normalizedValue}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-16 h-10 p-1 border rounded cursor-pointer"
          disabled={disabled}
        />
        <Input
          type="text"
          value={value || ''}
          onChange={handleHexInputChange}
          placeholder="#000000"
          className="flex-1 font-mono"
          disabled={disabled}
          maxLength={7}
        />
      </div>

      {/* Color Palette */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Quick Colors</Label>
        <div className="grid grid-cols-6 gap-2">
          {defaultColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleColorChange(color)}
              disabled={disabled}
              className={`
                w-8 h-8 rounded border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
                ${normalizedValue.toLowerCase() === color.toLowerCase() 
                  ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-1' 
                  : 'border-gray-300 hover:border-gray-400'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
