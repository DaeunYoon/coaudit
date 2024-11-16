'use client';
import { useEffect, useState } from 'react';
import { ParsedInformation } from '@/types';

export default function Test() {
  const address = '0x000000000022D473030F116dDEE9F6B43aC78BA3';
  const chain = 'ethereum';
  const [parsedInfos, setParsedInfo] = useState<
    ParsedInformation | undefined
  >();
  const [isLoadingParsedInfo, setIsLoadingParsedInfo] = useState(false);

  useEffect(() => {
    setIsLoadingParsedInfo(true);
    fetch(`/api/contract/parse/${chain}/${address}`)
      .then((res) => res.json())
      .then((data) => {
        setParsedInfo(data.data);
      })
      .finally(() => {
        setIsLoadingParsedInfo(false);
      });
  }, []);

  return (
    <div>
      {isLoadingParsedInfo ? (
        <p>Loading...</p>
      ) : (
        <pre>{JSON.stringify(parsedInfos, null, 2)}</pre>
      )}
    </div>
  );
}
