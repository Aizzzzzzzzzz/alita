import "./globals.css";

export const metadata = {
  title: "ALITA",
  description: "A Web-Based Voice-Enabled Learning System",
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