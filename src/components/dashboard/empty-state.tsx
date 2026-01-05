"use client";

import { FolderPlus } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#1f1f1f] flex items-center justify-center mb-6">
        {icon || <FolderPlus className="w-8 h-8 text-[#444444]" />}
      </div>

      {/* Text */}
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-sm text-[#888888] text-center max-w-sm mb-6">
        {description}
      </p>

      {/* Action */}
      {action}
    </div>
  );
}
