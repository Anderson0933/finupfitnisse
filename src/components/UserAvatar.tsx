
import React, { useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserAvatarProps {
  user: User | null;
  hasAccess: boolean;
}

const UserAvatar = ({ user, hasAccess }: UserAvatarProps) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (user) {
      getProfile();
    }
  }, [user]);

  const getProfile = async () => {
    try {
      if (!user) return;
      
      console.log('🔍 Buscando perfil do usuário:', user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao carregar dados do usuário:', error);
        return;
      }

      console.log('✅ Dados do perfil:', data);

      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
        console.log('📸 Avatar URL encontrada:', data.avatar_url);
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao carregar dados do usuário:', error);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      console.log('🚀 Iniciando upload do avatar...');

      if (!event.target.files || event.target.files.length === 0) {
        console.log('❌ Nenhum arquivo selecionado');
        return;
      }

      const file = event.target.files[0];
      console.log('📁 Arquivo selecionado:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      if (!user) {
        console.error('❌ Usuário não está logado');
        toast({
          title: "Erro",
          description: "Você precisa estar logado para fazer upload.",
          variant: "destructive",
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = fileName;

      console.log('📂 Fazendo upload para:', filePath);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('❌ Erro no upload para storage:', uploadError);
        throw uploadError;
      }

      console.log('✅ Upload concluído:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('🔗 URL pública gerada:', publicUrl);

      // Check if profile exists first
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      console.log('🔍 Perfil existente:', existingProfile);

      if (checkError) {
        console.error('❌ Erro ao verificar perfil existente:', checkError);
        throw checkError;
      }

      // Update or insert profile with avatar URL
      if (existingProfile) {
        console.log('🔄 Atualizando perfil existente...');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            avatar_url: publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('❌ Erro ao atualizar perfil:', updateError);
          throw updateError;
        }
      } else {
        console.log('➕ Criando novo perfil...');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            avatar_url: publicUrl,
            full_name: user.user_metadata?.full_name || null,
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('❌ Erro ao inserir perfil:', insertError);
          throw insertError;
        }
      }

      setAvatarUrl(publicUrl);
      console.log('🎉 Avatar atualizado com sucesso!');
      
      toast({
        title: "Foto atualizada!",
        description: "Sua foto de perfil foi salva com sucesso.",
      });
    } catch (error: any) {
      console.error('💥 Erro geral no upload do avatar:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível fazer upload da foto.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarClick = () => {
    if (!hasAccess) {
      toast({
        title: "Recurso Bloqueado",
        description: "Renove sua assinatura para personalizar seu perfil.",
        variant: "destructive",
      });
      return;
    }
    fileInputRef.current?.click();
  };

  const getInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="relative">
      <Avatar 
        className="h-16 w-16 md:h-24 md:w-24 cursor-pointer border-4 border-white shadow-lg hover:shadow-xl transition-shadow" 
        onClick={handleAvatarClick}
      >
        <AvatarImage src={avatarUrl || undefined} alt="Avatar do usuário" />
        <AvatarFallback className="bg-blue-600 text-white text-lg md:text-2xl font-bold">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      
      {hasAccess && (
        <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1.5 shadow-lg">
          <Camera className="h-3 w-3 md:h-4 md:w-4 text-white" />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={uploadAvatar}
        disabled={uploading || !hasAccess}
        className="hidden"
      />
    </div>
  );
};

export default UserAvatar;
