export default function StorefrontSkeleton({
  label = "Loading page",
  layout = "grid",
  embedded = false,
}) {
  const isList = layout === "list";
  const isSplit = layout === "split";

  return (
    <div
      role="status"
      aria-label={label}
      aria-busy="true"
      className={`${embedded ? "animate-pulse" : "container-custom animate-pulse py-10 sm:py-14"}`}
    >
      {!embedded && (
        <div className="mb-8 space-y-3">
          <div className="h-3 w-28 rounded bg-[#dfe6dc]" />
          <div className="h-9 w-64 max-w-full rounded bg-[#e8ece5]" />
          <div className="h-4 w-80 max-w-full rounded bg-[#e8ece5]" />
        </div>
      )}

      {isSplit ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
          <div className="space-y-4">
            {[0, 1, 2].map((item) => (
              <div key={item} className="flex gap-4 rounded-2xl border border-line bg-white p-4">
                <div className="h-24 w-24 shrink-0 rounded-xl bg-[#edf0e9]" />
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-4 w-2/3 rounded bg-[#edf0e9]" />
                  <div className="h-3 w-1/3 rounded bg-[#edf0e9]" />
                  <div className="h-3 w-1/4 rounded bg-[#edf0e9]" />
                </div>
              </div>
            ))}
          </div>
          <div className="min-h-64 rounded-2xl border border-line bg-white p-6">
            <div className="h-5 w-1/2 rounded bg-[#edf0e9]" />
            <div className="mt-8 h-4 rounded bg-[#edf0e9]" />
            <div className="mt-4 h-4 rounded bg-[#edf0e9]" />
            <div className="mt-8 h-12 rounded-full bg-[#dfe6dc]" />
          </div>
        </div>
      ) : isList ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="rounded-2xl border border-line bg-white p-5">
              <div className="flex items-center justify-between gap-5">
                <div className="w-full max-w-sm space-y-3">
                  <div className="h-4 w-1/2 rounded bg-[#edf0e9]" />
                  <div className="h-3 w-2/3 rounded bg-[#edf0e9]" />
                </div>
                <div className="h-8 w-24 rounded-full bg-[#edf0e9]" />
              </div>
              <div className="mt-5 h-12 rounded-xl bg-[#f3f5f1]" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="rounded-[1.35rem] border border-line bg-white p-3 sm:p-4">
              <div className="aspect-[4/5] rounded-xl bg-[#edf0e9]" />
              <div className="mt-4 h-3 w-1/3 rounded bg-[#edf0e9]" />
              <div className="mt-3 h-4 w-4/5 rounded bg-[#edf0e9]" />
              <div className="mt-2 h-4 w-2/3 rounded bg-[#edf0e9]" />
              <div className="mt-5 h-8 w-1/2 rounded bg-[#edf0e9]" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
