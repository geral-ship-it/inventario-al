"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function QrLabel({ valor, nome }: { valor: string; nome: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(valor, { width: 160, margin: 1 })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [valor]);

  return (
    <div className="flex flex-col items-center gap-1 border border-slate-200 rounded-md p-2 print:break-inside-avoid">
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={dataUrl} alt={`QR code ${nome}`} className="w-24 h-24" />
      ) : (
        <div className="w-24 h-24 bg-slate-100 animate-pulse rounded" />
      )}
      <p className="text-[11px] text-center font-medium leading-tight">{nome}</p>
    </div>
  );
}
