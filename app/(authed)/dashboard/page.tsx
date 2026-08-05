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
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-slate-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <p className="ml-2 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 font-heading">
          Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Welcome back{viewer ? `, ${viewer}` : ""}! This demo generates random
          numbers and stores them in Convex.
        </p>
      </div>

      <div className="h-px bg-slate-200 dark:bg-slate-800"></div>

      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-200">
          Number generator
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Click the button below to generate a new number. The data is persisted
          in Convex — open this page in another window and see the data sync
          automatically!
        </p>
        <button
          className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-medium px-6 py-3 rounded-xl cursor-pointer transition-colors transition-transform transition-shadow duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] w-fit"
          onClick={() => {
            void addNumber({ value: Math.floor(Math.random() * 10) });
          }}
        >
          + Generate random number
        </button>
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
          <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2 text-sm">
            Newest Numbers
          </p>
          <p className="text-slate-700 dark:text-slate-300 font-mono text-lg">
            {numbers?.length === 0
              ? "Click the button to generate a number!"
              : (numbers?.join(", ") ?? "...")}
          </p>
        </div>
      </div>

      <div className="h-px bg-slate-200 dark:bg-slate-800"></div>

      <div className="flex flex-col gap-3">
        <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-200">
          Making changes
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Edit{" "}
          <code className="text-sm font-semibold font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
            convex/authed/numbers.ts
          </code>{" "}
          to change the backend.
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Edit{" "}
          <code className="text-sm font-semibold font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
            app/(authed)/dashboard/page.tsx
          </code>{" "}
          to change the frontend.
        </p>
      </div>
    </div>
  );
}
