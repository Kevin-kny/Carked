import { Inter } from "next/font/google";
import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/header";
import { Toaster } from "sonner";


const inter = Inter({ subsets: ["latin"]});
export const metadata = {
  title: "Carked",
  description: "Find your dream car",
};

export default function RootLayout({ children }) {
  return (
     <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
    <html lang="en">
      <body
        className={`${inter.className}` } >
      <Header />
        <main className="min-h-screen pt-12">{children}</main>
          <Toaster richColors />
          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>CARKED LIMITED🚘</p>
            </div>
          </footer>
  
      </body>
    </html>
    </ClerkProvider>
  );
}
