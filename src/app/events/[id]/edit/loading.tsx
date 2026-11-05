export default function Loading() {
  return (
    <section className="min-h-screen bg-[#FBFAF6] py-10 sm:py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-5 h-5 w-40 animate-pulse rounded-full bg-slate-100" />
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="space-y-3 border-b border-slate-100 bg-gradient-to-br from-green-50/70 via-white to-white px-6 py-7 sm:px-8">
              <div className="h-3 w-28 animate-pulse rounded-full bg-slate-100" />
              <div className="h-8 w-56 max-w-full animate-pulse rounded-full bg-slate-100" />
              <div className="h-4 w-72 max-w-full animate-pulse rounded-full bg-slate-100" />
            </div>
            <div className="space-y-5 px-6 py-7 sm:px-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100" />
                </div>
              ))}
              <div className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
