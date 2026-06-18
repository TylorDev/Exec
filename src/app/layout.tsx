import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.scss";

const geist = Geist({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "Exec",
  description: "Mockup, cover, and banner generator.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.className} ${geist.variable}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
