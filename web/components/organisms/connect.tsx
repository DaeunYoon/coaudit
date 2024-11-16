"use client";

import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useRouter } from "next/dist/client/components/navigation";
import Link from "next/link";
import Button from "../atoms/button";

export default function Connect() {
  const router = useRouter();
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
      {isLoggedIn ? (
        <Link href="/explore">
          <Button
            onClick={() => null}
            className="lg:px-8 lg:py-2 text-xl px-8 py-2"
          >
            View dashboard
          </Button>
        </Link>
      ) : (
        <a>
          <Button
            onClick={() => setShowAuthFlow(true)}
            className="lg:px-8 lg:py-2 text-xl px-8 py-2"
          >
            Launch dApp
          </Button>
        </a>
      )}
    </div>
  );
}
