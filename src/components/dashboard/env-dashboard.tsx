"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    Plus,
    Download,
    Upload,
    Key,
    Loader2,
    Check,
    X,
    AlertCircle,
} from "lucide-react";
import { EnvVariableRow } from "./env-variable-row";

interface EnvVariable {
    id: string;
    key: string;
    value: string;
    createdAt: Date;
    updatedAt: Date;
}

interface EnvDashboardProps {
    branchId: string;
    projectId: string;
    envs: EnvVariable[];
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
}

export function EnvDashboard({
    branchId,
    projectId,
    envs: initialEnvs,
    canRead,
    canWrite,
    canDelete,
}: EnvDashboardProps) {
    const router = useRouter();
    const [envs, setEnvs] = useState(initialEnvs);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [newKey, setNewKey] = useState("");
    const [newValue, setNewValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const filteredEnvs = useMemo(() => {
        if (!searchQuery.trim()) return envs;
        const query = searchQuery.toLowerCase();
        return envs.filter((env) =>
            env.key.toLowerCase().includes(query)
        );
    }, [envs, searchQuery]);

    const handleAdd = async () => {
        if (!newKey.trim()) {
            setError("Key is required");
            return;
        }

        // Check for duplicate key
        if (envs.some((env) => env.key === newKey)) {
            setError("This key already exists");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`/api/projects/${projectId}/branches/${branchId}/envs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: newKey, value: newValue }),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Failed to create environment variable");
            }

            setEnvs((prev) => [...prev, result.data]);
            setNewKey("");
            setNewValue("");
            setIsAdding(false);
            router.refresh();
        } catch {
            setError("Failed to create");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (id: string, key: string, value: string) => {
        const response = await fetch(`/api/projects/${projectId}/branches/${branchId}/envs/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key, value }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || "Failed to update");
        }

        setEnvs((prev) =>
            prev.map((env) => (env.id === id ? result.data : env))
        );
        router.refresh();
    };

    const handleDelete = async (id: string) => {
        const response = await fetch(`/api/projects/${projectId}/branches/${branchId}/envs/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || "Failed to delete");
        }

        setEnvs((prev) => prev.filter((env) => env.id !== id));
        router.refresh();
    };

    const handleExport = () => {
        const content = envs.map((env) => `${env.key}=${env.value}`).join("\n");
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = ".env";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const text = await file.text();
        const lines = text.split("\n").filter((line) => line.trim() && !line.startsWith("#"));
        
        for (const line of lines) {
            const [key, ...valueParts] = line.split("=");
            const value = valueParts.join("=");
            if (key && value !== undefined) {
                const trimmedKey = key.trim();
                const trimmedValue = value.trim();
                
                // Check if key already exists
                const existingEnv = envs.find((env) => env.key === trimmedKey);
                if (existingEnv) {
                    // Update existing
                    await handleUpdate(existingEnv.id, trimmedKey, trimmedValue);
                } else {
                    // Create new
                    try {
                        const response = await fetch(`/api/projects/${projectId}/branches/${branchId}/envs`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ key: trimmedKey, value: trimmedValue }),
                        });
                        if (response.ok) {
                            const result = await response.json();
                            setEnvs((prev) => [...prev, result.data]);
                        }
                    } catch (err) {
                        console.error("Error importing variable:", err);
                        console.error("Failed to import:", trimmedKey);
                    }
                }
            }
        }
        
        router.refresh();
        e.target.value = "";
    };

    const handleCancelAdd = () => {
        setIsAdding(false);
        setNewKey("");
        setNewValue("");
        setError(null);
    };

    if (!canRead) {
        return (
            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#141414] border border-[#1f1f1f] flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-6 h-6 text-[#666666]" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                    Access Denied
                </h3>
                <p className="text-sm text-[#888888]">
                    You don&apos;t have permission to view environment variables.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                    <input
                        type="text"
                        placeholder="Search variables..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 bg-[#141414] border border-[#1f1f1f] rounded-lg text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#333333] transition-colors"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {canWrite && (
                        <>
                            <label className="flex items-center gap-2 h-9 px-3 text-sm text-[#888888] hover:text-white border border-[#1f1f1f] hover:border-[#333333] rounded-lg transition-colors cursor-pointer">
                                <Upload className="w-4 h-4" />
                                Import
                                <input
                                    type="file"
                                    accept="text/*,.env,.env.*"
                                    onChange={handleImport}
                                    className="hidden"
                                />
                            </label>
                        </>
                    )}
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 h-9 px-3 text-sm text-[#888888] hover:text-white border border-[#1f1f1f] hover:border-[#333333] rounded-lg transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    {canWrite && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="flex items-center gap-2 h-9 px-4 text-sm text-white bg-[#6366f1] hover:bg-[#5558e3] rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Variable
                        </button>
                    )}
                </div>
            </div>

            {/* Env Variables Table */}
            <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-2 gap-3 p-4 border-b border-[#1f1f1f] bg-[#0f0f0f]">
                    <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-[#6366f1]" />
                        <span className="text-xs font-medium text-[#888888] uppercase tracking-wider">
                            Key
                        </span>
                    </div>
                    <div>
                        <span className="text-xs font-medium text-[#888888] uppercase tracking-wider">
                            Value
                        </span>
                    </div>
                </div>

                {/* Add New Row */}
                {isAdding && (
                    <div className="p-4 bg-[#0f0f0f] border-b border-[#1f1f1f]">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={newKey}
                                    onChange={(e) => {
                                        setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""));
                                        setError(null);
                                    }}
                                    className="h-9 px-3 bg-[#141414] border border-[#333333] rounded-lg text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#6366f1] transition-colors font-mono"
                                    placeholder="KEY_NAME"
                                    autoFocus
                                />
                                <input
                                    type="text"
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    className="h-9 px-3 bg-[#141414] border border-[#333333] rounded-lg text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#6366f1] transition-colors font-mono"
                                    placeholder="value"
                                />
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleAdd}
                                    disabled={isSubmitting || !newKey.trim()}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-green-500 hover:bg-green-500/10 transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                </button>
                                <button
                                    onClick={handleCancelAdd}
                                    disabled={isSubmitting}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        {error && (
                            <p className="mt-2 text-xs text-red-500">{error}</p>
                        )}
                    </div>
                )}

                {/* Env Rows */}
                {filteredEnvs.length > 0 ? (
                    <div>
                        {filteredEnvs.map((env) => (
                            <EnvVariableRow
                                key={env.id}
                                id={env.id}
                                envKey={env.key}
                                value={env.value}
                                canEdit={canWrite}
                                canDelete={canDelete}
                                onUpdate={handleUpdate}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 rounded-xl bg-[#141414] border border-[#1f1f1f] flex items-center justify-center mx-auto mb-4">
                            <Key className="w-6 h-6 text-[#666666]" />
                        </div>
                        {searchQuery ? (
                            <>
                                <h3 className="text-lg font-medium text-white mb-2">
                                    No results found
                                </h3>
                                <p className="text-sm text-[#888888]">
                                    No environment variables match &quot;{searchQuery}&quot;
                                </p>
                            </>
                        ) : (
                            <>
                                <h3 className="text-lg font-medium text-white mb-2">
                                    No environment variables
                                </h3>
                                <p className="text-sm text-[#888888] mb-6">
                                    Add your first environment variable to get started.
                                </p>
                                {canWrite && (
                                    <button
                                        onClick={() => setIsAdding(true)}
                                        className="inline-flex items-center gap-2 h-9 px-4 text-sm text-white bg-[#6366f1] hover:bg-[#5558e3] rounded-lg transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Variable
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-[#666666]">
                <span>
                    {filteredEnvs.length} of {envs.length} variable{envs.length !== 1 ? "s" : ""}
                </span>
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery("")}
                        className="text-[#6366f1] hover:underline"
                    >
                        Clear search
                    </button>
                )}
            </div>
        </div>
    );
}
