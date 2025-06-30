
-- Allow admins to insert promoter records
CREATE POLICY "Admins can insert promoters" 
  ON public.promoters 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'casimiroanderson45@gmail.com'
    )
  );

-- Allow admins to view all promoters
CREATE POLICY "Admins can view all promoters" 
  ON public.promoters 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'casimiroanderson45@gmail.com'
    )
  );

-- Allow admins to update all promoters
CREATE POLICY "Admins can update all promoters" 
  ON public.promoters 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'casimiroanderson45@gmail.com'
    )
  );

-- Allow admins to delete all promoters
CREATE POLICY "Admins can delete all promoters" 
  ON public.promoters 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'casimiroanderson45@gmail.com'
    )
  );
