-- Temporarily assign all vehicles to SUV category
-- (Admin will edit individual vehicles later when more categories are added)
UPDATE vehicles
SET body_type = 'SUV'
WHERE body_type IS NULL OR body_type != 'SUV';
