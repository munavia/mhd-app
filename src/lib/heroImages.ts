/**
 * Local assets copied from `Website Content/Web-Images` → `public/images/web`.
 * Used as full-width hero backgrounds (CSS `background-image`, no optimizer).
 */
const base = "/images/web";

export const heroImages = {
  home: `${base}/hero-image-33.jpg`,
  about: `${base}/hero-image-15.jpg`,
  blog: `${base}/hero-image-3.jpg`,
  blogPostFallback: `${base}/hero-image-20.jpg`,
  contact: `${base}/hero-image-35.jpg`,
  events: `${base}/hero-image-13.jpg`,
  give: `${base}/hero-image-34.jpg`,
  prayer: `${base}/hero-image-14.jpg`,
} as const;
