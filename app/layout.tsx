import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { DevModeProvider } from "./components/DevModeProvider";
import { AudioPlayerProvider } from "./components/AudioPlayer/AudioPlayerProvider";
import { MobileMenuProvider } from "./components/MobileMenuProvider";

export const metadata: Metadata = {
  title: "DPR",
  description: "Desire Path Radio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <DevModeProvider>
          <ThemeProvider>
            <MobileMenuProvider>
              <AudioPlayerProvider>
                {children}
              </AudioPlayerProvider>
            </MobileMenuProvider>
          </ThemeProvider>
        </DevModeProvider>
      </body>
    </html>
  );
}