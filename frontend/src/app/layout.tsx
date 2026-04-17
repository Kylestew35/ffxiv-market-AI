// frontend/src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
{/* force rebuild */}

export const metadata: Metadata = {
  title: "FFXIV Market AI",
  description: "Real-time market helper for FFXIV",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen text-slate-200 relative">
          {children}
        </div>
      </body>
    </html>
  );
}
