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
  title: "DPR",
  description: "Desire Path Radio",
  openGraph: {
    title: "DPR",
    description: "Desire Path Radio",
    siteName: "DPR",
    images: [
      {
        url: "/DPR_Opengraph.jpg",
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
    title: "DPR",
    description: "Desire Path Radio",
    images: ["/DPR_Opengraph.jpg"],
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