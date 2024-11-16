"use client";

import SearchContract from "@/components/molecules/searchContract";

export default function Explore() {
  return (
    <>
      <div className="text-4xl text-white text-center">Contract lookup</div>
      <div className="flex gap-2">
        <SearchContract />
      </div>
    </>
  );
}
