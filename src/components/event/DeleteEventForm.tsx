"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { EventRecord } from "@/lib/events";
import { toast } from "@/components/ui/toast";
import { Trash2 } from "lucide-react";

type DeleteEventFormProps = {
  event: EventRecord;
  onDeleted?: () => void;
};

export default function DeleteEventForm({
  event,
  onDeleted,
}: DeleteEventFormProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const res = await fetch(`http://localhost:5000/events/${event._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Delete failed");
      }

      toast.add({
        type: "success",
        title: "Event cancelled",
        description: `“${event.title}” has been removed.`,
      });

      if (onDeleted) {
        onDeleted();
      } else {
        router.push("/manage-events");
        router.refresh();
      }
    } catch (error) {
      toast.add({
        type: "error",
        title: "Couldn't cancel the event",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="destructive" size="sm" disabled={deleting} />}
      >
        {deleting ? (
          "Cancelling…"
        ) : (
          <>
            <Trash2 size={14} />
            Cancel Event
          </>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel “{event.title}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The event will be removed for
            everyone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleting}>
            {deleting ? "Cancelling…" : "Cancel Event"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}