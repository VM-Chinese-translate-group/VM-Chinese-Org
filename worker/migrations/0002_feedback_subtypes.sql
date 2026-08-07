ALTER TABLE feedback_items ADD COLUMN subtypes TEXT NOT NULL DEFAULT '';

UPDATE feedback_items
SET subtypes = subtype
WHERE subtypes = '';
