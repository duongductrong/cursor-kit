"use client";

import { motion } from "motion/react";
import { Sparkles, Zap } from "lucide-react";

export function ShowcaseHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="gradient-blob absolute -left-1/4 top-0 size-[800px] opacity-15" />
        <div className="gradient-blob absolute -right-1/4 bottom-0 size-[600px] opacity-10" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-32">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Animated Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full bg-muted/50 px-4 py-2 text-sm backdrop-blur-sm"
          >
            <Sparkles className="size-4 text-chart-2" />
            <span className="font-medium text-foreground">
              Built with AI in seconds
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          >
            One prompt. Infinite possibilities.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            Explore real interfaces built with single prompts. Each showcase
            demonstrates the power of AI-assisted development with Cursor Kit.
          </motion.p>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 flex items-center gap-8 text-sm"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="size-4 text-chart-4" />
              <span>
                <strong className="text-foreground">100%</strong> AI Generated
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="size-1.5 rounded-full gradient-bg" />
              <span>
                <strong className="text-foreground">Single</strong> prompt each
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
