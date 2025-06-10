
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

      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user data:', error);
        return;
      }

      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          avatar_url: publicUrl,
          full_name: user?.user_metadata?.full_name,
          updated_at: new Date().toISOString(),
        });

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(publicUrl);
      toast({
        title: "Foto atualizada!",
        description: "Sua foto de perfil foi salva com sucesso.",
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
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
