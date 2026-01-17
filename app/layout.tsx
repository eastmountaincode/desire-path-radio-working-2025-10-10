import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { DevModeProvider } from "./components/DevModeProvider";
import { AudioPlayerProvider } from "./components/AudioPlayer/AudioPlayerProvider";
import { MobileMenuProvider } from "./components/MobileMenuProvider";
import { LiveChannelToggleProvider } from "./components/LiveChannelToggleProvider";
import { ChatProvider } from "./components/Chat/ChatProvider";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: {
    default: "Desire Path Radio",
    template: "%s | Desire Path Radio",
  },
  description:
    "Desire Path Radio is a New York-based online radio station featuring music from the underground, education, documentary, experimental, archival from the field. Tune in for curated sounds and community-driven programming.",
  keywords: [
    "Desire Path Radio",
    "online radio",
    "underground music",
    "New York radio",
    "DJ sets",
    "live music",
    "internet radio",
  ],
  authors: [{ name: "Desire Path Radio" }],
  creator: "Desire Path Radio",
  metadataBase: new URL("https://desirepathradio.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Desire Path Radio",
    description:
      "New York-based online radio station featuring underground music, DJ sets, live performances, and talks.",
    siteName: "Desire Path Radio",
    url: "https://desirepathradio.com",
    images: [
      {
        url: "/DPR_Opengraph_orange_and_green.jpg",
        width: 1200,
        height: 630,
        alt: "Desire Path Radio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Desire Path Radio",
    description:
      "New York-based online radio station featuring underground music, DJ sets, live performances, and talks.",
    images: ["/DPR_Opengraph_orange_and_green.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/2.6.0/uicons-thin-rounded/css/uicons-thin-rounded.css" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RadioStation",
              name: "Desire Path Radio",
              url: "https://desirepathradio.com",
              logo: "https://desirepathradio.com/DPR_Opengraph_orange_and_green.jpg",
              description:
                "New York-based online radio station featuring underground music, DJ sets, live performances, and talks.",
              address: {
                "@type": "PostalAddress",
                addressLocality: "New York",
                addressCountry: "US",
              },
              sameAs: ["https://www.instagram.com/desirepathradio"],
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <DevModeProvider>
          <ThemeProvider>
            <MobileMenuProvider>
              <AudioPlayerProvider>
                <LiveChannelToggleProvider>
                  <ChatProvider>
                    {children}
                  </ChatProvider>
                </LiveChannelToggleProvider>
              </AudioPlayerProvider>
            </MobileMenuProvider>
          </ThemeProvider>
        </DevModeProvider>
        <Analytics />
      </body>
    </html>
  );
}