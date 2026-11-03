"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { toast } from "@/components/ui/toast";

type GithubButtonProps = {
  destination: string;
  onError?: (message: string) => void;
};

function GithubMark() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-[18px] w-[18px] text-[#24292f]"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export default function GithubButton({
  destination,
  onError,
}: GithubButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const configured = Boolean(process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const baseURL =
        process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000";
      const { data, error } = await signIn.social({
        provider: "github",
        callbackURL: `${baseURL}${destination}`,
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        router.push(destination);
      }
    } catch (error) {
      const rawMessage =
        error instanceof Error
          ? error.message
          : typeof error === "object" &&
              error !== null &&
              "message" in error &&
              typeof (error as { message?: unknown }).message === "string"
            ? (error as { message: string }).message
            : "GitHub sign-in failed. Please try again.";

      const message = configured
        ? rawMessage
        : "GitHub sign-in isn't available right now. Please try another sign-in option.";

      if (!configured) {
        console.error(
          "GitHub OAuth not configured: add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to .env.local and restart the server.",
          rawMessage,
        );
      }

      toast.add({
        type: "error",
        title: "GitHub sign-in failed",
        description: message,
      });
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin text-slate-400" />
        ) : (
          <GithubMark />
        )}
        {loading ? "Connecting to GitHub…" : "Continue with GitHub"}
      </button>

      {!configured ? (
        <p className="mt-2 text-center text-xs leading-relaxed text-slate-400">
          GitHub sign-in isn&apos;t available right now. Please use your email
          or another sign-in option.
        </p>
      ) : (
        <p className="mt-2 text-center text-xs leading-relaxed text-slate-400">
          We only use your GitHub name and email to create your account.
        </p>
      )}
    </div>
  );
}