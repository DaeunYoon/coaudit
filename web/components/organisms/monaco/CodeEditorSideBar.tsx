import _throttle from "lodash/throttle";
import type * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import React from "react";

import type { File, Monaco } from "./types";

import CodeEditorFileExplorer from "./CodeEditorFileExplorer";

interface Props {
  monaco: Monaco | undefined;
  editor: monaco.editor.IStandaloneCodeEditor | undefined;
  data: Array<File>;
  onFileSelect: (index: number, lineNumber?: number) => void;
  selectedFile: string;
  mainFile?: string;
}

export const CONTAINER_WIDTH = 250;

const CodeEditorSideBar = ({
  onFileSelect,
  data,
  monaco,
  editor,
  selectedFile,
  mainFile,
}: Props) => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [tabIndex, setTabIndex] = React.useState(0);
  const [actionBarRenderer, setActionBarRenderer] =
    React.useState<() => React.JSX.Element>();

  const handleFileSelect = React.useCallback(
    (index: number, lineNumber?: number) => {
      isDrawerOpen && setIsDrawerOpen(false);
      onFileSelect(index, lineNumber);
    },
    [isDrawerOpen, onFileSelect, setIsDrawerOpen]
  );

  return (
    <>
      <div
        className={`w-[250px] right-[0] pb-6 top-0 h-full flex-shrink-0 bg-sidebar-background text-sm overflow-y-scroll absolute z-[2] shadow-md rounded-tr-md rounded-br-md ${
          isDrawerOpen ? "md" : "none"
        }`}
      >
        <div>
          <p className="text-text-on-dark py-2 px-2">Explorer</p>
          <CodeEditorFileExplorer
            data={data}
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            mainFile={mainFile}
            isActive={tabIndex === 0}
            setActionBarRenderer={setActionBarRenderer}
          />
        </div>
      </div>
    </>
  );
};

export default React.memo(CodeEditorSideBar);
