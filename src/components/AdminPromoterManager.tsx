
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
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

const AdminPromoterManager = () => {
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [loading, setLoading] = useState(true);
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
      
      // Type the data properly to match our interface
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoters();
  }, []);

  const handleCreatePromoter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        user_metadata: {
          full_name: formData.full_name,
        },
        email_confirm: true, // Confirma automaticamente o email
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Usuário não foi criado');
      }

      // 2. Criar registro na tabela promoters (o promoter_code será gerado automaticamente pelo trigger)
      const { error: promoterError } = await supabase
        .from('promoters')
        .insert({
          email: formData.email,
          full_name: formData.full_name,
          company: formData.company || null,
          phone: formData.phone || null,
          user_id: authData.user.id,
          status: 'active',
        });

      if (promoterError) throw promoterError;

      // 3. Enviar email com as credenciais (opcional - você pode implementar uma edge function para isso)
      // Por enquanto, apenas mostramos um toast com sucesso

      toast({
        title: "Promoter criado com sucesso!",
        description: `${formData.full_name} foi cadastrado como promoter. Credenciais: ${formData.email}`,
      });

      // Limpar formulário e fechar modal
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
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Promoter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Promoter</DialogTitle>
              <DialogDescription>
                Cadastre um novo promoter com email e senha. Ele receberá acesso imediato ao FitAI.
              </DialogDescription>
            </DialogHeader>
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
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Promoters</CardTitle>
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
                  <TableHead>Telefone</TableHead>
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
                    <TableCell>{promoter.phone || '-'}</TableCell>
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
    </div>
  );
};

export default AdminPromoterManager;
