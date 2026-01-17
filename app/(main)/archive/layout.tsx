import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archive",
  description:
    "Browse the complete archive of Desire Path Radio episodes. Listen to past shows featuring underground music, DJ sets, live performances, and talks from our New York-based community radio station.",
  openGraph: {
    title: "Archive | Desire Path Radio",
    description:
      "Browse the complete archive of Desire Path Radio episodes. Listen to past shows featuring underground music, DJ sets, and live performances.",
  },
};

export default function ArchiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
