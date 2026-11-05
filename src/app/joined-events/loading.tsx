export default function Loading() {
  return (
    <section className="min-h-screen bg-[#FBFAF6] py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-10">
          <div className="max-w-xl space-y-3">
            <div className="h-3 w-28 animate-pulse rounded-full bg-slate-100" />
            <div className="h-9 w-64 max-w-full animate-pulse rounded-full bg-slate-100" />
            <div className="h-4 w-full max-w-md animate-pulse rounded-full bg-slate-100" />
          </div>
          <div className="h-11 w-44 shrink-0 animate-pulse rounded-xl bg-slate-100" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="aspect-16/10 animate-pulse bg-slate-100" />
              <div className="space-y-3 p-5">
                <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
                <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-100" />
                <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-100" />
                <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
