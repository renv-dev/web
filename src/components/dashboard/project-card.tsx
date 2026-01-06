"use client";
import { useRouter } from "next/navigation";
import { FolderKanban, Users, GitBranch, MoreHorizontal, Clock, Settings, Trash2, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { toast } from "sonner";
import Link from "next/link";


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
  const router = useRouter();

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

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(project.id);
      toast.success("Project ID copied to clipboard");
    } catch {
      toast.error("Failed to copy ID");
    }
  };

  const handleSettings = () => {
    router.push(`/projects/${project.id}/settings`);
  };

  const handleDelete = async () => {
    toast.error("Delete functionality not implemented yet", {
      description: "This feature is coming soon.",
    });
  };

  return (
    <div className="group relative block p-5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl hover:border-[#333333] hover:bg-[#0f0f0f] transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <Link href={`/projects/${project.id}`} className="flex items-center gap-3 flex-1">
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
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 opacity-0 group-hover:opacity-100 hover:bg-[#1a1a1a] transition-all"
            >
              <MoreHorizontal className="w-4 h-4 text-[#666666]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-[#0a0a0a] border-[#1f1f1f]">
            <DropdownMenuItem className="text-[#888888] hover:text-white focus:text-white focus:bg-[#1a1a1a]" onClick={handleCopyId}>
              <Copy className="w-4 h-4 mr-2" />
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[#888888] hover:text-white focus:text-white focus:bg-[#1a1a1a]" onClick={handleSettings}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#1f1f1f]" />
            <DropdownMenuItem className="text-red-500 hover:text-red-400 focus:text-red-400 focus:bg-red-500/10" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Description */}
      {project.description && (
        <Link href={`/projects/${project.id}`}>
          <p className="text-sm text-[#888888] mb-4 line-clamp-2">
            {project.description}
          </p>
        </Link>
      )}

      {/* Footer Stats */}
      <Link href={`/projects/${project.id}`} className="block">
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
    </div>
  );
}
