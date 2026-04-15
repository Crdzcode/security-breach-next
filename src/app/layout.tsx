import type { Metadata } from 'next';
import './globals.css';
import { SocketProvider } from '@/components/SocketProvider';
import { GameNavigationHandler } from '@/components/GameNavigationHandler';

export const metadata: Metadata = {
  title: 'Falha de Segurança',
  description: 'Sistema de segurança restrito — acesso monitorado.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <SocketProvider>
          <GameNavigationHandler />
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}
