"use client";

import { useEffect, useId, useRef, useState } from "react";

interface Props {
  onResult: (texto: string) => void;
}

/**
 * Leitor de QR code pela câmara do telemóvel/computador.
 * Usa a biblioteca html5-qrcode (carregada apenas no browser).
 * Em ambientes sem câmara disponível (ex: pré-visualização), mostra
 * automaticamente um aviso e o utilizador pode usar a pesquisa manual
 * ao lado, que funciona sempre.
 */
export default function QrScanner({ onResult }: Props) {
  const reactId = useId();
  const containerId = `qr-reader-${reactId.replace(/[:]/g, "")}`;
  const [ativo, setAtivo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  async function iniciar() {
    setErro(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        (decodedText) => {
          onResult(decodedText);
        },
        undefined
      );
      setAtivo(true);
    } catch {
      setErro(
        "Não foi possível aceder à câmara neste dispositivo/navegador. Usa a pesquisa manual ao lado."
      );
      setAtivo(false);
    }
  }

  async function parar() {
    try {
      await scannerRef.current?.stop();
    } catch {
      /* noop */
    }
    setAtivo(false);
  }

  return (
    <div className="border border-slate-200 rounded-lg p-3 bg-white">
      <div id={containerId} className="w-full max-w-xs mx-auto" />
      {!ativo && (
        <button
          onClick={iniciar}
          className="w-full mt-2 rounded-md bg-slate-900 text-white text-sm font-medium py-2 hover:bg-slate-700"
        >
          Ativar câmara e ler QR code
        </button>
      )}
      {ativo && (
        <button
          onClick={parar}
          className="w-full mt-2 rounded-md bg-red-600 text-white text-sm font-medium py-2 hover:bg-red-700"
        >
          Parar leitura
        </button>
      )}
      {erro && <p className="text-xs text-amber-600 mt-2">{erro}</p>}
    </div>
  );
}
