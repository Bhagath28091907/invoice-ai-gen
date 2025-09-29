-- Add items_left column to invoice items
-- Note: Since invoice_data is stored as JSONB, we don't need to modify the table structure
-- The items_left field will be stored within the JSONB data structure

-- First, let's check if we need to update any existing invoice data structure
-- This is mainly for documentation purposes as the change will be handled in the application code