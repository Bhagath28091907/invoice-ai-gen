-- Add UPDATE and DELETE policies for invoices table
-- This allows users to manage their own invoices
CREATE POLICY "Users can update their own invoices"
ON public.invoices
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices"
ON public.invoices
FOR DELETE
USING (auth.uid() = user_id);

-- Restrict user_credits UPDATE policy to prevent direct credit manipulation
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can update their own credits" ON public.user_credits;

-- Create a more restrictive policy that prevents users from directly modifying sensitive fields
-- Users should not be able to update credits_remaining, is_unlimited, or unlimited_expires_at directly
-- These should only be modified through edge functions with service role
CREATE POLICY "Users can update non-sensitive credit fields"
ON public.user_credits
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  -- Prevent modification of sensitive credit fields
  credits_remaining = (SELECT credits_remaining FROM user_credits WHERE user_id = auth.uid()) AND
  is_unlimited = (SELECT is_unlimited FROM user_credits WHERE user_id = auth.uid()) AND
  (unlimited_expires_at IS NOT DISTINCT FROM (SELECT unlimited_expires_at FROM user_credits WHERE user_id = auth.uid())) AND
  total_credits_purchased = (SELECT total_credits_purchased FROM user_credits WHERE user_id = auth.uid())
);