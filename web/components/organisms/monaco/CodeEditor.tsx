import type { EditorProps } from '@monaco-editor/react';
import MonacoEditor from '@monaco-editor/react';
import type * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import React, { useRef, useEffect } from 'react';

import type { File, Monaco } from './types';

import CodeEditorLoading from './CodeEditorLoading';
import addExternalLibraryWarningDecoration from './utils/addExternalLibraryWarningDecoration';
import addFileImportDecorations from './utils/addFileImportDecorations';
import addMainContractCodeDecoration from './utils/addMainContractCodeDecoration';
import * as themes from './utils/themes';
import CodeEditorTabs from './CodeEditorTabs';
import CodeEditorBreadcrumbs from './CodeEditorBreadcrumbs';
import CodeEditorSideBar from './CodeEditorSideBar';
import { ParsedInformation } from '@/types';
import { Chain } from '@/lib/chains';

export interface SmartContractExternalLibrary {
  address_hash: string;
  name: string;
}

const EDITOR_OPTIONS: EditorProps['options'] = {
  readOnly: true,
  minimap: { enabled: true },
  scrollbar: {
    alwaysConsumeMouseWheel: true,
  },
  dragAndDrop: false,
};

const EDITOR_HEIGHT = 500;

interface Props {
  chain: Chain;
  data: Array<File>;
  libraries?: Array<SmartContractExternalLibrary>;
  language: string;
  mainFile?: string;
  contractName?: string;
  parsedData?: Record<string, ParsedInformation>;
}

const CodeEditor = ({
  chain,
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
  const [tabs, setTabs] = React.useState([data[index]?.file_path]);

  React.useEffect(() => {
    instance?.editor.setTheme('blockscout-dark');
  }, [instance?.editor]);

  useEffect(() => {
    const currentContract = (
      data[index].file_path.split('/').pop() ?? data[index].file_path
    ).split('.')[0];

    const currentAddresses = parsedData?.[currentContract]?.addresses ?? [];

    if (instance) {
      instance.languages.registerLinkProvider(language, {
        provideLinks: () => {
          const links = currentAddresses.map(
            ({
              address,
              locStartLine,
              locStartCol,
              locEndLine,
              locEndCol,
            }) => ({
              range: {
                startLineNumber: locStartLine,
                startColumn: locStartCol,
                endLineNumber: locEndLine,
                endColumn: locEndCol,
              },
              url: `/explore/${chain}/${address}`,
              tooltip: address,
            })
          );

          return { links };
        },
        resolveLink: (link) => {
          if (editor) {
            editor.setPosition({
              lineNumber: link.range.startLineNumber,
              column: link.range.startColumn,
            });
            editor.revealLineInCenter(link.range.startLineNumber);
          }
          return link;
        },
      });
    }
  }, [index, parsedData]); // Dependency array includes taskid to refetch if it changes

  const handleEditorDidMount = React.useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
      monacoRef.current = { editor, monaco };

      setInstance(monaco);
      setEditor(editor);

      monaco.languages.register({ id: language });
      monaco.editor.defineTheme('blockscout-light', themes.light);
      monaco.editor.defineTheme('blockscout-dark', themes.dark);
      monaco.editor.setTheme('blockscout-dark');

      const loadedModels = monaco.editor.getModels();
      const loadedModelsPaths = loadedModels.map((model) => model.uri.path);
      const newModels = data
        .slice(1)
        .filter((file) => !loadedModelsPaths.includes(file.file_path))
        .map((file) =>
          monaco.editor.createModel(
            file.source_code,
            'sol',
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

      editor.addAction({
        id: 'close-tab',
        label: 'Close current tab',
        keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyW],
        contextMenuGroupId: 'navigation',
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
              : data[index]?.file_path === path;

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

  if (data.length < 1) {
    return (
      <div className="flex justify-center items-center h-[600px] w-full">
        <p className="text-white">No source code found</p>
      </div>
    );
  }
  if (data.length === 1) {
    return (
      <div className="h-[600px] w-full">
        <MonacoEditor
          className="editor-container"
          language={'sol'}
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
    <div className="relative pr-[250px] bg-background-secondary">
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
          language={'sol'}
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
