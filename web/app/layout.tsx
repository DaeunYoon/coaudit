import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@styles/globals.css";
import { ContextProvider } from ".";
import ReactQueryProvider from "./ReactQueryProvider";
import Header from "@/components/header";
import Footer from "@/components/footer";
const inter = Inter({ subsets: ["latin"] });

// Websit Config
export const metadata: Metadata = {
  title: "Coaudit - audit code, better",
  description: "A tool to make auditing easier.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryProvider>
          <ContextProvider>
            <Header />
            <div className="w-full min-h-screen bg-background-primary flex justify-center items-center p-2">
              <div className="flex flex-col gap-8 items-center">{children}</div>
            </div>
            <Footer />
          </ContextProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
