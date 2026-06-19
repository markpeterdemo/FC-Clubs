'use client';

import { Boxes, Lock, ChartBar, TrendingUp } from 'lucide-react';

function PulsingBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`}
    />
  );
}

function SkeletonCard({ icon: Icon }: { icon: typeof Boxes }) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
      <div className="flex items-start justify-between">
        <PulsingBlock className="h-3 w-24" />
        <Icon className="h-4 w-4 text-slate-600" />
      </div>
      <PulsingBlock className="mt-3 h-7 w-28" />
    </div>
  );
}

export default function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <SkeletonCard icon={Boxes} />
        <SkeletonCard icon={Lock} />
        <SkeletonCard icon={ChartBar} />
        <SkeletonCard icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-[380px_1fr] gap-5">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <PulsingBlock className="mb-4 h-4 w-20" />
          <div className="space-y-4">
            <PulsingBlock className="h-24 w-full" />
            <PulsingBlock className="h-10 w-full" />
            <PulsingBlock className="h-10 w-full" />
            <div className="grid grid-cols-2 gap-3">
              <PulsingBlock className="h-10 w-full" />
              <PulsingBlock className="h-10 w-full" />
            </div>
            <PulsingBlock className="h-10 w-full" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <PulsingBlock className="mb-4 h-4 w-24" />
          <div className="space-y-3">
            <div className="flex gap-1.5">
              <PulsingBlock className="h-6 w-12 rounded-lg" />
              <PulsingBlock className="h-6 w-14 rounded-lg" />
              <PulsingBlock className="h-6 w-16 rounded-lg" />
              <PulsingBlock className="h-6 w-14 rounded-lg" />
              <PulsingBlock className="h-6 w-12 rounded-lg" />
            </div>
            <div className="rounded-lg border border-slate-700/50">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 border-b border-slate-800/60 px-4 py-3"
                >
                  <PulsingBlock className="h-10 w-10 rounded-md" />
                  <div className="flex-1 space-y-1.5">
                    <PulsingBlock className="h-3.5 w-36" />
                    <PulsingBlock className="h-3 w-24" />
                  </div>
                  <PulsingBlock className="h-5 w-16" />
                  <PulsingBlock className="h-5 w-16" />
                  <PulsingBlock className="h-5 w-16" />
                  <PulsingBlock className="h-5 w-16" />
                  <PulsingBlock className="h-5 w-12 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
