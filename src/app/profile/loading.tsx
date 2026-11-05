export default function Loading() {
  return (
    <section className="min-h-screen bg-[#FBFAF6] py-10 sm:py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-8 max-w-xl space-y-3 md:mb-10">
          <div className="h-3 w-32 animate-pulse rounded-full bg-slate-100" />
          <div className="h-9 w-64 animate-pulse rounded-full bg-slate-100" />
          <div className="h-4 w-full max-w-md animate-pulse rounded-full bg-slate-100" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <div className="h-20 w-20 animate-pulse rounded-full bg-slate-100" />
              <div className="w-full space-y-3">
                <div className="h-5 w-36 animate-pulse rounded-full bg-slate-100" />
                <div className="h-7 w-48 animate-pulse rounded-full bg-slate-100" />
                <div className="h-3 w-64 max-w-full animate-pulse rounded-full bg-slate-100" />
              </div>
            </div>
            <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">
              <div className="h-4 w-32 animate-pulse rounded-full bg-slate-100" />
              <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100" />
              <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100" />
              <div className="h-11 w-40 animate-pulse rounded-xl bg-slate-100" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-white" />
          </div>
        </div>
      </div>
    </section>
  );
}
