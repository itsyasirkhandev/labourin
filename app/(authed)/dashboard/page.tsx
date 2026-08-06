"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function DashboardPage() {
  const { viewer, numbers } =
    useQuery(api.authed.numbers.listNumbers, {
      count: 10,
    }) ?? {};
  const addNumber = useMutation(api.authed.numbers.addNumber);

  if (viewer === undefined || numbers === undefined) {
    return (
      <div className="flex items-center justify-center py-20" role="status" aria-live="polite">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-muted-foreground/80 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <p className="ml-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-sans">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Welcome back{viewer ? `, ${viewer}` : ""}! This demo generates random
          numbers and stores them in Convex.
        </p>
      </div>

      <div className="h-px bg-border"></div>

      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-lg text-foreground font-sans">
          Number generator
        </h2>
        <p className="text-muted-foreground text-sm">
          Click the button below to generate a new number. The data is persisted
          in Convex — open this page in another window and see the data sync
          automatically!
        </p>
        <button
          type="button"
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-6 py-3 rounded-xl cursor-pointer transition-colors transition-transform transition-shadow duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] w-fit"
          onClick={() => {
            void addNumber({ value: Math.floor(Math.random() * 10) });
          }}
        >
          + Generate random number
        </button>
        <div
          role="status"
          aria-live="polite"
          className="bg-card text-card-foreground border border-border rounded-xl p-5 shadow-sm"
        >
          <p className="font-semibold text-foreground mb-2 text-sm">
            Newest Numbers
          </p>
          <p className="text-foreground font-mono text-lg">
            {numbers?.length === 0
              ? "Click the button to generate a number!"
              : (numbers?.join(", ") ?? "...")}
          </p>
        </div>
      </div>

      <div className="h-px bg-border"></div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-lg text-foreground font-sans">
          Making changes
        </h2>
        <p className="text-muted-foreground text-sm">
          Edit{" "}
          <code className="text-sm font-semibold font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded-md border border-border">
            convex/authed/numbers.ts
          </code>{" "}
          to change the backend.
        </p>
        <p className="text-muted-foreground text-sm">
          Edit{" "}
          <code className="text-sm font-semibold font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded-md border border-border">
            app/(authed)/dashboard/page.tsx
          </code>{" "}
          to change the frontend.
        </p>
      </div>
    </div>
  );
}
