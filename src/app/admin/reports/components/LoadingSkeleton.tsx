// src/app/admin/reports/components/LoadingSkeleton.tsx

export function ListSkeleton() {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-[#0A1628] border border-white/5 rounded-2xl p-4 space-y-2 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-white/10 rounded w-48" />
              <div className="h-5 bg-white/10 rounded-full w-20" />
            </div>
            <div className="h-3 bg-white/5 rounded w-32" />
          </div>
        ))}
      </div>
    )
  }
  
  export function DetailSkeleton() {
    return (
      <div className="bg-[#0A1628] border border-white/5 rounded-2xl p-6 space-y-5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-white/10 rounded w-56" />
          <div className="h-5 bg-white/10 rounded-full w-24" />
        </div>
        <div className="h-3 bg-white/5 rounded w-40" />
        <div className="space-y-3 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 bg-white/5 rounded w-24" />
              <div className="h-16 bg-white/5 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  export function DashboardSkeleton() {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#0A1628] border border-white/5 rounded-2xl p-5 space-y-3">
              <div className="h-3 bg-white/10 rounded w-20" />
              <div className="h-8 bg-white/10 rounded w-12" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#0A1628] border border-white/5 rounded-2xl p-5 space-y-3">
              <div className="h-4 bg-white/10 rounded w-32" />
              <div className="h-3 bg-white/5 rounded w-48" />
              <div className="h-2 bg-white/5 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }
  