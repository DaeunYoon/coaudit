import React from "react";
import CodeEditorFileIcon from "./CodeEditorFileIcon";
import CodeEditorMainFileIndicator from "./CodeEditorMainFileIndicator";
import getFilePathParts from "./utils/getFilePathParts";
import { alt } from "@/utils/html-entities";

interface Props {
  isActive?: boolean;
  isMainFile?: boolean;
  path: string;
  onClick: (path: string) => void;
  onClose: (path: string) => void;
  isCloseDisabled: boolean;
  tabsPathChunks: Array<Array<string>>;
}

const CodeEditorTab = ({
  isActive,
  isMainFile,
  path,
  onClick,
  onClose,
  isCloseDisabled,
  tabsPathChunks,
}: Props) => {
  const [fileName, folderName] = getFilePathParts(path, tabsPathChunks);

  const handleClick = React.useCallback(() => {
    onClick(path);
  }, [onClick, path]);

  const handleClose = React.useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      !isCloseDisabled && onClose(path);
    },
    [isCloseDisabled, onClose, path]
  );

  const isDisabled = isMainFile || isCloseDisabled;

  return (
    <div
      className={`flex pl-2.5 pr-1 font-medium text-sm leading-[34px] ${
        isActive ? "bg-active-tab" : "bg-inactive-tab"
      } border-r border-[#252526] border-b ${
        isActive ? "border-b-transparent" : "border-b-[#252526]"
      } ${
        isActive ? "text-white" : "text-text-on-dark"
      } items-center cursor-pointer user-select-none`}
      onClick={handleClick}
    >
      <CodeEditorFileIcon className="mr-2" fileName={fileName} />

      <span>{fileName}</span>
      {folderName && (
        <span className="text-xs opacity-80 ml-1">
          {folderName[0] === "." ? "" : "..."}
          {folderName}
        </span>
      )}

      {isMainFile && <CodeEditorMainFileIndicator className="ml-2" />}

      <button
        disabled={isDisabled}
        className={`ml-4 rounded-sm text-white ${
          isCloseDisabled ? "opacity-30" : ""
        } ${!isDisabled ? "hover:bg-gray-300" : ""}`}
        title={`Close ${isActive ? `(${alt}W)` : ""}`}
        aria-label="Close"
        onClick={handleClose}
        style={{
          visibility: isActive ? "visible" : "hidden",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

export default React.memo(CodeEditorTab);
