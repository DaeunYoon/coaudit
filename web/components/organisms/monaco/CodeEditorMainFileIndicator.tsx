import classNames from "classnames";
import React from "react";

interface Props {
  className?: string;
}

const CodeEditorMainFileIndicator = ({ className }: Props) => {
  return <div className={classNames("text-green-700", className)}>M</div>;
};

export default CodeEditorMainFileIndicator;
