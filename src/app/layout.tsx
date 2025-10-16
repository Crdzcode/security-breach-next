import "./globals.css";
import { SocketProvider } from "@/components/SocketProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  );
}
