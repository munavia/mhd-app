export type MinistryEvent = {
  id: string;
  title: string;
  image: string;
  /** Short line for cards */
  scheduleShort: string;
  /** Full schedule line for the dialog */
  schedule: string;
  host: string;
  platforms: string[];
  contactPhone?: string;
  website?: string;
  description?: string;
};

/** Flyer-based programs; poster copy is English across locales for now. */
export const MINISTRY_EVENTS: MinistryEvent[] = [
  {
    id: "communion-with-divine",
    title: "Communion with Divine",
    image: "/events/communion-with-divine.png",
    scheduleShort: "Mon & Fri · 7:00 AM",
    schedule: "Every Monday and Friday at 7:00 AM",
    host: "Pastor Celeste Dias",
    platforms: ["YouTube", "Facebook Live"],
    contactPhone: "+44 759 735 5934",
    description:
      "Morning communion and teaching streamed live. For prayers and counseling, call the ministry line below.",
  },
  {
    id: "financial-breakthrough",
    title: "Financial Breakthrough",
    image: "/events/financial-breakthrough.png",
    scheduleShort: "Thursday · 12:00 AM",
    schedule: "Thursdays at 12:00 AM (midnight)",
    host: "Pastor Celeste Dias",
    platforms: ["YouTube", "Facebook Live"],
    contactPhone: "+44 759 735 5934",
    description:
      "A focused time of prayer and teaching for financial breakthrough, streamed live online.",
  },
  {
    id: "prayer-miracle-night",
    title: "Prayer & Miracle Night",
    image: "/events/prayer-miracle-night.png",
    scheduleShort: "Friday · 9:00 PM",
    schedule: "Fridays at 9:00 PM",
    host: "Pastor Celeste Dias",
    platforms: ["YouTube", "Facebook Live"],
    contactPhone: "+44 759 735 5934",
    description:
      "Join us for prayer and expectation for miracles, streaming on Facebook Live and YouTube.",
  },
  {
    id: "women-of-influence",
    title: "Women of Influence: Leaving Egypt in Glory",
    image: "/events/women-of-influence.png",
    scheduleShort: "Wednesday · 12:00 AM",
    schedule: "Wednesdays at 12:00 AM (midnight)",
    host: "Pastor Celeste Dias",
    platforms: ["YouTube", "Facebook Live"],
    contactPhone: "+44 759 735 5934",
    description:
      "A special program for women—biblical teaching and encouragement, streamed live.",
  },
  {
    id: "god-wants-you-well",
    title: "God Wants You Well",
    image: "/events/god-wants-you-well.png",
    scheduleShort: "Friday · 10:00 PM",
    schedule: "Fridays at 10:00 PM",
    host: "Pastor Celeste Dias",
    platforms: ["YouTube", "Facebook Live"],
    contactPhone: "+44 759 735 5934",
    description:
      "Prayer for special needs—believing God for healing and wholeness. Live on YouTube and Facebook.",
  },
  {
    id: "breaking-walls-leviathan",
    title: "Breaking the Walls of Leviathan",
    image: "/events/breaking-walls.png",
    scheduleShort: "Monday · 12:00 AM",
    schedule: "Mondays at 12:00 AM (midnight)",
    host: "Pastor Celeste Dias",
    platforms: ["YouTube", "Facebook Live"],
    contactPhone: "+44 759 735 5934",
    description:
      "Strategic prayer and teaching to break spiritual strongholds. Streamed live online.",
  },
  {
    id: "ministry-live",
    title: "Ministry of Healing & Deliverance — Live",
    image: "/events/ministry-live.png",
    scheduleShort: "Online · Facebook & YouTube",
    schedule: "Live on Facebook Live and YouTube (see ministry announcements for times)",
    host: "Pastor Celeste Dias",
    platforms: ["YouTube", "Facebook Live"],
    contactPhone: "+44 759 735 5934",
    description:
      "Stay connected with live worship, teaching, and ministry updates from MHD — Cristo Vive.",
  },
];
