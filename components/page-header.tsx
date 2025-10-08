
'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  backHref?: string;
  className?: string;
  action?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  showBackButton = true, 
  backHref = '/home',
  className,
  action 
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className={cn(
      'flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-16 md:top-0 z-40',
      className
    )}>
      <div className="flex items-center gap-3 flex-1">
        {showBackButton && (
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-gray-900 truncate">
          {title}
        </h1>
      </div>
      {action && (
        <div className="flex-shrink-0 ml-2">
          {action}
        </div>
      )}
    </div>
  );
}
