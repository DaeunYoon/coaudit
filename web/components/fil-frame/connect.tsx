"use client";

import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";

export default function Connect() {
  // Dynamic hooks
  const { sdkHasLoaded, setShowAuthFlow } = useDynamicContext();

  const isLoggedIn = useIsLoggedIn();

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
          className="text-white items-center inline-flex bg-primary-accent border-2 border-black duration-200 ease-in-out focus:outline-none hover:bg-primary-accent-hover hover:text-white justify-center rounded-md text-center w-full lg:px-8 lg:py-2 text-xl px-8 py-2"
          onClick={() => setShowAuthFlow(true)}
        >
          {isLoggedIn ? "View dashboard" : "Launch dApp"}
        </button>
      </a>
    </div>
  );
}
