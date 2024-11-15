"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

export default function Connect() {
  // Dynamic hooks
  const { sdkHasLoaded, setShowAuthFlow } = useDynamicContext();

  if (!sdkHasLoaded) {
    return null;
  }

  return (
    <div
      className="relative w-full m-auto flex justify-center text-center flex-col items-center z-1 text-white"
      style={{ maxWidth: "1200px" }}
    >
      <p className="text-xl mb-5">Need to view an on-chain contract?</p>
      <h1 className="inline-block max-w-2xl lg:max-w-4xl  w-auto relative text-5xl md:text-6xl lg:text-7xl tracking-tighter mb-10 font-bold">
        We save you <span className="">time</span> with our all-in-one explorer.
      </h1>
      <a>
        <button
          type="button"
          className="text-black items-center inline-flex bg-white border-2 border-black duration-200 ease-in-out focus:outline-none hover:bg-black hover:shadow-none hover:text-white justify-center rounded-[20px] shadow-[5px_5px_black] text-center transform transition w-full lg:px-8 lg:py-2 lg:text-xl px-8 py-2"
          onClick={() => setShowAuthFlow(true)}
        >
          Launch dApp
        </button>
      </a>
    </div>
  );
}
