"use client";

import classNames from "classnames";

export default function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={classNames("w-full p-4 rounded-md", className)}>
      {children}
    </div>
  );
}
