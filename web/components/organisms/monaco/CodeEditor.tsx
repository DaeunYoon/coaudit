import type { EditorProps } from "@monaco-editor/react";
import MonacoEditor from "@monaco-editor/react";
import type * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import React, { useEffect, useMemo, useRef } from "react";

import type { File, Monaco } from "./types";

import CodeEditorLoading from "./CodeEditorLoading";
import addExternalLibraryWarningDecoration from "./utils/addExternalLibraryWarningDecoration";
import addFileImportDecorations from "./utils/addFileImportDecorations";
import addMainContractCodeDecoration from "./utils/addMainContractCodeDecoration";
import * as themes from "./utils/themes";
import CodeEditorTabs from "./CodeEditorTabs";
import CodeEditorBreadcrumbs from "./CodeEditorBreadcrumbs";
import CodeEditorSideBar from "./CodeEditorSideBar";
import { ParsedInformation } from "@/types";

export interface SmartContractExternalLibrary {
  address_hash: string;
  name: string;
}

const EDITOR_OPTIONS: EditorProps["options"] = {
  readOnly: true,
  minimap: { enabled: true },
  scrollbar: {
    alwaysConsumeMouseWheel: true,
  },
  dragAndDrop: false,
};

const EDITOR_HEIGHT = 500;

interface Props {
  data: Array<File>;
  libraries?: Array<SmartContractExternalLibrary>;
  language: string;
  mainFile?: string;
  contractName?: string;
  parsedData?: ParsedInformation[];
}

