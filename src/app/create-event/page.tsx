import type { Metadata } from "next";
import CreateEventForm from "@/components/event/CreateEventForm";

export const metadata: Metadata = {
  title: "Create an Event | Change Together",
  description:
    "Organise a clean-up, tree plantation, donation drive or learning session for your community.",
};

export default function CreateEventPage() {
  return (
    <section className="relative overflow-hidden bg-[#FBFAF6] py-10 md:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 right-1/4 h-80 w-80 rounded-full bg-green-100 blur-3xl opacity-60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-green-100 blur-3xl opacity-50"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[10%] top-28 hidden h-32 w-32 rounded-full border border-green-200 lg:block"
      />

      <div className="container relative mx-auto px-4 md:px-8">
        <CreateEventForm />
      </div>
    </section>
  );
}
