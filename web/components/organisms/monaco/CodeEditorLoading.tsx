import React from "react";

import classNames from "classnames";

interface Props {
  className?: string;
}

const CodeEditorLoading = ({ className }: Props) => {
  return (
    <div
      className={classNames(
        "editor-background w-full h-full overflow-hidden",
        className
      )}
    >
      Loading...
    </div>
  );
};

export default CodeEditorLoading;
