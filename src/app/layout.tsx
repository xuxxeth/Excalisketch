import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@excalidraw/excalidraw/index.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Excalisketch — Excalidraw-style Whiteboard Recorder",
  description:
    "Record beautiful whiteboard videos with your webcam. Excalidraw-style drawing + screen recording, built for visual explanations.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "Excalisketch — Excalidraw-style Whiteboard Recorder",
    description:
      "Record beautiful whiteboard videos with your webcam. Excalidraw-style drawing + screen recording, built for visual explanations.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Excalisketch — Excalidraw-style Whiteboard Recorder",
    description:
      "Record beautiful whiteboard videos with your webcam. Excalidraw-style drawing + screen recording, built for visual explanations.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
