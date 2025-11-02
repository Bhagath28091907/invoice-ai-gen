-- Create routes table
CREATE TABLE public.routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  route_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Create policies for routes
CREATE POLICY "Users can view their own routes"
ON public.routes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own routes"
ON public.routes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routes"
ON public.routes
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routes"
ON public.routes
FOR DELETE
USING (auth.uid() = user_id);

-- Create route_customers table
CREATE TABLE public.route_customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_gst_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.route_customers ENABLE ROW LEVEL SECURITY;

-- Create policies for route_customers
CREATE POLICY "Users can view their own route customers"
ON public.route_customers
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own route customers"
ON public.route_customers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own route customers"
ON public.route_customers
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own route customers"
ON public.route_customers
FOR DELETE
USING (auth.uid() = user_id);