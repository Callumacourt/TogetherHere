import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Inter, PT_Serif_Caption } from "next/font/google";
import "./globals.css";
import Footer from "../components/Footer/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const ptSerifCaption = PT_Serif_Caption({
  weight: "400", 
  subsets: ["latin"],
  variable: "--font-pt-serif",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Together Here",
  description: "A digital archive of human presence",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${ptSerifCaption.variable} ${instrumentSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://api.mapbox.com" />
        <link rel="preconnect" href="https://events.mapbox.com" />
      </head>
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
