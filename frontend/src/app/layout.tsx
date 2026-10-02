import type { Metadata } from "next";

import { Header } from "@/components/layout/Header";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/constants/site";

import "./globals.css";

// Defaults; each page overrides title/description via buildMetadata(Pages.X)
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
