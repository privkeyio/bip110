import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

const sections = [
  { label: "Key Points", href: "/#key" },
  { label: "Run BIP-110", href: "/#run" },
  { label: "Why", href: "/#why" },
  { label: "How It Works", href: "/#how" },
  { label: "FAQ", href: "/#faq" },
  { label: "Articles", href: "/#articles" },
  { label: "Tradeoffs", href: "/#tradeoffs" },
  { label: "Timeline", href: "/#timeline" },
];

const pages = [
  { label: "Home", href: "/" },
  { label: "How To", href: "/howto" },
  { label: "Articles", href: "/articles" },
];

const linkClass =
  "px-3 py-1.5 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors";

function DesktopNav() {
  const [showSections, setShowSections] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const menuRef = useRef<HTMLDivElement>(null);

  const open = () => {
    clearTimeout(timeoutRef.current);
    setShowSections(true);
  };

  const close = () => {
    timeoutRef.current = setTimeout(() => setShowSections(false), 150);
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <nav className="hidden md:flex items-center gap-1">
      <div
        ref={menuRef}
        className="relative"
        onMouseEnter={open}
        onMouseLeave={close}
      >
        <a href="/" className={linkClass}>
          Home
        </a>
        {showSections && (
          <div className="absolute top-full left-0 pt-1">
            <div className="w-48 bg-card border border-border/50 rounded-xl shadow-lg p-3 space-y-1">
              {sections.map((section) => (
                <a
                  key={section.href}
                  href={section.href}
                  onClick={() => setShowSections(false)}
                  className={`block ${linkClass}`}
                >
                  {section.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      <a href="/howto" className={linkClass}>
        How To
      </a>
      <a href="/articles" className={linkClass}>
        Articles
      </a>
    </nav>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </Button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-card border border-border/50 rounded-xl shadow-lg p-4 space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Pages
            </p>
            <div className="space-y-1">
              {pages.map((page) => (
                <a
                  key={page.href}
                  href={page.href}
                  onClick={() => setOpen(false)}
                  className={`block ${linkClass}`}
                >
                  {page.label}
                </a>
              ))}
            </div>
          </div>

          <div className="border-t border-border/50" />

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Sections
            </p>
            <div className="space-y-1">
              {sections.map((section) => (
                <a
                  key={section.href}
                  href={section.href}
                  onClick={() => setOpen(false)}
                  className={`block ${linkClass}`}
                >
                  {section.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function NavMenu() {
  return (
    <>
      <DesktopNav />
      <MobileNav />
    </>
  );
}
