/** Public ministry contact details (site-wide). */
export const MINISTRY_CONTACT = {
  addressLines: [
    "Walworth Picket Piece, Picket Piece",
    "Andover, United Kingdom, SP11 6LY",
  ] as const,
  phoneDisplay: "+44 7597 355934",
  phoneHref: "tel:+447597355934",
  email: "mhealingdeliverance@gmail.com",
} as const;

export const MINISTRY_SOCIAL = [
  {
    id: "youtube",
    label: "YouTube",
    href: "https://youtube.com/@ministryofhealingdeliverance",
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/ministryhd",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/ministryhealingdeliverance/",
  },
  {
    id: "twitter",
    label: "X (Twitter)",
    href: "https://twitter.com/mhealing77",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/ministry-of-healing-and-deliverance/",
  },
] as const;

export type MinistrySocialId = (typeof MINISTRY_SOCIAL)[number]["id"];
