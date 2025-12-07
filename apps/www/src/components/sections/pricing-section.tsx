import { Check, Sparkles } from "lucide-react";

const pricingPlans = [
  {
    name: "Open Source",
    price: "Free",
    priceNote: "forever",
    description: "Everything you need to supercharge your AI coding workflow.",
    features: [
      "All CLI commands included",
      "Community templates & rules",
      "Multi-target support (Cursor, Copilot)",
      "Sync updates from repository",
      "Multi-instance support (macOS)",
      "Community support via GitHub",
    ],
    cta: "Get Started",
    ctaHref: "#install",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "Coming Soon",
    priceNote: "",
    description: "Enhanced features for teams and power users.",
    features: [
      "Everything in Open Source",
      "Premium template library",
      "Priority support",
      "Team collaboration tools",
      "Custom rule sharing",
      "Early access to new features",
    ],
    cta: "Join Waitlist",
    ctaHref: "https://github.com/duongductrong/cursor-kit",
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center gap-4 text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="max-w-xl text-lg text-muted-foreground">
            Start free, upgrade when you need more.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`group relative flex flex-col rounded-xl p-8 overflow-hidden ${
                plan.highlighted
                  ? "border border-[var(--gradient-mid)]/50 bg-card ring-1 ring-[var(--gradient-mid)]/20"
                  : "border border-border bg-card"
              }`}
            >
              {plan.highlighted && (
                <>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-[var(--gradient-mid)]/10 to-transparent" />

                  <div className="absolute -right-12 top-6 rotate-45 gradient-bg px-12 py-1.5 shadow-lg">
                    <span className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-background">
                      Free Forever
                    </span>
                  </div>
                </>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  {plan.priceNote && (
                    <span className="text-muted-foreground">
                      {plan.priceNote}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="size-4 mt-0.5 text-[var(--gradient-mid)] shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.ctaHref}
                className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  plan.highlighted
                    ? "gradient-bg text-background hover:opacity-90"
                    : "border border-border bg-secondary/50 text-foreground hover:bg-secondary"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
