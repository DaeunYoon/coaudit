import { ParsedInformation } from "@/types";
import type * as monaco from "monaco-editor/esm/vs/editor/editor.api";

export default function addFunctionDecorations(
  model: monaco.editor.ITextModel,
  parsedData: ParsedInformation[]
) {
  const options: monaco.editor.IModelDecorationOptions = {
    inlineClassName: "function-link",
    hoverMessage: {
      value: "Cmd/Win + click to open file",
    },
  };

  const namedImportMatches = model.findMatches(
    "pragma",
    false,
    false,
    false,
    null,
    true
  );

  //Add mapping of all local functions into 1 map

  console.log("namedImportMatches", namedImportMatches);
  const namedImportDecorations: Array<monaco.editor.IModelDeltaDecoration> =
    namedImportMatches.map(({ range, matches }) => ({
      range: {
        startColumn: 8,
        endColumn: 29,
        endLineNumber: 24,
        startLineNumber: 24,
        range: {
          startColumn: 1036,
          endColumn: 1057,
        },
      },
      options,
    }));
  console.log("namedImportDecorations", namedImportDecorations);
  model.deltaDecorations([], namedImportDecorations);
}
