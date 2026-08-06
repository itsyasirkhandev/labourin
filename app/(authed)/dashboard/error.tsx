"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4 max-w-sm text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
          <span className="text-lg">⚠️</span>
        </div>
        <h2 className="text-lg font-semibold text-foreground font-sans">
          Dashboard error
        </h2>
        <p className="text-sm text-muted-foreground">
          {error.message || "Failed to load dashboard data."}
        </p>
        <button
          onClick={reset}
          className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-xl transition-colors transition-transform duration-200 cursor-pointer active:scale-[0.98]"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
