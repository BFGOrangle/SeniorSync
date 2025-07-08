import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface InitialsAvatarProps {
  name: string;
  className?: string;
}

const getInitials = (name: string): string => {
  if (!name) return "N/A";
  return name
    .split(" ")
    .filter((part) => part.length > 0)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const InitialsAvatar: React.FC<InitialsAvatarProps> = ({ name, className }) => {
  return (
    <Avatar
      className={cn(
        "inline-flex items-center justify-center rounded-full h-8 w-8 bg-gray-100",
        className
      )}
    >
      <AvatarFallback className="text-xs font-medium text-gray-700">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
};

export default InitialsAvatar;
