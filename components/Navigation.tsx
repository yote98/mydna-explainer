"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Dna, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/translate", label: "Translate Report" },
  { href: "/lookup", label: "Variant Lookup" },
];

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="nav-header">
      <div className="nav-container">
        <Link href="/" className="nav-logo" onClick={() => setIsOpen(false)}>
          <Dna className="h-8 w-8 text-primary shadow-sm" />
          <span className="font-bold text-xl tracking-tight">MyDNA Explainer</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "nav-link-item",
                pathname === item.href
                  ? "nav-link-active"
                  : "nav-link-inactive"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-border/40 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <nav className="flex flex-col p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-[4px] text-base font-semibold transition-all",
                    pathname === item.href
                      ? "nav-link-active py-2"
                      : "nav-link-inactive"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header >
  );
}
