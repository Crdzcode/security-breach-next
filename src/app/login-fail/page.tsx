import Link from 'next/link';
import { Scanlines } from '@/components/Scanlines';
import styles from './page.module.css';

export default function LoginFailPage() {
  return (
    <div className={styles.page}>
      <Scanlines variant="red" />
      <div className={styles.terminal}>
        <h1 className={styles.title}>ACESSO NEGADO</h1>
        <p>Codinome ou senha inválido.</p>
        <p>Suas credenciais não foram reconhecidas pelo sistema.</p>
        <Link href="/" className={styles.backLink}>
          [TENTAR NOVAMENTE]
        </Link>
        <p className={styles.footer}>Protocolo de segurança v7.04</p>
      </div>
    </div>
  );
}
