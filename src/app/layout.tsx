import type { Metadata } from "next";
import "./globals.css";
import AppChrome from "@/components/AppChrome";
import SyncProvider from "@/components/SyncProvider";

export const metadata: Metadata = {
  title: "InventÃ¡rio AL",
  description: "GestÃ£o de inventÃ¡rio, arrecadaÃ§Ãµes e compras para alojamento local",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-PT" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <SyncProvider>
          <AppChrome>{children}</AppChrome>
        </SyncProvider>
      </body>
    </html>
  );
}
