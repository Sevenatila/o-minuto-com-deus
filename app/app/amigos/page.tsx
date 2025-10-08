
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Users, UserPlus, Search, Check, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StreakBadge from '@/components/streak-badge';
import toast from 'react-hot-toast';

export default function AmigosPage() {
  const router = useRouter();
  const { data: session, status } = useSession() || {};
  
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchFriends();
      fetchPendingRequests();
    }
  }, [status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchFriends = async () => {
    try {
      const res = await fetch('/api/friends?type=accepted');
      if (res.ok) {
        const data = await res.json();
        setFriends(data);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await fetch('/api/friends?type=pending');
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const searchUsers = async () => {
    setSearching(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId }),
      });

      if (res.ok) {
        toast.success('Pedido enviado!');
        searchUsers(); // Atualiza os resultados
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erro ao enviar pedido');
      }
    } catch (error) {
      toast.error('Erro ao enviar pedido');
    }
  };

  const respondToRequest = async (friendshipId: string, action: 'accept' | 'reject') => {
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        toast.success(action === 'accept' ? 'Amizade aceita!' : 'Pedido rejeitado');
        fetchFriends();
        fetchPendingRequests();
      }
    } catch (error) {
      toast.error('Erro ao processar pedido');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Amigos</h1>
      </div>

      <Tabs defaultValue="friends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="friends">
            Meus Amigos ({friends.length})
          </TabsTrigger>
          <TabsTrigger value="search">
            Buscar Amigos
            {pendingRequests.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-4">
          {friends.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Você ainda não tem amigos.</p>
                <p className="text-sm mt-2">Busque por amigos na aba "Buscar Amigos"</p>
              </CardContent>
            </Card>
          ) : (
            friends.map((friendship) => (
              <Card key={friendship.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={friendship.friend.image} />
                        <AvatarFallback>
                          {friendship.friend.name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{friendship.friend.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {friendship.friend.email}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            🔥 {friendship.friend.currentStreak} dias
                          </span>
                          <span className="text-xs text-muted-foreground">
                            • {friendship.friend.totalDevocionais} devocionais
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          {/* Pedidos Pendentes */}
          {pendingRequests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pedidos Recebidos</h3>
              {pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.sender.image} />
                          <AvatarFallback>
                            {request.sender.name?.[0] || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{request.sender.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.sender.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => respondToRequest(request.id, 'accept')}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => respondToRequest(request.id, 'reject')}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Recusar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Busca */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Buscar Usuários</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {searching && (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              </div>
            )}

            {!searching && searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.image} />
                            <AvatarFallback>
                              {user.name?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div>
                          {user.friendshipStatus === 'none' && (
                            <Button
                              size="sm"
                              onClick={() => sendFriendRequest(user.id)}
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Adicionar
                            </Button>
                          )}
                          {user.friendshipStatus === 'friends' && (
                            <span className="text-sm text-muted-foreground">✓ Amigos</span>
                          )}
                          {user.friendshipStatus === 'sent' && (
                            <span className="text-sm text-muted-foreground">Pendente</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhum usuário encontrado
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
