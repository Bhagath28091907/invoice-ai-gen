-- Remove all payment-related functionality

-- Drop subscriptions table (not needed without payments)
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- Clean up user_credits table - remove payment-related columns
ALTER TABLE public.user_credits 
DROP COLUMN IF EXISTS is_unlimited CASCADE,
DROP COLUMN IF EXISTS unlimited_expires_at CASCADE,
DROP COLUMN IF EXISTS total_credits_purchased CASCADE;

-- Update the user_credits UPDATE policy to be simpler
-- Users can only update their credits_remaining (for testing purposes)
DROP POLICY IF EXISTS "Users can update non-sensitive credit fields" ON public.user_credits;

CREATE POLICY "Users cannot update credits"
ON public.user_credits
FOR UPDATE
USING (false)
WITH CHECK (false);

-- Note: Only edge functions or admin operations should update credits now