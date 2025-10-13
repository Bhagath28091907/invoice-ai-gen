-- Add UPDATE policy for custom_items table
CREATE POLICY "Users can update their own custom items"
ON public.custom_items
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);