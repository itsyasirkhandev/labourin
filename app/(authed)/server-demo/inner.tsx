"use client";

import { Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Home({
  preloaded,
}: {
  preloaded: Preloaded<typeof api.public.numbers.listNumbers>;
}) {
  const data = usePreloadedQuery(preloaded);
  const addNumber = useMutation(api.authed.numbers.addNumber);
  return (
    <>
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col gap-4 bg-card text-card-foreground border border-border p-6 rounded-xl shadow-md"
      >
        <h2 className="text-xl font-bold text-foreground font-sans">
          Reactive client-loaded data
        </h2>
        <code className="bg-muted p-4 rounded-lg border border-border overflow-x-auto">
          <pre className="text-sm text-muted-foreground font-mono">
            {JSON.stringify(data, null, 2)}
          </pre>
        </code>
      </div>
      <button
        type="button"
        className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg mx-auto cursor-pointer transition-colors transition-shadow duration-200 shadow-md hover:shadow-lg font-medium"
        onClick={() => {
          void addNumber({ value: Math.floor(Math.random() * 10) });
        }}
      >
        Add a random number
      </button>
    </>
  );
}
