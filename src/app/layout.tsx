import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ministry of Healing and Deliverance",
    template: "%s | Ministry of Healing and Deliverance",
  },
  description:
    "A sacred online space dedicated to fostering spiritual growth, healing, and deliverance. Experience divine healing and transformation through faith, love, and community.",
  keywords: [
    "healing",
    "deliverance",
    "ministry",
    "church",
    "spiritual growth",
    "faith",
    "prayer",
  ],
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Ministry of Healing and Deliverance",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans min-h-screen flex flex-col antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
