import type { Metadata } from "next";
import "@repo/ui/globals.css";

export const metadata: Metadata = {
  title: "Filefly",
  description:
    "Filefly is a platform that connects your file-hosting providers (Google Drive, OneDrive, Dropbox) using AI and enables you to search all your files with simple prompts. Filefly buzzes through all files: text, images, videos, and more. Prompt it with images and text and get your files out in return.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
