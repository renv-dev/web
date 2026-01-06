"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Save,
    Trash2,
    Loader2,
    AlertTriangle,
    Users,
    Key,
    Settings,
    Shield,
    Copy,
    Plus,
    Eye,
    EyeOff,
    Check,
    X,
    Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { scopes } from "@prisma/client";

interface Member {
    id: string;
    userId: string;
    scopes: scopes[];
    user: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
    };
}

interface Token {
    id: string;
    token: string;
    scopes: scopes[];
    expiresAt: Date;
    createdAt: Date;
}

interface ProjectSettingsFormProps {
    project: {
        id: string;
        name: string;
        description: string | null;
        ownerId: string;
        createdAt: Date;
    };
    members: Member[];
    tokens: Token[];
    currentUserScopes: scopes[];
    currentUserId: string;
}

export function ProjectSettingsForm({
    project,
    members,
    tokens: initialTokens,
    currentUserScopes,
    currentUserId,
}: ProjectSettingsFormProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"general" | "members" | "tokens" | "danger">("general");

    const isOwner = currentUserScopes.includes("OWNER");
    const canManageMembers = isOwner || currentUserScopes.includes("MANAGE_MEMBERS");
    const canWriteProject = isOwner || currentUserScopes.includes("WRITE_PROJECT");
    const canDeleteProject = isOwner || currentUserScopes.includes("DELETE_PROJECT");

    const tabs = [
        { id: "general" as const, label: "General", icon: Settings, show: true },
        { id: "members" as const, label: "Members", icon: Users, show: true },
        { id: "tokens" as const, label: "API Tokens", icon: Key, show: true },
        { id: "danger" as const, label: "Danger Zone", icon: AlertTriangle, show: canDeleteProject },
    ].filter((tab) => tab.show);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="border-b border-[#1f1f1f] bg-[#0a0a0a]/80 backdrop-blur-sm px-6 py-4">
                <Link
                    href={`/projects/${project.id}`}
                    className="inline-flex items-center gap-2 text-sm text-[#888888] hover:text-white mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Project
                </Link>
                <h1 className="text-2xl font-semibold text-white">Project Settings</h1>
                <p className="text-sm text-[#888888] mt-1">{project.name}</p>
            </div>

            <div className="flex space-y-4">
                {/* Sidebar */}
                <div className="w-64 border-r border-[#1f1f1f] min-h-[calc(100vh-120px)] p-4 p-2">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                                    activeTab === tab.id
                                        ? "bg-[#1a1a1a] text-white"
                                        : "text-[#888888] hover:text-white hover:bg-[#141414]"
                                }`}
                            >
                                <tab.icon className={`w-4 h-4 ${tab.id === "danger" ? "text-red-500" : ""}`} />
                                <span className={tab.id === "danger" ? "text-red-500" : ""}>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 lg:p-8 max-w-3xl">
                    {activeTab === "general" && (
                        <GeneralSettings project={project} canEdit={canWriteProject} />
                    )}
                    {activeTab === "members" && (
                        <MembersSettings
                            projectId={project.id}
                            members={members}
                            ownerId={project.ownerId}
                            canManage={canManageMembers}
                            currentUserId={currentUserId}
                        />
                    )}
                    {activeTab === "tokens" && (
                        <TokensSettings projectId={project.id} tokens={initialTokens} />
                    )}
                    {activeTab === "danger" && (
                        <DangerZone project={project} canDelete={canDeleteProject} />
                    )}
                </div>
            </div>
        </div>
    );
}

// General Settings Tab
function GeneralSettings({
    project,
    canEdit,
}: {
    project: { id: string; name: string; description: string | null; createdAt: Date };
    canEdit: boolean;
}) {
    const router = useRouter();
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description || "");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Project name is required");
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`/api/projects/${project.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to update project");
            }

            toast.success("Project updated successfully");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update project");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-white mb-1">General Settings</h2>
                <p className="text-sm text-[#888888]">Manage your project details</p>
            </div>

            <div className="space-y-4 mt-8">
                <div>
                    <label className="block text-sm font-medium text-white mb-2">
                        Project Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={!canEdit}
                        className="w-full h-10 px-3 bg-[#141414] border border-[#1f1f1f] rounded-lg text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#6366f1] transition-colors disabled:opacity-50"
                        placeholder="My Project"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white mb-2">
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={!canEdit}
                        rows={3}
                        className="w-full px-3 py-2 bg-[#141414] border border-[#1f1f1f] rounded-lg text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#6366f1] transition-colors resize-none disabled:opacity-50"
                        placeholder="A brief description of your project"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white mb-2">
                        Project ID
                    </label>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 h-10 px-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg text-sm text-[#888888] font-mono flex items-center">
                            {project.id}
                        </code>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(project.id);
                                toast.success("Project ID copied");
                            }}
                            className="h-10 px-3 bg-[#141414] border border-[#1f1f1f] rounded-lg text-[#888888] hover:text-white hover:border-[#333333] transition-colors"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-white mb-2">
                        Created At
                    </label>
                    <div className="flex items-center gap-2 text-sm text-[#888888]">
                        <Calendar className="w-4 h-4" />
                        {new Date(project.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </div>
                </div>
            </div>

            {canEdit && (
                <div className="pt-4 border-t border-[#1f1f1f] mt-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 h-10 px-4 text-sm text-white bg-[#6366f1] hover:bg-[#5558e3] rounded-lg transition-colors disabled:opacity-50 w-full justify-center"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
}

// Members Settings Tab
function MembersSettings({
    projectId,
    members,
    ownerId,
    canManage,
    currentUserId,
}: {
    projectId: string;
    members: Member[];
    ownerId: string;
    canManage: boolean;
    currentUserId: string;
}) {
    const router = useRouter();
    const [isInviting, setIsInviting] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInvite = async () => {
        if (!inviteEmail.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/projects/${projectId}/members`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to invite member");
            }

            toast.success("Member invited successfully");
            setInviteEmail("");
            setIsInviting(false);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to invite member");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        try {
            const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to remove member");
            }

            toast.success("Member removed");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to remove member");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-medium text-white mb-1">Team Members</h2>
                    <p className="text-sm text-[#888888]">Manage who has access to this project</p>
                </div>
                {canManage && (
                    <button
                        onClick={() => setIsInviting(true)}
                        className="flex items-center gap-2 h-9 px-4 text-sm text-white bg-[#6366f1] hover:bg-[#5558e3] rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Invite
                    </button>
                )}
            </div>

            {/* Invite Form */}
            {isInviting && (
                <div className="p-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl mt-8 mb-4">
                    <div className="flex items-center gap-3">
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="Enter email address"
                            className="flex-1 h-10 px-3 bg-[#141414] border border-[#1f1f1f] rounded-lg text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#6366f1] transition-colors"
                            autoFocus
                        />
                        <button
                            onClick={handleInvite}
                            disabled={isSubmitting || !inviteEmail.trim()}
                            className="h-10 px-4 text-sm text-white bg-[#6366f1] hover:bg-[#5558e3] rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Invite"}
                        </button>
                        <button
                            onClick={() => {
                                setIsInviting(false);
                                setInviteEmail("");
                            }}
                            className="h-10 px-3 text-[#888888] hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Members List */}
            <div className={`bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl overflow-hidden ${!isInviting ? 'mt-8' : ''}`}>
                <div className="divide-y divide-[#1f1f1f]">
                    {members.map((member) => {
                        const isOwnerMember = member.userId === ownerId;
                        const isCurrentUser = member.userId === currentUserId;

                        return (
                            <div key={member.id} className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center text-white text-sm font-medium">
                                        {member.user.name?.charAt(0)?.toUpperCase() ||
                                            member.user.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white">
                                                {member.user.name || member.user.email.split("@")[0]}
                                            </span>
                                            {isCurrentUser && (
                                                <span className="px-1.5 py-0.5 text-xs bg-[#1f1f1f] rounded text-[#888888]">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-[#666666]">{member.user.email}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-[#141414] rounded text-xs text-[#888888]">
                                        {isOwnerMember && <Shield className="w-3 h-3 text-[#6366f1]" />}
                                        <span>
                                            {isOwnerMember
                                                ? "Owner"
                                                : member.scopes.length > 0
                                                ? `${member.scopes.length} permissions`
                                                : "No permissions"}
                                        </span>
                                    </div>
                                    {canManage && !isOwnerMember && !isCurrentUser && (
                                        <button
                                            onClick={() => handleRemoveMember(member.id)}
                                            className="p-2 text-[#888888] hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// Tokens Settings Tab
function TokensSettings({
    projectId,
    tokens: initialTokens,
}: {
    projectId: string;
    tokens: Token[];
}) {
    const router = useRouter();
    const [tokens, setTokens] = useState(initialTokens);
    const [isCreating, setIsCreating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newTokenName, setNewTokenName] = useState("");
    const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set());
    const [copiedToken, setCopiedToken] = useState<string | null>(null);

    const handleCreateToken = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/projects/${projectId}/tokens`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newTokenName }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to create token");
            }

            const result = await response.json();
            toast.success("Token created successfully");
            setNewTokenName("");
            setIsCreating(false);
            router.refresh();
            // Show the new token
            setVisibleTokens((prev) => new Set(prev).add(result.data.id));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create token");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteToken = async (tokenId: string) => {
        try {
            const response = await fetch(`/api/projects/${projectId}/tokens/${tokenId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to delete token");
            }

            setTokens((prev) => prev.filter((t) => t.id !== tokenId));
            toast.success("Token deleted");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete token");
        }
    };

    const handleCopyToken = (tokenId: string, token: string) => {
        navigator.clipboard.writeText(token);
        setCopiedToken(tokenId);
        toast.success("Token copied to clipboard");
        setTimeout(() => setCopiedToken(null), 2000);
    };

    const toggleTokenVisibility = (tokenId: string) => {
        setVisibleTokens((prev) => {
            const next = new Set(prev);
            if (next.has(tokenId)) {
                next.delete(tokenId);
            } else {
                next.add(tokenId);
            }
            return next;
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-medium text-white mb-1">API Tokens</h2>
                    <p className="text-sm text-[#888888]">Create tokens to access your environment variables via SDK</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 h-9 px-4 text-sm text-white bg-[#6366f1] hover:bg-[#5558e3] rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create Token
                </button>
            </div>

            {/* Create Token Form */}
            {isCreating && (
                <div className="p-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl mt-8">
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={newTokenName}
                            onChange={(e) => setNewTokenName(e.target.value)}
                            placeholder="Token name (optional)"
                            className="flex-1 h-10 px-3 bg-[#141414] border border-[#1f1f1f] rounded-lg text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#6366f1] transition-colors"
                            autoFocus
                        />
                        <button
                            onClick={handleCreateToken}
                            disabled={isSubmitting}
                            className="h-10 px-4 text-sm text-white bg-[#6366f1] hover:bg-[#5558e3] rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                        </button>
                        <button
                            onClick={() => {
                                setIsCreating(false);
                                setNewTokenName("");
                            }}
                            className="h-10 px-3 text-[#888888] hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Tokens List */}
            <div className={`bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl overflow-hidden ${!isCreating ? 'mt-8' : ''}`}>
                {tokens.length > 0 ? (
                    <div className="divide-y divide-[#1f1f1f]">
                        {tokens.map((token) => {
                            const isVisible = visibleTokens.has(token.id);
                            const isExpired = new Date(token.expiresAt) < new Date();

                            return (
                                <div key={token.id} className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Key className="w-4 h-4 text-[#6366f1]" />
                                            <span className="text-sm text-white font-mono">
                                                {isVisible
                                                    ? token.token
                                                    : `${token.token.slice(0, 12)}${"•".repeat(20)}`}
                                            </span>
                                            {isExpired && (
                                                <span className="px-1.5 py-0.5 text-xs bg-red-500/10 text-red-500 rounded">
                                                    Expired
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => toggleTokenVisibility(token.id)}
                                                className="p-2 text-[#888888] hover:text-white transition-colors"
                                            >
                                                {isVisible ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleCopyToken(token.id, token.token)}
                                                className="p-2 text-[#888888] hover:text-white transition-colors"
                                            >
                                                {copiedToken === token.id ? (
                                                    <Check className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteToken(token.id)}
                                                className="p-2 text-[#888888] hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-[#666666]">
                                        <span>
                                            Created{" "}
                                            {new Date(token.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </span>
                                        <span>
                                            Expires{" "}
                                            {new Date(token.expiresAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 rounded-xl bg-[#141414] border border-[#1f1f1f] flex items-center justify-center mx-auto mb-4">
                            <Key className="w-6 h-6 text-[#666666]" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No API tokens</h3>
                        <p className="text-sm text-[#888888] mb-6">
                            Create a token to access your environment variables via the SDK.
                        </p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="inline-flex items-center gap-2 h-9 px-4 text-sm text-white bg-[#6366f1] hover:bg-[#5558e3] rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Create Token
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Danger Zone Tab
function DangerZone({
    project,
    canDelete,
}: {
    project: { id: string; name: string };
    canDelete: boolean;
}) {
    const router = useRouter();
    const [confirmName, setConfirmName] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (confirmName !== project.name) {
            toast.error("Project name does not match");
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/projects/${project.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to delete project");
            }

            toast.success("Project deleted successfully");
            router.push("/projects");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete project");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!canDelete) {
        return (
            <div className="p-6 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl text-center">
                <AlertTriangle className="w-8 h-8 text-[#666666] mx-auto mb-3" />
                <p className="text-sm text-[#888888]">
                    You don&apos;t have permission to delete this project.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-red-500 mb-1">Danger Zone</h2>
                <p className="text-sm text-[#888888]">Irreversible and destructive actions</p>
            </div>

            <div className="p-6 bg-[#0a0a0a] border border-red-500/20 rounded-xl mt-8">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <Trash2 className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-medium text-white mb-1">Delete Project</h3>
                        <p className="text-sm text-[#888888] mb-4">
                            Once you delete a project, there is no going back. This will permanently delete the
                            project, all branches, environment variables, and remove all team members.
                        </p>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm text-[#888888] mb-2">
                                    Type <span className="font-mono text-white">{project.name}</span> to confirm
                                </label>
                                <input
                                    type="text"
                                    value={confirmName}
                                    onChange={(e) => setConfirmName(e.target.value)}
                                    className="w-full h-10 px-3 bg-[#141414] border border-[#1f1f1f] rounded-lg text-sm text-white placeholder-[#666666] focus:outline-none focus:border-red-500 transition-colors"
                                    placeholder={project.name}
                                />
                            </div>
                            <button
                                onClick={handleDelete}
                                disabled={confirmName !== project.name || isDeleting}
                                className="flex items-center gap-2 h-10 px-4 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                                Delete Project
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
