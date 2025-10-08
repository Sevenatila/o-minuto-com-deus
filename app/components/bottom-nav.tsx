
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Settings, Wind, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  // Não mostrar bottom nav nas páginas de auth e onboarding
  if (pathname?.startsWith('/auth') || pathname?.startsWith('/onboarding') || pathname === '/') {
    return null;
  }

  const navItems = [
    { href: '/home', label: 'Início', icon: Home },
    { href: '/leitura', label: 'Leitura', icon: BookOpen },
    { href: '/devocional-ativo', label: 'Ore', icon: Wind },
    { href: '/fale-com-biblia', label: 'Chat', icon: MessageSquare },
    { href: '/configuracoes', label: 'Config', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {navItems?.map((item) => {
          const Icon = item?.icon;
          const isActive = pathname === item?.href;
          
          return (
            <Link
              key={item?.href}
              href={item?.href ?? '/home'}
              className={cn(
                'flex flex-col items-center justify-center min-w-[64px] px-2 py-1.5 rounded-lg transition-all',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground active:bg-muted'
              )}
            >
              <Icon 
                className={cn(
                  'h-6 w-6 mb-0.5 transition-transform',
                  isActive ? 'scale-110' : ''
                )} 
              />
              <span className={cn(
                'text-[10px] font-medium',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}>
                {item?.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
