import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }) => {
    return (
      <label className="flex items-center gap-2 text-white">
        <input
          {...props}
          type="text"
          className="input input-bordered w-full text-white"
          placeholder="Search"
        />
      </label>
    );
  }
);
Input.displayName = "Input";

export { Input };
