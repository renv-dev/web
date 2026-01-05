"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { NewProjectModal } from "../modal/new-project-modal";

interface NewProjectButtonProps {
  size?: "default" | "lg";
}

export function NewProjectButton({ size = "default" }: NewProjectButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    default: "h-9 px-4 text-sm",
    lg: "h-11 px-6 text-base",
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 bg-[#6366f1] hover:bg-[#5457e5] text-white font-medium rounded-lg transition-colors ${sizeClasses[size]}`}
      >
        <Plus className={size === "lg" ? "w-5 h-5" : "w-4 h-4"} />
        New Project
      </button>

      <NewProjectModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
