import { Inter, Playfair_Display } from "next/font/google";
import Providers from "@/components/shared/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-playfair",
});

export const metadata = {
  title: "AutoTennant",
  description: "AI-powered property management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
