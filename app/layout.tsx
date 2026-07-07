import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

const display = localFont({
  variable: "--font-display",
  display: "swap",
  src: [
    { path: "./fonts/fraunces/fraunces-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/fraunces/fraunces-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/fraunces/fraunces-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/fraunces/fraunces-900.woff2", weight: "900", style: "normal" },
    { path: "./fonts/fraunces/fraunces-600italic.woff2", weight: "600", style: "italic" },
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
    { path: "./fonts/jetbrains-mono/jbmono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/jetbrains-mono/jbmono-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/jetbrains-mono/jbmono-600.woff2", weight: "600", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "VeilDrop — Confidential Token Distribution",
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
