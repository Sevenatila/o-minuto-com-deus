
'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { ThemeProvider } from './theme-provider';
import { OnboardingCheck } from './onboarding-check';
import { BottomNav } from './bottom-nav';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange={false}
      >
        <OnboardingCheck>
          <div className="pb-16 md:pb-0">
            {children}
          </div>
          <BottomNav />
        </OnboardingCheck>
      </ThemeProvider>
    </SessionProvider>
  );
}
