import React from 'react';

const SkeletonBase = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
);

export const SkeletonStat = () => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
    <div className="flex justify-between items-start">
      <SkeletonBase className="w-12 h-12 rounded-2xl" />
      <SkeletonBase className="w-20 h-4" />
    </div>
    <div className="space-y-2">
      <SkeletonBase className="w-24 h-8" />
      <SkeletonBase className="w-full h-3" />
    </div>
  </div>
);

export const SkeletonRow = ({ columns = 5 }) => (
  <div className="flex items-center gap-4 py-4 px-6 border-b border-slate-50">
    <SkeletonBase className="w-10 h-10 rounded-full shrink-0" />
    <div className="flex-1 grid grid-cols-5 gap-4">
      {[...Array(columns)].map((_, i) => (
        <SkeletonBase key={i} className={`h-4 ${i === 0 ? 'w-3/4' : 'w-1/2'}`} />
      ))}
    </div>
    <SkeletonBase className="w-8 h-8 rounded-lg shrink-0" />
  </div>
);

export const SkeletonCard = () => (
  <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-4">
    <div className="flex items-center gap-3">
      <SkeletonBase className="w-10 h-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <SkeletonBase className="w-1/3 h-4" />
        <SkeletonBase className="w-1/4 h-3" />
      </div>
    </div>
    <SkeletonBase className="w-full h-24 rounded-xl" />
    <div className="flex justify-between items-center pt-2">
      <SkeletonBase className="w-20 h-4" />
      <SkeletonBase className="w-16 h-8 rounded-full" />
    </div>
  </div>
);

export const SkeletonList = ({ count = 5, type = 'row' }) => (
  <div className="space-y-2">
    {[...Array(count)].map((_, i) => (
      type === 'row' ? <SkeletonRow key={i} /> : <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonBase;
