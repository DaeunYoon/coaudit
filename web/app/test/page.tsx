'use client';
import { useEffect, useState } from 'react';
import { ParsedInformation } from '@/types';

export default function Test() {
  const address = '0xBE1cE564574377Acb17C2b7628E4F6dd38067a55';
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
