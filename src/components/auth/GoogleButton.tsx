"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { toast } from "@/components/ui/toast";

type GoogleButtonProps = {
  destination: string;
  onError?: (message: string) => void;
};

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export default function GoogleButton({
  destination,
  onError,
}: GoogleButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const configured = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const baseURL =
        process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000";
      const { data, error } = await signIn.social({
        provider: "google",
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
            : "Google sign-in failed. Please try again.";

      const message = configured
        ? rawMessage
        : `${rawMessage} Google OAuth isn't configured yet — add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local and restart the server.`;

      toast.add({
        type: "error",
        title: "Google sign-in failed",
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
          <GoogleMark />
        )}
        {loading ? "Connecting to Google…" : "Continue with Google"}
      </button>

      {!configured ? (
        <p className="mt-2 break-words text-center text-[11px] leading-relaxed text-slate-400">
          Demo Google sign-in — add{" "}
          <code className="break-all rounded bg-slate-100 px-1 py-0.5 text-[10px] text-slate-500">
            NEXT_PUBLIC_GOOGLE_CLIENT_ID
          </code>{" "}
          (and GOOGLE_CLIENT_SECRET) for live OAuth.
        </p>
      ) : null}
    </div>
  );
}