const CodeEditor = ({
  data,
  libraries,
  language,
  mainFile,
  contractName,
  parsedData,
}: Props) => {
  const monacoRef = useRef<{
    editor: monaco.editor.IStandaloneCodeEditor;
    monaco: Monaco;
  } | null>(null);

  const [instance, setInstance] = React.useState<Monaco | undefined>();
  const [editor, setEditor] = React.useState<
    monaco.editor.IStandaloneCodeEditor | undefined
  >();
  const [index, setIndex] = React.useState(0);
  const [tabs, setTabs] = React.useState([data[index].file_path]);

  useEffect(() => {
    if (!parsedData || !monacoRef.current) return;

    const { monaco, editor } = monacoRef.current;

    //Get all function definitions
    // const regularImportMatches = model.findMatches(
    //   "^import ('|\")(.+)('|\")",
    //   false,
    //   true,
    //   false,
    //   null,
    //   true
    // );

    // const regularImportDecorations: Array<monaco.editor.IModelDeltaDecoration> =
    // regularImportMatches.map(({ range }) => ({
    //   range: {
    //     ...range,
    //     startColumn: range.startColumn + 8,
    //     endColumn: range.endColumn - 1,
    //   },
    //   options,
    // }));

    // For each function call, find the corresponding definition
  }, [parsedData]);

  React.useEffect(() => {
    instance?.editor.setTheme("blockscout-dark");
  }, [instance?.editor]);

  const handleEditorDidMount = React.useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
      monacoRef.current = { editor, monaco };

      setInstance(monaco);
      setEditor(editor);

      monaco.languages.register({ id: language });
      monaco.editor.defineTheme("blockscout-light", themes.light);
      monaco.editor.defineTheme("blockscout-dark", themes.dark);
      monaco.editor.setTheme("blockscout-dark");

      const loadedModels = monaco.editor.getModels();
      const loadedModelsPaths = loadedModels.map((model) => model.uri.path);
      const newModels = data
        .slice(1)
        .filter((file) => !loadedModelsPaths.includes(file.file_path))
        .map((file) =>
          monaco.editor.createModel(
            file.source_code,
            "sol",
            monaco.Uri.parse(file.file_path)
          )
        );

      if (language) {
        loadedModels.concat(newModels).forEach((model) => {
          contractName &&
            mainFile === model.uri.path &&
            addMainContractCodeDecoration(model, contractName, editor);
          addFileImportDecorations(model);
          libraries?.length &&
            addExternalLibraryWarningDecoration(model, libraries);
        });
      }
      console.log("before registerLinkProvider");
      monaco.languages.registerLinkProvider(language, {
        provideLinks: (model: monaco.editor.ITextModel) => {
          console.log("search for pragma");
          const searchQuery = "pragma"; // Regex to find function definitions
          const matches = model.findMatches(
            searchQuery,
            false,
            false,
            false,
            null,
            false
          );

          const links = matches.map((match) => {
            console.log(match);
            const startPosition = model.getPositionAt(
              match.range.getStartPosition().lineNumber
            );
            const endPosition = model.getPositionAt(
              match.range.getEndPosition().lineNumber
            );

            return {
              range: new monaco.Range(
                startPosition.lineNumber,
                startPosition.column,
                endPosition.lineNumber,
                endPosition.column
              ),
              url: `http://localhost:3000/explore/1/0x1F98431c8aD98523631AE4a59f267346ea31F984`, // Custom URL format for navigation
            };
          });

          return { links }; // Return an object with links property
        },
        resolveLink: (link: any) => {
          console.log("resolveLink", link);

          return null;
        },
      });

      editor.addAction({
        id: "close-tab",
        label: "Close current tab",
        keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyW],
        contextMenuGroupId: "navigation",
        contextMenuOrder: 1.7,
        run: function (editor) {
          const model = editor.getModel();
          const path = model?.uri.path;
          if (path) {
            handleTabClose(path, true);
          }
        },
      });
      // componentDidMount
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    []
  );

  const handleSelectFile = React.useCallback(
    (index: number, lineNumber?: number) => {
      setIndex(index);
      setTabs((prev) =>
        prev.some((item) => item === data[index].file_path)
          ? prev
          : [...prev, data[index].file_path]
      );
      if (lineNumber !== undefined && !Object.is(lineNumber, NaN)) {
        window.setTimeout(() => {
          editor?.revealLineInCenter(lineNumber);
        }, 0);
      }
      editor?.focus();
    },
    [data, editor]
  );

  const handleTabSelect = React.useCallback(
    (path: string) => {
      const index = data.findIndex((item) => item.file_path === path);
      if (index > -1) {
        setIndex(index);
      }
    },
    [data]
  );

  const handleTabClose = React.useCallback(
    (path: string, _isActive?: boolean) => {
      setTabs((prev) => {
        if (prev.length > 1) {
          const tabIndex = prev.findIndex((item) => item === path);
          const isActive =
            _isActive !== undefined
              ? _isActive
              : data[index].file_path === path;

          if (isActive) {
            const nextActiveIndex = data.findIndex(
              (item) =>
                item.file_path === prev[tabIndex === 0 ? 1 : tabIndex - 1]
            );
            setIndex(nextActiveIndex);
          }

          return prev.filter((item) => item !== path);
        }

        return prev;
      });
    },
    [data, index]
  );

  if (data.length === 1) {
    return (
      <div className="h-[600px] w-full">
        <MonacoEditor
          className="editor-container"
          language={"sol"}
          path={data[index].file_path}
          defaultValue={data[index].source_code}
          options={EDITOR_OPTIONS}
          onMount={handleEditorDidMount}
          loading={<CodeEditorLoading />}
        />
      </div>
    );
  }

  return (
    <div className="relative pr-[250px]">
      <div className="flex flex-col">
        <CodeEditorTabs
          tabs={tabs}
          activeTab={data[index].file_path}
          mainFile={mainFile}
          onTabSelect={handleTabSelect}
          onTabClose={handleTabClose}
        />
        <CodeEditorBreadcrumbs path={data[index].file_path} />
        <MonacoEditor
          className="editor-container"
          height={`${EDITOR_HEIGHT}px`}
          language={"sol"}
          path={data[index].file_path}
          defaultValue={data[index].source_code}
          options={EDITOR_OPTIONS}
          onMount={handleEditorDidMount}
          loading={<CodeEditorLoading />}
        />
      </div>
      <CodeEditorSideBar
        data={data}
        onFileSelect={handleSelectFile}
        monaco={instance}
        editor={editor}
        selectedFile={data[index].file_path}
        mainFile={mainFile}
      />
    </div>
  );
};

export default CodeEditor;
