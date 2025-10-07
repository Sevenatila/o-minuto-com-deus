
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Settings, Wind, Crown, Calendar, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import StreakBadge from './streak-badge';

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isProMember, setIsProMember] = useState(false);

  useEffect(() => {
    async function checkSubscription() {
      if (session?.user) {
        try {
          const res = await fetch('/api/subscription-status');
          if (res.ok) {
            const data = await res.json();
            setIsProMember(data.isProMember);
          }
        } catch (error) {
          console.error('Erro ao verificar assinatura:', error);
        }
      }
    }
    checkSubscription();
  }, [session]);

  const links = [
    { href: '/home', label: 'Início', icon: Home },
    { href: '/leitura', label: 'Leitura', icon: BookOpen },
    { href: '/devocional-ativo', label: 'Respira & Ore', icon: Wind },
    { href: '/fale-com-biblia', label: 'Chat IA', icon: MessageSquare },
    { href: '/planos-com-amigos', label: 'Planos', icon: Calendar },
    { href: '/planos', label: 'Pro', icon: Crown },
    { href: '/configuracoes', label: 'Config', icon: Settings },
  ];

  // Não mostrar navbar nas páginas de auth e onboarding
  if (pathname?.startsWith('/auth') || pathname?.startsWith('/onboarding') || pathname === '/') {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/home" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Minuto com Deus</span>
            {isProMember && (
              <span className="hidden sm:flex items-center gap-1 bg-warning text-warning-foreground text-xs font-semibold px-2 py-1 rounded-full">
                <Crown className="h-3 w-3" />
                PRO
              </span>
            )}
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              {links?.map((link) => {
                const Icon = link?.icon;
                const isActive = pathname === link?.href;
                return (
                  <Link
                    key={link?.href}
                    href={link?.href ?? '/home'}
                    className={cn(
                      'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{link?.label}</span>
                  </Link>
                );
              })}
            </div>
            {session && <StreakBadge />}
          </div>

          {/* Mobile - Apenas mostrar badge Pro e streak */}
          <div className="md:hidden flex items-center gap-2">
            {isProMember && (
              <span className="flex items-center gap-1 bg-warning text-warning-foreground text-xs font-semibold px-2 py-1 rounded-full">
                <Crown className="h-3 w-3" />
                PRO
              </span>
            )}
            {session && <StreakBadge />}
          </div>
        </div>
      </div>
    </nav>
  );
}
