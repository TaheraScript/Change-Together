"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/toast";

/**
 * Shows the "event created" success toast after the Create Event form
 * redirects here with `?created=1`, then strips the param so a refresh
 * doesn't replay the message.
 */
export default function CreatedEventToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const created = searchParams.get("created");
  const shown = useRef(false);

  useEffect(() => {
    if (created !== "1" || shown.current) return;
    shown.current = true;

    toast.add({
      type: "success",
      title: "Event created 🎉",
      description: "Your event is live and now showing under Upcoming Events.",
    });

    router.replace(pathname, { scroll: false });
  }, [created, pathname, router]);

  return null;
}
