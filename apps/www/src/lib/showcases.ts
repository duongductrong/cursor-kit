export interface Showcase {
  id: string;
  title: string;
  prompt: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  demoUrl?: string;
  tags: string[];
  featured?: boolean;
}

export const showcases: Showcase[] = [
  {
    id: "1",
    title: "Gallery Creative",
    prompt: `
        /implement
 You are an expert Frontend Developer and UI/UX Designer specializing in award-winning web aesthetics. Your task is to generate a website structure and design system based on the following specifications.

### Project Goal
Create a high-fidelity, editorial-style web platform that serves as a showcase gallery for digital creative work. The design must be content-first, sophisticated, and highly interactive.

Let's create a /demo page in @/apps/www and all the UI logic stored in that page only. This page is independent UI and logic, please don't research on the others page.
      `,
    mediaUrl: "/showcases/one-shot-gallery.mp4",
    mediaType: "video",
    demoUrl: "#",
    tags: ["Google Antigravity"],
    featured: true,
  },
];
