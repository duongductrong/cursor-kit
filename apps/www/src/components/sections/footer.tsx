import Link from "next/link";

const footerLinks = [
  {
    href: "https://github.com/duongductrong/cursor-kit",
    label: "GitHub",
    target: "_blank",
  },
  {
    href: "https://www.npmjs.com/package/cursor-kit-cli",
    label: "npm",
    target: "_blank",
  },
  { href: "/changelogs", label: "Changelog", target: "_self" },
];

export function Footer() {
  return (
    <footer className="py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-foreground">
              Cursor Kit
            </span>
          </div>

          <nav className="flex items-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target={link.target}
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Cursor Kit. MIT License.
          </p>
        </div>
      </div>
    </footer>
  );
}
