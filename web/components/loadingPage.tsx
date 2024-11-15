"use client";

import Header from "@components/header";
import Footer from "@components/footer";

export default function LoadingPage() {
  return (
    <div className="w-full min-h-screen bg-blue-600">
      <Header />
      <div className="flex flex-col justify-center items-center relative lg:flex-row gap-8 pt-20 lg:pt-40 pb-10 lg:pb-40">
        Loading...
      </div>

      <Footer />
    </div>
  );
}
