"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Building2, ToggleLeft, ToggleRight } from "lucide-react";

export type DashboardMode = 'personal' | 'center';

interface DashboardToggleProps {
  mode: DashboardMode;
  onModeChange: (mode: DashboardMode) => void;
  className?: string;
}

export function DashboardToggle({ mode, onModeChange, className }: DashboardToggleProps) {
  const isPersonal = mode === 'personal';

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Badge variant="secondary" className="text-xs">
        Dashboard View
      </Badge>
      <div className="flex items-center bg-gray-100 rounded-md p-1">
        <Button
          variant={isPersonal ? "default" : "ghost"}
          size="sm"
          onClick={() => onModeChange('personal')}
          className={`flex items-center gap-2 px-3 py-1 h-8 ${
            isPersonal 
              ? 'bg-white shadow-sm' 
              : 'hover:bg-gray-200'
          }`}
        >
          <User className="h-3 w-3" />
          <span className="text-xs font-medium">Personal</span>
        </Button>
        <Button
          variant={!isPersonal ? "default" : "ghost"}
          size="sm"
          onClick={() => onModeChange('center')}
          className={`flex items-center gap-2 px-3 py-1 h-8 ${
            !isPersonal 
              ? 'bg-white shadow-sm' 
              : 'hover:bg-gray-200'
          }`}
        >
          <Building2 className="h-3 w-3" />
          <span className="text-xs font-medium">Center</span>
        </Button>
      </div>
    </div>
  );
}

export default DashboardToggle; 