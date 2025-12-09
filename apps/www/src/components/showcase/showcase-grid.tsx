"use client";

import { showcases } from "@/lib/showcases";
import { ShowcaseCard } from "./showcase-card";

export function ShowcaseGrid() {
  return (
    <section className="relative pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="gradient-blob absolute left-1/4 top-1/4 size-[600px] opacity-20" />
        <div className="gradient-blob absolute right-1/4 bottom-1/4 size-[400px] opacity-15" />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Recent Showcases
            </h2>
            <p className="mt-2 text-muted-foreground">
              Each interface was generated with a single prompt
            </p>
          </div>
          <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
            <span className="size-1.5 rounded-full gradient-bg" />
            <span>{showcases.length} projects</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-10">
          {showcases.map((showcase, index) => (
            <ShowcaseCard
              key={showcase.id}
              showcase={showcase}
              index={index}
              size="large"
            />
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-full bg-muted/50 px-6 py-3 text-sm text-muted-foreground">
            <span className="size-1.5 animate-pulse rounded-full gradient-bg" />
            More showcases coming soon
          </div>
        </div>
      </div>
    </section>
  );
}
