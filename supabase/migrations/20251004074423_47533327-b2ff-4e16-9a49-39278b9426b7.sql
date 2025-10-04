-- Security Fix: Prevent users from bypassing payment by manipulating subscription data

-- 1. Create a trigger function to validate user-inserted subscriptions
CREATE OR REPLACE FUNCTION public.validate_user_subscription_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only apply validation when NOT using service role
  -- Service role calls will have a different session context
  IF current_setting('request.jwt.claims', true)::json->>'role' = 'authenticated' THEN
    -- Force status to be 'pending' for user-created subscriptions
    NEW.status := 'pending';
    
    -- Force reasonable expiration date (not in the past, not too far in future)
    -- Set expires_at to NULL initially, will be set by payment verification
    NEW.expires_at := now() + interval '1 hour';
    
    -- Ensure amount is not zero or negative
    IF NEW.amount <= 0 THEN
      RAISE EXCEPTION 'Invalid subscription amount';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. Create trigger on subscriptions table
DROP TRIGGER IF EXISTS validate_subscription_insert ON public.subscriptions;
CREATE TRIGGER validate_subscription_insert
  BEFORE INSERT ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_user_subscription_insert();

-- 3. Add explicit policy to DENY user updates (makes security intention clear)
CREATE POLICY "Users cannot update subscriptions"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (false);

-- 4. Add explicit policy to DENY user deletes
CREATE POLICY "Users cannot delete subscriptions"
ON public.subscriptions
FOR DELETE
TO authenticated
USING (false);

-- Add helpful comment
COMMENT ON TABLE public.subscriptions IS 'Subscription records. Users can only INSERT with pending status. Only system/edge functions (via service role) can update to completed status.';