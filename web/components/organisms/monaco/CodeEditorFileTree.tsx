import React from "react";

import type { FileTree } from "./types";

// import CodeEditorFileIcon from "./CodeEditorFileIcon";
import CodeEditorMainFileIndicator from "./CodeEditorMainFileIndicator";
import CodeEditorFileIcon from "./CodeEditorFileIcon";
import Image from "next/image";

interface Props {
  tree: FileTree;
  level?: number;
  isCollapsed?: boolean;
  onItemClick: (event: React.MouseEvent) => void;
  selectedFile: string;
  mainFile?: string;
}

const CodeEditorFileTree = ({
  tree,
  level = 0,
  onItemClick,
  isCollapsed,
  selectedFile,
  mainFile,
}: Props) => {
  // const itemProps: any = {
  //   borderWidth: "0px",
  //   cursor: "pointer",
  //   lineHeight: "22px",
  //   _last: {
  //     borderBottomWidth: "0px",
  //   },
  // };

  return (
    <div>
      {tree.map((leaf, index) => {
        const leafName = (
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            {leaf.name}
          </span>
        );

        if ("children" in leaf) {
          return (
            <div key={index}>
              <>
                {/* <div
                  className={`pr-2 py-0 pl-[${
                    8 + 8 * level
                  }px] hover:bg-sidebar-hover pointer font-sm h-6`}
                >
                  <div className="codicon codicon-tree-item-expanded mr-[2px]" />

                  <Image
                    className="mr-[2px]"
                    src={"/icons/monaco/folder.svg"}
                    alt={"folder open"}
                    height={16}
                    width={16}
                  />

                  {leafName}
                </div> */}
                <div className="p-0">
                  <CodeEditorFileTree
                    tree={leaf.children}
                    level={level + 1}
                    onItemClick={onItemClick}
                    isCollapsed={isCollapsed}
                    selectedFile={selectedFile}
                    mainFile={mainFile}
                  />
                </div>
              </>
            </div>
          );
        }

        return (
          <div
            className={`pr-2 py-0 pl-[${
              26 + level * 8
            }px] hover:bg-sidebar-hover font-sm h-6 flex relative items-center overflow-hidden bg-transparent text-text-on-dark cursor-pointer`}
            key={index}
            onClick={onItemClick}
            data-file-path={leaf.file_path}
          >
            {mainFile === leaf.file_path && (
              <CodeEditorMainFileIndicator
                className={`absolute top-[${(22 - 12) / 2}px] left-[${
                  26 - 12 - 2 + level * 8
                }px]`}
              />
            )}
            <CodeEditorFileIcon fileName={leaf.name} className="mr-2" />
            {leafName}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(CodeEditorFileTree);
