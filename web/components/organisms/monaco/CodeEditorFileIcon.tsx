import { solidityIconUrl } from "@/utils/constants";
import Image from "next/image";
import React from "react";

interface Props {
  className?: string;
  fileName: string;
}

const CodeEditorFileIcon = ({ className, fileName }: Props) => {
  const name = (() => {
    if (/.vy$/.test(fileName)) {
      return "monaco/vyper";
    }

    if (/.sol|.yul$/.test(fileName)) {
      return "monaco/solidity";
    }

    return "monaco/file";
  })();

  return (
    <Image
      src={solidityIconUrl}
      className={className}
      alt={name}
      height={16}
      width={16}
    />
  );
};

export default React.memo(CodeEditorFileIcon);
