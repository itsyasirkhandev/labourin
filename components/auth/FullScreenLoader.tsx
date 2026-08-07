"use client";

interface FullScreenLoaderProps {
  label: string;
}

export function FullScreenLoader({ label }: FullScreenLoaderProps) {
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-background"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-border border-t-primary animate-spin"></div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
