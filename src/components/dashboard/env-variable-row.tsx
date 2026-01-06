"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";

interface EnvVariableRowProps {
    id: string;
    envKey: string;
    value: string;
    canEdit: boolean;
    canDelete: boolean;
    onUpdate: (id: string, key: string, value: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export function EnvVariableRow({
    id,
    envKey,
    value,
    canEdit,
    canDelete,
    onUpdate,
    onDelete,
}: EnvVariableRowProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editKey, setEditKey] = useState(envKey);
    const [editValue, setEditValue] = useState(value);
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = async () => {
        if (!editKey.trim()) return;
        setIsLoading(true);
        try {
            await onUpdate(id, editKey, editValue);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete(id);
        } catch (error) {
            console.error("Failed to delete:", error);
            setIsDeleting(false);
        }
    };

    const handleCancel = () => {
        setEditKey(envKey);
        setEditValue(value);
        setIsEditing(false);
    };

    const maskedValue = "•".repeat(Math.min(value.length, 32));

    if (isEditing) {
        return (
            <div className="flex items-center gap-3 p-4 bg-[#0f0f0f] border-b border-[#1f1f1f]">
                <div className="flex-1 grid grid-cols-2 gap-3">
                    <input
                        type="text"
                        value={editKey}
                        onChange={(e) => setEditKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))}
                        className="h-9 px-3 bg-[#141414] border border-[#333333] rounded-lg text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#6366f1] transition-colors font-mono"
                        placeholder="KEY_NAME"
                    />
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-9 px-3 bg-[#141414] border border-[#333333] rounded-lg text-sm text-white placeholder-[#666666] focus:outline-none focus:border-[#6366f1] transition-colors font-mono"
                        placeholder="value"
                    />
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleSave}
                        disabled={isLoading || !editKey.trim()}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-green-500 hover:bg-green-500/10 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Check className="w-4 h-4" />
                        )}
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 p-4 hover:bg-[#0f0f0f] transition-colors border-b border-[#1f1f1f] group">
            <div className="flex-1 grid grid-cols-2 gap-3">
                <div className="flex items-center">
                    <span className="text-sm font-mono text-white">{envKey}</span>
                </div>
                <div className="flex items-center">
                    <span className="text-sm font-mono text-[#888888] truncate">
                        {isVisible ? value : maskedValue}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setIsVisible(!isVisible)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                    title={isVisible ? "Hide value" : "Show value"}
                >
                    {isVisible ? (
                        <EyeOff className="w-4 h-4" />
                    ) : (
                        <Eye className="w-4 h-4" />
                    )}
                </button>
                <button
                    onClick={handleCopy}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                    title="Copy value"
                >
                    {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                    ) : (
                        <Copy className="w-4 h-4" />
                    )}
                </button>
                {canEdit && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                )}
                {canDelete && (
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#888888] hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        title="Delete"
                    >
                        {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
