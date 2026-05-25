import React from "react";

export const metadata = {
  title: "Training Overview",
  description: "Runner training plan overview",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}