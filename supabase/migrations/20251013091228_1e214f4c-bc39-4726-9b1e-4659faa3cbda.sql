-- Create custom_items table for user-created items
CREATE TABLE public.custom_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_name text NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_name)
);

-- Enable Row Level Security
ALTER TABLE public.custom_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_items
CREATE POLICY "Users can view their own custom items"
ON public.custom_items
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom items"
ON public.custom_items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom items"
ON public.custom_items
FOR DELETE
USING (auth.uid() = user_id);