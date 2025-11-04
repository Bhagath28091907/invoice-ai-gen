-- Add category and default values to custom_items table
ALTER TABLE custom_items 
ADD COLUMN category text NOT NULL DEFAULT 'namkeen' CHECK (category IN ('namkeen', 'chips')),
ADD COLUMN default_hsn text,
ADD COLUMN default_rate numeric DEFAULT 0,
ADD COLUMN default_gst numeric DEFAULT 0,
ADD COLUMN default_uom text DEFAULT 'BOX';

-- Add index for better performance when filtering by category
CREATE INDEX idx_custom_items_category ON custom_items(user_id, category);