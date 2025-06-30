import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Eye, EyeOff, Search, UserPlus, Users, Crown } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Promoter {
  id: string;
  email: string;
  full_name: string;
  company?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending';
  promoter_code: string;
  created_at: string;
  user_id?: string;
}

interface AvailableUser {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

const AdminPromoterManager = () => {
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    company: '',
    phone: '',
  });

  const fetchPromoters = async () => {
    try {
      const { data, error } = await supabase
        .from('promoters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedPromoters: Promoter[] = (data || []).map(promoter => ({
        ...promoter,
        status: promoter.status as 'active' | 'inactive' | 'pending'
      }));
      
      setPromoters(typedPromoters);
    } catch (error: any) {
      console.error('Erro ao buscar promoters:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os promoters",
        variant: "destructive",
      });
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      console.log('🔍 Buscando usuários disponíveis para promoção...');
      
      // Buscar todos os perfis de usuários
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (profilesError) {
        console.error('Erro ao buscar profiles:', profilesError);
        throw profilesError;
      }

      console.log('📋 Perfis encontrados:', profilesData?.length || 0);

      // Filtrar usuários que não são promoters
      const promoterUserIds = promoters.map(p => p.user_id).filter(Boolean);
      console.log('🚫 IDs de promoters a excluir:', promoterUserIds);

      const availableUsersList: AvailableUser[] = (profilesData || [])
        .filter(profile => !promoterUserIds.includes(profile.id))
        .map(profile => ({
          id: profile.id,
          email: `user-${profile.id.slice(0, 8)}@...`, // Placeholder, pois não temos acesso direto ao email
          full_name: profile.full_name || 'Nome não disponível',
          created_at: new Date().toISOString(),
        }));

      console.log('✅ Usuários disponíveis:', availableUsersList.length);
      setAvailableUsers(availableUsersList);

    } catch (error: any) {
      console.error('Erro ao buscar usuários disponíveis:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários disponíveis",
        variant: "destructive",
      });
      setAvailableUsers([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchPromoters();
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    fetchAvailableUsers();
  }, [promoters]);

  const handleCreatePromoter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        user_metadata: {
          full_name: formData.full_name,
        },
        email_confirm: true,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Usuário não foi criado');
      }

      const { error: promoterError } = await supabase
        .from('promoters')
        .insert({
          email: formData.email,
          full_name: formData.full_name,
          company: formData.company || null,
          phone: formData.phone || null,
          user_id: authData.user.id,
          status: 'active',
          promoter_code: '',
        });

      if (promoterError) throw promoterError;

      toast({
        title: "Promoter criado com sucesso!",
        description: `${formData.full_name} foi cadastrado como promoter.`,
      });

      setFormData({
        email: '',
        password: '',
        full_name: '',
        company: '',
        phone: '',
      });
      setIsDialogOpen(false);
      fetchPromoters();

    } catch (error: any) {
      console.error('Erro ao criar promoter:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o promoter",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja promover ${userName} a promoter?`)) return;

    try {
      // Buscar dados do usuário
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { error } = await supabase
        .from('promoters')
        .insert({
          email: profileData?.id ? `user-${profileData.id.slice(0, 8)}@system.local` : 'unknown@system.local',
          full_name: profileData?.full_name || 'Usuário Promovido',
          user_id: userId,
          status: 'active',
          promoter_code: '',
        });

      if (error) throw error;

      toast({
        title: "Usuário promovido!",
        description: `${userName} agora é um promoter ativo.`,
      });
      
      fetchPromoters();
    } catch (error: any) {
      console.error('Erro ao promover usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível promover o usuário",
        variant: "destructive",
      });
    }
  };

  const handleDeletePromoter = async (promoterId: string) => {
    if (!confirm('Tem certeza que deseja excluir este promoter?')) return;

    try {
      const { error } = await supabase
        .from('promoters')
        .delete()
        .eq('id', promoterId);

      if (error) throw error;

      toast({
        title: "Promoter excluído",
        description: "O promoter foi removido com sucesso",
      });
      
      fetchPromoters();
    } catch (error: any) {
      console.error('Erro ao excluir promoter:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o promoter",
        variant: "destructive",
      });
    }
  };

  // Filtrar usuários baseado no termo de busca
  const filteredUsers = availableUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.id.toLowerCase().includes(searchLower)
    );
  });

  if (loading && promoters.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Promoters</h2>
          <p className="text-muted-foreground">
            Gerencie promoters que têm acesso gratuito ao FitAI
          </p>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Promoters Ativos ({promoters.length})
          </TabsTrigger>
          <TabsTrigger value="promote" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Promover Usuários ({availableUsers.length})
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Criar Novo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Promoters Ativos</CardTitle>
              <CardDescription>
                Total: {promoters.length} promoters cadastrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {promoters.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum promoter cadastrado ainda.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promoters.map((promoter) => (
                      <TableRow key={promoter.id}>
                        <TableCell className="font-medium">{promoter.full_name}</TableCell>
                        <TableCell>{promoter.email}</TableCell>
                        <TableCell>{promoter.company || '-'}</TableCell>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-sm">
                            {promoter.promoter_code}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={promoter.status === 'active' ? 'default' : 'secondary'}
                          >
                            {promoter.status === 'active' ? 'Ativo' : 
                             promoter.status === 'pending' ? 'Pendente' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(promoter.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePromoter(promoter.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promote">
          <Card>
            <CardHeader>
              <CardTitle>Promover Usuários Existentes</CardTitle>
              <CardDescription>
                Busque e promova usuários já cadastrados no sistema para promoters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <Input
                  placeholder="Buscar por nome ou ID do usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button 
                  onClick={fetchAvailableUsers}
                  variant="outline"
                  size="sm"
                >
                  Atualizar Lista
                </Button>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm 
                    ? 'Nenhum usuário encontrado com esse termo.' 
                    : availableUsers.length === 0 
                      ? 'Nenhum usuário disponível para promoção.'
                      : 'Digite um termo para buscar usuários.'
                  }
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>ID do Usuário</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell className="font-mono text-sm">{user.id}</TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handlePromoteUser(user.id, user.full_name || 'Usuário')}
                            size="sm"
                            className="gap-2"
                          >
                            <Crown className="h-4 w-4" />
                            Promover
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Promoter</CardTitle>
              <CardDescription>
                Cadastre um novo promoter com email e senha. Ele receberá acesso imediato ao FitAI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePromoter} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Senha do promoter"
                      minLength={6}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Nome completo do promoter"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa (opcional)</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Nome da empresa"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone (opcional)</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Promoter
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPromoterManager;
