import React from "react";

import classNames from "classnames";

interface Props {
  onClick: () => void;
  label: string;
  isDisabled?: boolean;
  isCollapsed?: boolean;
}

const CoderEditorCollapseButton = ({
  onClick,
  label,
  isDisabled,
  isCollapsed,
}: Props) => {
  return (
    <div
      className={classNames(`rounded-sm p-[2px] flex ml-auto self-center hover:bg-sidebar-hover pointer ${
        isDisabled ? "opacity-5" : "opacity-100"
      }
        ${
          isCollapsed
            ? "codicon codicon-search-expand-results"
            : "codicon codicon-collapse-all"
        }`)}
      // _before={{
      //   content: isCollapsed ? '"\\eb95"' : '"\\eac5"',
      // }}
      onClick={onClick}
      title={label}
      aria-label={label}
    />
  );
};

export default React.memo(CoderEditorCollapseButton);
