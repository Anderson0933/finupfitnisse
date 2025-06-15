
-- Habilitar as extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Criar cron job para executar a limpeza de notificações diariamente às 2:00 AM
SELECT cron.schedule(
  'cleanup-old-notifications',
  '0 2 * * *', -- Todo dia às 2:00 AM
  $$
  SELECT
    net.http_post(
        url:='https://xdghmaeiqzhhdgsdvohk.supabase.co/functions/v1/cleanup-notifications',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkZ2htYWVpcXpoaGRnc2R2b2hrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzkzMzQ5MCwiZXhwIjoyMDYzNTA5NDkwfQ.6nBLR8xz2QVZoQNhJYk1YmZRmhwhyW6NG82LUn9-EFE"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Verificar se o cron job foi criado
SELECT * FROM cron.job WHERE jobname = 'cleanup-old-notifications';
