import { EventGridSkeleton } from "@/components/event/EventGridSkeleton";

export default function Loading() {
  return (
    <section className="min-h-screen bg-[#FBFAF6] py-10 sm:py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-10">
          <div className="max-w-xl space-y-3">
            <div className="h-3 w-36 animate-pulse rounded-full bg-slate-100" />
            <div className="h-9 w-72 max-w-full animate-pulse rounded-full bg-slate-100" />
            <div className="h-4 w-full max-w-md animate-pulse rounded-full bg-slate-100" />
            <div className="h-4 w-2/3 max-w-sm animate-pulse rounded-full bg-slate-100" />
          </div>
          <div className="h-11 w-44 shrink-0 animate-pulse rounded-xl bg-slate-100" />
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <div className="h-11 flex-1 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-11 w-32 animate-pulse rounded-xl bg-slate-100" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <div className="h-7 w-16 animate-pulse rounded-full bg-slate-100" />
            <div className="h-7 w-24 animate-pulse rounded-full bg-slate-100" />
            <div className="h-7 w-24 animate-pulse rounded-full bg-slate-100" />
            <div className="h-7 w-28 animate-pulse rounded-full bg-slate-100" />
            <div className="h-7 w-20 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>

        <EventGridSkeleton />
      </div>
    </section>
  );
}
