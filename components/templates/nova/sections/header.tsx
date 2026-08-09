"use client";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { cn } from "@/lib/utils";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import ThemeToggle from "@/components/ThemeToggle";

const LogoIcon = ({ className }: { className?: string }) => (
  <svg
    className={`size-6 ${className ?? ""}`}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="LabourIn logo"
  >
    <rect x="1" y="1" width="30" height="30" rx="6" stroke="currentColor" strokeWidth="2" />
    <path
      d="M10 22V10h2v10h6v2H10Z"
      fill="currentColor"
    />
    <circle cx="22" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M22 14.5V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const menuItems = [
  { name: "How It Works", href: "#how-it-works" },
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "FAQs", href: "#faqs" },
];

export const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className={cn(
          "fixed z-20 w-full transition-[background-color,border-color,backdrop-filter] duration-300",
          isScrolled &&
            "bg-background/75 border-b border-black/5 backdrop-blur-lg",
        )}
      >
        <div className="mx-auto max-w-5xl px-6">
          <div
            className={cn(
              "relative flex flex-wrap items-center justify-between gap-6 py-6 transition-[padding,gap] duration-200 lg:gap-0",
              isScrolled && "py-3",
            )}
          >
            <div className="flex w-full justify-between gap-6 lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2 font-sans font-bold text-lg tracking-tight"
              >
                <LogoIcon />
                <span>LabourIn</span>
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-90 in-data-[state=active]:opacity-0 m-auto size-6 transition-[transform,opacity] duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-90 opacity-0 transition-[transform,opacity] duration-200" />
              </button>

              <div className="m-auto hidden size-fit lg:block">
                <ul className="flex gap-1">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={item.href}>
                          <span>{item.name}</span>
                        </Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuState(false)}
                        className="text-muted-foreground hover:text-accent-foreground block transition-colors duration-150"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full items-center flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <ThemeToggle />
                <Show when="signed-out">
                  <SignInButton mode="modal" signUpForceRedirectUrl="/select-role" signUpFallbackRedirectUrl="/select-role">
                    <Button variant="ghost" size="sm">
                      <span>Sign In</span>
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal" forceRedirectUrl="/select-role" fallbackRedirectUrl="/select-role">
                    <Button size="sm">
                      <span>Get Started</span>
                    </Button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/select-role">
                      <span>Dashboard</span>
                    </Link>
                  </Button>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "size-8",
                      },
                    }}
                  />
                </Show>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

