"use client";

import type { Showcase } from "@/lib/showcases";
import { cn } from "@/lib/utils";
import {
  AudioLines,
  ExternalLink,
  Play,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface ShowcaseCardProps {
  showcase: Showcase;
  index: number;
  size?: "default" | "large";
}

export function ShowcaseCard({
  showcase,
  index,
  size = "default",
}: ShowcaseCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasEnded, setHasEnded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    const video = videoRef.current;
    if (video) {
      if (hasEnded) {
        video.currentTime = 0;
        setHasEnded(false);
      }
      video.play();
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    const video = videoRef.current;
    if (video) {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleReplay = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play();
      setHasEnded(false);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || showcase.mediaType !== "video") return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleEnded = () => {
      setHasEnded(true);
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [showcase.mediaType]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative flex flex-col",
        size === "large" && "md:col-span-2"
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl bg-muted/30",
          size === "large" ? "aspect-[16/9]" : "aspect-[4/3]"
        )}
      >
        {showcase.mediaType === "image" ? (
          <Image
            src={showcase.mediaUrl}
            alt={showcase.title}
            fill
            className="object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.03]"
            sizes={
              size === "large"
                ? "(max-width: 768px) 100vw, 66vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
          />
        ) : (
          <video
            ref={videoRef}
            src={showcase.mediaUrl}
            className="size-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.03]"
            muted
            loop={false}
            playsInline
            poster={showcase.mediaUrl}
          />
        )}

        <div
          className={cn(
            "pointer-events-none absolute inset-0 transition-opacity duration-500",
            "bg-gradient-to-t from-background/90 via-background/20 to-transparent",
            isHovered ? "opacity-100" : "opacity-70"
          )}
        />

        <div
          className={cn(
            "absolute left-4 top-4 flex items-center gap-1.5",
            "rounded-full bg-background/80 px-3 py-1.5 backdrop-blur-md",
            "transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          )}
        >
          <Sparkles className="size-3.5 text-chart-2" />
          <span className="text-xs font-semibold tracking-wide text-foreground">
            ONE-SHOT
          </span>
        </div>

        {showcase.demoUrl && (
          <Link
            href={showcase.demoUrl}
            className={cn(
              "absolute right-4 top-4 flex items-center gap-1.5",
              "rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background",
              "transition-all duration-300 hover:scale-105",
              isHovered
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2"
            )}
          >
            View Demo
            <ExternalLink className="size-3" />
          </Link>
        )}

        {showcase.mediaType === "video" && (
          <div
            className={cn(
              "absolute bottom-4 right-4 size-8 transition-all duration-300",
              "flex items-center justify-center",
              isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
            )}
          >
            <svg
              className="size-full -rotate-90 transform"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-foreground/20"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke={`url(#progressGradient-${showcase.id})`}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
                className="transition-all duration-150 ease-linear"
                style={{
                  willChange: "stroke-dashoffset",
                }}
              />
              <defs>
                <linearGradient
                  id={`progressGradient-${showcase.id}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="var(--gradient-start)" />
                  <stop offset="50%" stopColor="var(--gradient-mid)" />
                  <stop offset="100%" stopColor="var(--gradient-end)" />
                </linearGradient>
              </defs>
            </svg>

            {isPlaying ? (
              <AudioLines className="size-3 absolute text-muted-foreground opacity-60" />
            ) : null}
          </div>
        )}

        {showcase.mediaType === "video" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {hasEnded ? (
              <button
                onClick={handleReplay}
                className={cn(
                  "flex size-16 items-center justify-center rounded-full",
                  "bg-background/90 backdrop-blur-md text-foreground",
                  "transition-all duration-300 hover:scale-110",
                  "shadow-lg pointer-events-auto",
                  isHovered ? "opacity-100 scale-100" : "opacity-100 scale-100"
                )}
                aria-label="Replay video"
              >
                <RotateCcw className="size-6" />
              </button>
            ) : (
              <div
                className={cn(
                  "flex size-16 items-center justify-center rounded-full",
                  "bg-background/90 backdrop-blur-md text-foreground",
                  "transition-all duration-500",
                  isHovered && isPlaying
                    ? "opacity-0 scale-95"
                    : "opacity-100 scale-100"
                )}
              >
                <Play className="size-8 ml-1" />
              </div>
            )}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
          <div
            className={cn(
              "mb-3 flex flex-wrap gap-2 transition-all duration-500",
              isHovered
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            )}
          >
            {showcase.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-foreground/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-foreground/90 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          <h3
            className={cn(
              "text-lg font-semibold leading-tight text-foreground md:text-xl",
              "transition-all duration-300",
              isHovered ? "translate-y-0" : "translate-y-2"
            )}
          >
            {showcase.title}
          </h3>
        </div>
      </div>

      <div className="mt-4 px-1">
        <div className="relative">
          <p
            className={cn(
              "line-clamp-2 text-sm leading-relaxed text-muted-foreground",
              "transition-colors duration-300 group-hover:text-foreground/70"
            )}
          >
            <span className="gradient-text font-semibold">&quot;</span>
            {showcase.prompt}
            <span className="gradient-text font-semibold">&quot;</span>
          </p>
        </div>
      </div>
    </motion.article>
  );
}
