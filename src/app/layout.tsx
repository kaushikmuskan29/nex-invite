import type { Metadata, Viewport } from "next";
import { Cinzel, Cinzel_Decorative, Inter, Spectral } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

const cinzelDecorative = Cinzel_Decorative({
  variable: "--font-cinzel-decorative",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NEXHACK 2.0 | Imperial Digital Invitation — Geeta University",
  description:
    "An exclusive, cinematic digital invitation to NEXHACK 2.0: Hack the Next Dimension. Hosted by Geeta University, Panipat on 24–25 November 2026.",
  openGraph: {
    title: "NEXHACK 2.0 | Digital Invitation",
    description: "You have received an imperial summons to NEXHACK 2.0 at Geeta University.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#03040a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${cinzelDecorative.variable} ${inter.variable} ${spectral.variable} dark`}
    >
      <body className="min-h-screen bg-[#03040a] text-[#f5ebd3] font-sans antialiased overflow-x-hidden selection:bg-[#c9a45c]/30 selection:text-[#f0c030]">
        {children}
      </body>
    </html>
  );
}
