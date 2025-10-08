
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      // Skip check for certain paths
      const skipPaths = ['/onboarding', '/auth/login', '/auth/register', '/'];
      if (skipPaths.includes(pathname || '')) {
        setChecking(false);
        return;
      }

      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/user-preferences');
          if (response.ok) {
            const preferences = await response.json();
            
            // If no preferences or onboarding not completed, redirect to onboarding
            if (!preferences || !preferences.onboardingCompleted) {
              router.replace('/onboarding');
              return;
            }
          }
        } catch (error) {
          console.error('Error checking onboarding:', error);
        }
      }
      
      setChecking(false);
    };

    if (status !== 'loading') {
      checkOnboarding();
    }
  }, [status, pathname, router]);

  if (status === 'loading' || checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
