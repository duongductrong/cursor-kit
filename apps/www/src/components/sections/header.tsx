import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/showcases", label: "Show cases" },
  { href: "/changelogs", label: "Changelogs" },
];

export function Header() {
  return (
    <header className="z-50 w-full">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={28} />
          <span className="text-xl font-semibold tracking-tight text-foreground">
            Cursor Kit
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" asChild>
            <Link
              href="https://github.com/duongductrong/cursor-kit"
              target="_blank"
              rel="noopener noreferrer"
              className=""
              aria-label="GitHub"
            >
              <Github className="size-4" />
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link
              href="https://www.npmjs.com/package/cursor-kit-cli"
              target="_blank"
            >
              Get Started
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
