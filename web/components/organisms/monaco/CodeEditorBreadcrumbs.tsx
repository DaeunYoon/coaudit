import stripLeadingSlash from "@/utils/stripLeadingSlash";
import React from "react";

interface Props {
  path: string;
}

const CodeEditorBreadcrumbs = ({ path }: Props) => {
  const chunks = stripLeadingSlash(path).split("/");

  return (
    <div className="text-breadcrumbs-foreground bg-editor-background pl-4 pr-2 py-1 flex-wrap items-center text-sm flex gap-2">
      {chunks.map((chunk, index) => {
        return (
          <React.Fragment key={index}>
            {index !== 0 && (
              <div className="codicon codicon-breadcrumb-separator w-fit flex items-center relative top-[-4px]">
                {">"}
              </div>
            )}
            <div>{chunk}</div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default React.memo(CodeEditorBreadcrumbs);
