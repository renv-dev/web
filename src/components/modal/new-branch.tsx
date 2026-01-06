"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";

interface NewbranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export function NewBranchModal({ isOpen, onClose, projectId }: NewbranchModalProps) {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setError(null);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("branch name is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/branches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create branch");
      }

      const branch = await response.json();
      router.push(`/projects/${projectId}/branches/${branch.id}`);
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1f1f1f]">
          <h2 className="text-lg font-semibold text-white">Create new branch</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1a1a1a] transition-colors"
          >
            <X className="w-4 h-4 text-[#888888]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Error */}
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
                {error}
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-[#e5e5e5]">
                branch name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="my-awesome-branch"
                className="w-full h-10 px-3 bg-[#141414] border border-[#1f1f1f] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-[#6366f1] transition-colors"
                autoFocus
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-[#1f1f1f]">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 text-sm font-medium text-[#888888] hover:text-white rounded-lg hover:bg-[#1a1a1a] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="h-9 px-4 text-sm font-medium bg-[#6366f1] hover:bg-[#5457e5] disabled:bg-[#6366f1]/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create branch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
