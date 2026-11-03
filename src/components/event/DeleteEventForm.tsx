"use client";

import { useState } from "react";
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
import { deleteEvent, type EventRecord } from "@/lib/events";
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
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEvent(event._id);
      toast.add({
        type: "success",
        title: "Event cancelled",
        description: `“${event.title}” has been removed.`,
      });
      onDeleted?.();
    } catch (error) {
      setDeleting(false);
      toast.add({
        type: "error",
        title: "Couldn't cancel the event",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button variant="destructive" size="sm">
          {deleting ? (
            "Cancelling…"
          ) : (
            <>
              <Trash2 size={14} />
              Cancel Event
            </>
          )}
        </Button>
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
