import "./globals.css";

export const metadata = {
  icons: {
    icon: "https://mistreet.org/wp-content/uploads/2022/07/Favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
