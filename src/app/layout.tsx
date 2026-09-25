import type { Metadata, Viewport } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import WhatsAppButton from "@/components/WhatsAppButton";
import QuickAnswers from "@/components/QuickAnswers";

const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://suaritmarehberi.com.tr"),
  title: "Su Arıtma Firmaları, Fiyatları ve Gerçek Yorumlar — Su Arıtma Rehberi",
  description: "Türkiye genelinde onaylı su arıtma bayileri, şeffaf fiyat karşılaştırması ve müşteri yorumları tek adreste.",
  applicationName: "Su Arıtma Rehberi",
  authors: [{ name: "Su Arıtma Rehberi", url: "https://suaritmarehberi.com.tr" }],
  creator: "Su Arıtma Rehberi",
  publisher: "Su Arıtma Rehberi",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Su Arıtma Rehberi",
    url: "https://suaritmarehberi.com.tr",
    title: "Su Arıtma Firmaları, Fiyatları ve Gerçek Yorumlar — Su Arıtma Rehberi",
    description: "Türkiye genelinde onaylı su arıtma bayileri, şeffaf fiyat karşılaştırması ve müşteri yorumları tek adreste.",
  },
  twitter: {
    card: "summary",
    title: "Su Arıtma Firmaları, Fiyatları ve Gerçek Yorumlar — Su Arıtma Rehberi",
    description: "Türkiye genelinde onaylı su arıtma bayileri, şeffaf fiyat karşılaştırması ve müşteri yorumları tek adreste.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "directory",
  icons: {
    icon: [
      { url: "/icon0.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
  formatDetection: {
    telephone: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0EA5E9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${nunito.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#FFFFFF] text-[#0F172A] font-sans" suppressHydrationWarning>
        {children}
        <WhatsAppButton />
        <QuickAnswers />
      </body>
    </html>
  );
}

