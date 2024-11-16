"use client";

import classNames from "classnames";

export default function Button({
  onClick,
  children,
  style = "default",
  className,
  loading,
}: {
  onClick: () => any;
  style?: "default" | "danger";
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
}) {
  const buttonStyle = types[style];
  return (
    <button
      disabled={loading}
      className={classNames("btn btn-primary w-fit", buttonStyle, className)}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

const types = {
  default:
    "text-white items-center inline-flex bg-primary-accent focus:outline-none hover:bg-primary-accent-hover hover:text-white justify-center rounded-md text-center w-full px-3 py-1",
  danger:
    "text-black items-center inline-flex bg-white focus:outline-none hover:bg-red-400 hover:text-white justify-center rounded-md text-center w-full text-md px-3 py-1",
};
