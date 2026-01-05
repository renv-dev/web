"use client";

import Link from "next/link";
import {
  GitBranch,
  Users,
  Settings,
  Plus,
  ChevronRight,
  Shield,
} from "lucide-react";

interface Branch {
  id: string;
  name: string;
  createdAt: Date;
}

type Scopes =
  | "OWNER"
  | "READ_ENV"
  | "WRITE_ENV"
  | "DELETE_ENV"
  | "READ_PROJECT"
  | "WRITE_PROJECT"
  | "DELETE_PROJECT"
  | "READ_BRANCH"
  | "WEITE_BRANCH"
  | "DELETE_BRANCH"
  | "MANAGE_MEMBERS"
  | "MANAGE_BILLING";

interface Member {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  scopes: Scopes[];
}

interface ProjectOverviewProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  branches: Branch[];
  members: Member[];
  currentUserScopes: Scopes[];
}

export function ProjectOverview({
  project,
  branches,
  members,
  currentUserScopes,
}: ProjectOverviewProps) {
  // OWNERスコープを持つか、管理系スコープを持っているかをチェック
  const isOwnerOrAdmin = currentUserScopes.includes("OWNER") || 
    currentUserScopes.includes("WRITE_PROJECT") ||
    currentUserScopes.includes("MANAGE_MEMBERS");
  
  const canManageMembers = currentUserScopes.includes("OWNER") || 
    currentUserScopes.includes("MANAGE_MEMBERS");
  
  const canManageBranches = currentUserScopes.includes("OWNER") || 
    currentUserScopes.includes("WEITE_BRANCH");

  return (
    <div className="space-y-8">
      {/* Project Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-sm text-[#888888] max-w-xl">
              {project.description}
            </p>
          )}
        </div>
        {isOwnerOrAdmin && (
          <Link
            href={`/projects/${project.id}/settings`}
            className="flex items-center gap-2 h-9 px-4 text-sm text-[#888888] hover:text-white border border-[#1f1f1f] hover:border-[#333333] rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branches Section */}
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#1f1f1f]">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-[#6366f1]" />
              <h2 className="text-sm font-medium text-white">Environments</h2>
            </div>
            {canManageBranches && (
              <button className="flex items-center gap-1.5 h-7 px-2.5 text-xs text-[#888888] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors">
                <Plus className="w-3 h-3" />
                Add
              </button>
            )}
          </div>

          <div className="divide-y divide-[#1f1f1f]">
            {branches.map((branch) => (
              <Link
                key={branch.id}
                href={`/projects/${project.id}/${branch.name}`}
                className="flex items-center justify-between p-4 hover:bg-[#0f0f0f] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#1f1f1f] flex items-center justify-center">
                    <GitBranch className="w-4 h-4 text-[#888888]" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white capitalize">
                      {branch.name}
                    </span>
                    <p className="text-xs text-[#666666]">
                      Environment variables
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#444444] group-hover:text-[#888888] transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl overflow-hidden h-fit">
          <div className="flex items-center justify-between p-4 border-b border-[#1f1f1f]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#6366f1]" />
              <h2 className="text-sm font-medium text-white">Team</h2>
            </div>
            {canManageMembers && (
              <button className="flex items-center gap-1.5 h-7 px-2.5 text-xs text-[#888888] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors">
                <Plus className="w-3 h-3" />
                Invite
              </button>
            )}
          </div>

          <div className="divide-y divide-[#1f1f1f]">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center text-white text-xs font-medium">
                    {member.name?.charAt(0)?.toUpperCase() ||
                      member.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm text-white block">
                      {member.name || member.email.split("@")[0]}
                    </span>
                    <span className="text-xs text-[#666666]">{member.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-[#141414] rounded text-xs text-[#888888]">
                  {member.scopes.includes("OWNER") && (
                    <Shield className="w-3 h-3 text-[#6366f1]" />
                  )}
                  <span className="capitalize">
                    {member.scopes.includes("OWNER") 
                      ? "owner" 
                      : member.scopes.length > 0 
                        ? `${member.scopes.length} permissions`
                        : "no permissions"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href={`/projects/${project.id}/development`}
          className="p-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl hover:border-[#333333] transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Development</span>
            <ChevronRight className="w-4 h-4 text-[#444444] group-hover:text-[#888888] transition-colors" />
          </div>
          <p className="text-xs text-[#666666]">
            Manage development environment variables
          </p>
        </Link>

        <Link
          href={`/projects/${project.id}/staging`}
          className="p-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl hover:border-[#333333] transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Staging</span>
            <ChevronRight className="w-4 h-4 text-[#444444] group-hover:text-[#888888] transition-colors" />
          </div>
          <p className="text-xs text-[#666666]">
            Manage staging environment variables
          </p>
        </Link>

        <Link
          href={`/projects/${project.id}/production`}
          className="p-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl hover:border-[#333333] transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Production</span>
            <ChevronRight className="w-4 h-4 text-[#444444] group-hover:text-[#888888] transition-colors" />
          </div>
          <p className="text-xs text-[#666666]">
            Manage production environment variables
          </p>
        </Link>
      </div>
    </div>
  );
}
