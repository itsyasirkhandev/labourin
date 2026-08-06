"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import ThemeToggle from "@/components/ThemeToggle";
import { UserButton, Show } from "@clerk/nextjs";
import { useAppStore } from "@/store";
import {
  House,
  List,
  Desktop,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: House },
  { href: "/server-demo", label: "Server Demo", icon: Desktop },
];

function Sidebar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 bg-black/30 z-40 lg:hidden w-full h-full border-0 cursor-default"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        id="app-sidebar"
        aria-label="Sidebar navigation"
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <Link href="/" className="text-lg font-bold text-sidebar-foreground font-sans">
            LabourIn
          </Link>
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
            className="lg:hidden p-1 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors cursor-pointer"
          >
            <X size={18} aria-hidden="true" className="text-muted-foreground" />
          </button>
        </div>

        <nav aria-label="Main Navigation" className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (sidebarOpen) toggleSidebar();
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <Icon size={18} weight={isActive ? "fill" : "regular"} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground text-center">
            LabourIn v0.1.0
          </p>
        </div>
      </aside>
    </>
  );
}

function Header() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="Open sidebar"
        aria-expanded={sidebarOpen}
        aria-controls="app-sidebar"
        className="lg:hidden p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
      >
        <List size={20} aria-hidden="true" className="text-muted-foreground" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  );
}

export default function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
