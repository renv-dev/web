"use client";

import Link from "next/link";
import { FolderKanban, Users, GitBranch, MoreHorizontal, Clock } from "lucide-react";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    memberCount: number;
    branchCount: number;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block p-5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl hover:border-[#333333] hover:bg-[#0f0f0f] transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6366f1]/20 to-[#a855f7]/20 border border-[#6366f1]/30 flex items-center justify-center">
            <FolderKanban className="w-5 h-5 text-[#6366f1]" />
          </div>
          <div>
            <h3 className="text-base font-medium text-white group-hover:text-[#6366f1] transition-colors">
              {project.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-[#666666]">
              <Clock className="w-3 h-3" />
              <span>Updated {formatDate(project.updatedAt)}</span>
            </div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // TODO: Open dropdown menu
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[#1a1a1a] transition-all"
        >
          <MoreHorizontal className="w-4 h-4 text-[#666666]" />
        </button>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-[#888888] mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Footer Stats */}
      <div className="flex items-center gap-4 pt-3 border-t border-[#1f1f1f]">
        <div className="flex items-center gap-1.5 text-xs text-[#666666]">
          <Users className="w-3.5 h-3.5" />
          <span>
            {project.memberCount} {project.memberCount === 1 ? "member" : "members"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#666666]">
          <GitBranch className="w-3.5 h-3.5" />
          <span>
            {project.branchCount} {project.branchCount === 1 ? "branch" : "branches"}
          </span>
        </div>
      </div>
    </Link>
  );
}
