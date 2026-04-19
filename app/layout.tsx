import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lead Generation CRM",
  description: "Professional leads for Upwork & Fiverr clients",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}
