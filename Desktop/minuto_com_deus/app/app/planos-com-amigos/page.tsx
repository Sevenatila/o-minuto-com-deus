
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PlanosComAmigosPage() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona para a página principal
    router.replace('/');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Redirecionando...</p>
    </div>
  );
}
