import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

const display = localFont({
  variable: "--font-display",
  display: "swap",
  src: [
    { path: "./fonts/space-grotesk/sg-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/space-grotesk/sg-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/space-grotesk/sg-700.woff2", weight: "700", style: "normal" },
  ],
});
const body = localFont({
  variable: "--font-body",
  display: "swap",
  src: [
    { path: "./fonts/inter/inter-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/inter/inter-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/inter/inter-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/inter/inter-700.woff2", weight: "700", style: "normal" },
  ],
});
const mono = localFont({
  variable: "--font-mono",
  display: "swap",
  src: [
    { path: "./fonts/space-mono/sm-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/space-mono/sm-700.woff2", weight: "700", style: "normal" },
  ],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "VeilDrop - Confidential Token Distribution",
  description: "Distribute tokens with amounts encrypted on-chain, visible only to each recipient.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
