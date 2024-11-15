"use client";

import Image from "next/image";

export default function Dummy() {
  return (
    <>
      <Image
        className="cursor-pointer"
        src="/assets/logos/fil-b-mini-logo.png"
        width={200}
        height={200}
        alt="FIL-B Logo"
      />
      <div className="text-2xl text-white p-8 text-center">Explore page</div>
    </>
  );
}
