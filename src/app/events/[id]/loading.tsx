export default function Loading() {
  return (
    <section className="min-h-screen bg-[#FBFAF6] py-10 md:py-14">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-5 h-9 w-44 animate-pulse rounded-xl bg-slate-100" />
        <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <div className="aspect-video animate-pulse bg-slate-100" />
            <div className="space-y-4 p-6 sm:p-8">
              <div className="h-4 w-28 animate-pulse rounded-full bg-slate-100" />
              <div className="h-8 w-4/5 animate-pulse rounded-full bg-slate-100" />
              <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-100" />
              <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          </div>
          <div className="h-80 animate-pulse rounded-3xl border border-slate-200 bg-white" />
        </div>
      </div>
    </section>
  );
}