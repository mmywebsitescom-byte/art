import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "ASCII Architect | Terminal Era Design",
  description: "Transform complex visuals into high-fidelity character matrices.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
