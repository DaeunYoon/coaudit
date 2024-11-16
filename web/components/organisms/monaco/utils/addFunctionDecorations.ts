import type * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import type { AddressInfo } from '@/types';

export default function addFunctionDecorations(addresses: AddressInfo[]) {
  const options: monaco.editor.IModelDecorationOptions = {
    inlineClassName: 'highlight',
  };

  //Add mapping of all local functions into 1 map
  const namedImportDecorations: Array<monaco.editor.IModelDeltaDecoration> =
    addresses.map(({ locStartLine, locStartCol, locEndLine, locEndCol }) => ({
      range: {
        startColumn: locStartCol,
        endColumn: locEndCol,
        endLineNumber: locEndLine,
        startLineNumber: locStartLine,
      },
      options,
    }));

  return namedImportDecorations;
}
