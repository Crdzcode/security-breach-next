interface ScanlinesProps {
  variant?: 'green' | 'red';
}

export function Scanlines({ variant = 'green' }: ScanlinesProps) {
  return <div className={`scanlines scanlines--${variant}`} aria-hidden="true" />;
}
