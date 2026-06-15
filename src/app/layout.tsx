import type { Metadata } from "next";
import "./globals.scss";

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
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
