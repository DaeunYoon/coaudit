"use client";

import Link from "next/link";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";

const Header = () => {
  const { sdkHasLoaded, handleLogOut } = useDynamicContext();

  const isLoggedIn = useIsLoggedIn();

  return (
    <div className="fixed top-0 w-full bg-background-tertiary h-20 flex items-center z-10 border-b border-[#282828]">
      <div className="relative left-4">
        <Link href={isLoggedIn ? "/explore" : "/"}>
          <div className="text-white text-3xl font-bold items-center inline-flex justify-center w-full px-2">
            Coaudit
          </div>
        </Link>
      </div>
      {sdkHasLoaded && isLoggedIn && (
        <div className="fixed right-6">
          <div className="flex flex-row gap-8 items-center">
            <Link href="/explore">
              <div className="text-white font-bold">Explore</div>
            </Link>
            <Link href="/defi">
              <div className="text-white font-bold">DeFi</div>
            </Link>
            <Link href="/sign">
              <div className="text-white font-bold">Sign</div>
            </Link>
            <button
              className="text-black items-center inline-flex bg-white focus:outline-none hover:bg-red-400 hover:text-white justify-center rounded-md text-center w-full text-md px-3 py-1"
              type="button"
              onClick={handleLogOut}
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
