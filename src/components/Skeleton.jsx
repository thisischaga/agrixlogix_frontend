export function SkeletonList({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-4 border-b border-slate-50 last:border-none animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-100 rounded w-1/3" />
            <div className="h-3 bg-slate-50 rounded w-1/4" />
          </div>
          <div className="h-5 bg-slate-100 rounded w-16" />
        </div>
      ))}
    </>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-50 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="h-2 bg-slate-50 rounded w-1/3" />
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="card border-slate-100 p-5 flex flex-col gap-3 animate-pulse h-full">
      <div className="flex items-center justify-between">
        <div className="h-3 bg-slate-100 rounded w-1/3" />
        <div className="w-10 h-10 rounded-xl bg-slate-50" />
      </div>
      <div className="h-8 bg-slate-100 rounded w-1/2 mt-2" />
      <div className="h-2 bg-slate-50 rounded w-1/4" />
    </div>
  );
}
